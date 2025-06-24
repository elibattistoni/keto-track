#!/bin/bash
set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Make all scripts in this directory executable (except this runner)
find "$SCRIPT_DIR" -type f -name '*.sh' ! -name '00_run-all.sh' -exec chmod +x {} \;

echo "Running 01_init-db.sh ..."
"$SCRIPT_DIR/01_init-db.sh"

echo "Running 02_db-populate-food-csv.sh ..."
"$SCRIPT_DIR/02_db-populate-food-csv.sh"

echo "Running 03_db-create-users-tables.sh ..."
"$SCRIPT_DIR/03_db-create-users-tables.sh"

echo "Running 04_init-prisma.sh ..."
"$SCRIPT_DIR/04_init-prisma.sh"

echo "Running 05_db-add-mock.users.sh ..."
"$SCRIPT_DIR/05_db-add-mock.users.sh"

echo "All scripts executed successfully."
