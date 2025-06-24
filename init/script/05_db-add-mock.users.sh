#!/bin/bash
set -e

# Seed users with hashed passwords
npx tsx ./init/script/seed_users.ts

echo "Users seeded successfully!"
