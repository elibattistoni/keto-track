#!/bin/bash
set -euo pipefail

# Helper function for error reporting
error_exit() {
  echo "Error on line $1"
  exit 1
}
trap 'error_exit $LINENO' ERR

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
if [ -z "${DB_USER:-}" ] || [ -z "${DB_PASSWORD:-}" ] || [ -z "${DB_NAME:-}" ]; then
  echo "Please set DB_USER, DB_PASSWORD, and DB_NAME in your .env file."
  exit 1
fi

DB_HOST="localhost"
DB_PORT="5432"
ADMIN_DB="postgres"
export PGPASSWORD="$DB_PASSWORD"

# Ensure database exists
DB_EXISTS=$(psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$ADMIN_DB" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | tr -d '[:space:]')
if [ "$DB_EXISTS" != "1" ]; then
  psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$ADMIN_DB" -c "CREATE DATABASE \"$DB_NAME\";"
  echo "Database $DB_NAME was created."
else
  echo "Database $DB_NAME already exists."
fi

echo "Populating database $DB_NAME from CSV files in ./data ..."

# Columns definition
COLUMNS_DEF="
  id SERIAL PRIMARY KEY,
  name_eng TEXT,
  name_ita TEXT,
  total_carbs_g FLOAT,
  net_carbs_g FLOAT,
  fiber_g FLOAT,
  proteins_g FLOAT,
  fats_g FLOAT,
  accuracy FLOAT
"

# Columns for import (must match CSV header order)
COLUMNS_IMPORT="name_eng, name_ita, total_carbs_g, net_carbs_g, fiber_g, proteins_g, fats_g, accuracy"

for csvfile in ./data/*.csv; do
  [ -e "$csvfile" ] || continue

  tablename=$(basename "$csvfile" .csv | tr '[:upper:]' '[:lower:]')

  echo "Processing file: $csvfile"
  echo "Target table: $tablename"

  # Drop table if exists
  psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" -c "DROP TABLE IF EXISTS \"$tablename\" CASCADE;"
  echo "Dropped table (if existed): $tablename"

  # Create table with specified columns
  psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" -c "CREATE TABLE \"$tablename\" ($COLUMNS_DEF);"
  echo "Created table: $tablename"

  # Import CSV data (skip header, columns must match order)
  psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" -c "\copy \"$tablename\"($COLUMNS_IMPORT) FROM '$csvfile' DELIMITER ',' CSV HEADER;"
  echo "Populated table: $tablename from $csvfile"
done

echo "All tables created and populated."
