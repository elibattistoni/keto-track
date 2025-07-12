#!/bin/bash
set -e

# Load environment variables from .env.local or .env
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "No .env or .env.local file found."
  exit 1
fi

# Allow override of host/port, or use defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
export PGPASSWORD="$DB_PASSWORD"

# SQL schema definition
SQL_SCHEMA=$(cat <<'EOF'
-- Enable UUID generation function
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUM for user roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('admin', 'starter', 'premium');
    END IF;
END$$;

-- 2. Users table (Auth.js/NextAuth.js style, with role)
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMP,
    image TEXT,
    password TEXT,
    role "Role" NOT NULL DEFAULT 'starter'
);

-- 3. Accounts table (OAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE (provider, provider_account_id)
);

-- 4. Sessions table
CREATE TABLE IF NOT EXISTS "Session" (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

-- 5. Verification tokens
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- 6. Password reset tokens
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON "PasswordResetToken"(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON "PasswordResetToken"(token);

-- 7. Meals table
CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    meal_time TIMESTAMP NOT NULL,
    notes TEXT
);

-- 8. Meal_Foods table (many-to-many: meal <-> food)
CREATE TABLE IF NOT EXISTS meal_foods (
    meal_id INT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_id INT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    quantity_g FLOAT NOT NULL,
    PRIMARY KEY (meal_id, food_id)
);

EOF
)

# Run the SQL schema on the database
psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "$SQL_SCHEMA"

echo "Database schema initialized successfully!"
