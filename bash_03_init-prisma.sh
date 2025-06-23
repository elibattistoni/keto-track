#!/bin/bash

set -e

echo "Removing existing prisma directory..."
rm -rf prisma

echo "Initializing Prisma..."
npx prisma init

echo "Ensuring default Prisma client output location..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' '/output *=/d' prisma/schema.prisma
else
  sed -i '/output *=/d' prisma/schema.prisma
fi

echo "Pulling database schema..."
npx prisma db pull

echo "Generating Prisma client..."
npx prisma generate

echo "All done! Prisma has been reset and generated using the default output location."
