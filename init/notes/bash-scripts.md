1. Create a bash script, e.g. reset-prisma.sh with the following content:

Make sure your ⁠.env file (either created by ⁠prisma init or by you) contains the correct ⁠DATABASE_URL before running ⁠db pull.

```bash
#!/bin/bash

set -e

echo "Removing existing prisma directory..."
rm -rf prisma

echo "Initializing Prisma..."
npx prisma init

# Remove 'output' from generator block if it exists
sed -i '/output *=/d' prisma/schema.prisma

echo "Pulling database schema..."
npx prisma db pull

echo "Generating Prisma client..."
npx prisma generate

echo "All done! Prisma has been reset and generated using the default output location."
```

2. Make it executable:

```bash
chmod +x reset-prisma.sh
```

3. Run it from the project root:

```bash
./reset-prisma.sh
```
