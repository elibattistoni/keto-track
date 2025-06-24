#!/bin/bash
set -e

# Load environment variables from .env or .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "No .env or .env.local file found."
  exit 1
fi

# Check required variables
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
  echo "Please set DB_USER, DB_PASSWORD, and DB_NAME in your .env file."
  exit 1
fi

# Defaults
DB_HOST="localhost"
DB_PORT="5432"

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Always connect to the 'postgres' database for admin tasks
ADMIN_DB="postgres"

# Check if database exists
DB_EXISTS=$(psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$ADMIN_DB" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | tr -d '[:space:]')

if [ "$DB_EXISTS" = "1" ]; then
  echo "Database $DB_NAME already exists."
else
  psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$ADMIN_DB" -c "CREATE DATABASE \"$DB_NAME\";"
  echo "Database $DB_NAME was created."
fi

echo "You successfully connected to PostgreSQL as user $DB_USER to the database $DB_NAME."
