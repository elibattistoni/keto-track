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

# Allow override of host/port, or use defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
export PGPASSWORD="$DB_PASSWORD"

# Remove all the tables (clean the db)
echo "Dropping all tables in database $DB_NAME ..."

psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" -c "
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS \"' || r.tablename || '\" CASCADE';
    END LOOP;
END
\$\$;
"

echo "All tables dropped."

# Populate with new data
csvfile="init/data/foods.csv"
tablename="foods"

echo "Populating table '$tablename' in database $DB_NAME from $csvfile ..."

# Columns definition
COLUMNS_DEF="
  id SERIAL PRIMARY KEY,
  name_eng TEXT,
  name_ita TEXT,
  food_category_eng TEXT,
  food_category_ita TEXT,
  calories_kcal FLOAT,
  total_carbs_g FLOAT,
  net_carbs_g FLOAT,
  fiber_g FLOAT,
  proteins_g FLOAT,
  fats_g FLOAT,
  accuracy FLOAT
"

# Columns for import (must match CSV header order)
COLUMNS_IMPORT="name_eng, name_ita, food_category_eng, food_category_ita, calories_kcal, total_carbs_g, net_carbs_g, fiber_g, proteins_g, fats_g, accuracy"

if [ ! -f "$csvfile" ]; then
  echo "CSV file $csvfile not found!"
  exit 1
fi

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

echo "Table '$tablename' created and populated."
