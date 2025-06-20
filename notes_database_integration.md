---
# Step-by-Step: PostgreSQL + Prisma in Next.js
---

## Step 1: Install PostgreSQL Locally

- **Mac:**

```bash
brew install postgresql
brew services start postgresql
```

- **Windows:**
  Download and install from [postgresql.org/download](https://www.postgresql.org/download/).
- **Linux:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

---

## Step 2: Create Your Database

Open a terminal and run:

```bash
psql -U postgres
```

- Default password is usually blank or `postgres` (set during installation).

Create a database:

```sql
CREATE DATABASE nutrition_app;
```

Exit with `\q`.

---

## Step 3: Add Prisma to Your Next.js Project

In your Next.js app folder:

```bash
npm install @prisma/client
npm install prisma --save-dev
```

Initialize Prisma:

```bash
npx prisma init
```

This creates:

- `prisma/schema.prisma` — your database models/config
- `.env` — for secrets and DB connection

---

## Step 4: Configure Database Connection

Open the generated `.env` file and set the connection string:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nutrition_app"
```

- Replace `YOUR_PASSWORD` with your actual Postgres password.
- Never commit this file with real secrets to GitHub!

---

## Step 5: Define Your Data Models

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
  // Add other fields as needed
}

model NutritionValue {
  id       Int    @id @default(autoincrement())
  user     User   @relation(fields: [userId], references: [id])
  userId   Int
  calories Int
  protein  Int
  // Add other fields as needed
}
```

---

## Step 6: Run Migrations

Apply your schema to the database:

```bash
npx prisma migrate dev --name init
```

This creates tables in your Postgres database.

---

## Step 7: Use Prisma Client in Next.js

In your API route (e.g., `app/api/users/route.ts`):

```ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const data = await req.json();
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
    },
  });
  return NextResponse.json(user);
}
```

**Tip:**  
For performance, consider using a singleton pattern for Prisma in development ([see docs](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/nextjs#solution)).

---

## Step 8: Store Secrets Securely

- **Local Development:**  
  Store secrets in `.env` (never commit to version control).
- **Production (Vercel, Railway, etc.):**  
  Set environment variables via the hosting dashboard (never hardcode in code).

**.gitignore** should include:

```
.env
```

---

## Step 9: Query the API from the Frontend

Example (React component):

```js
async function createUser(user) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return res.json();
}
```

---

## Step 10: Deploying

- **Deploy your Next.js app** (e.g., [Vercel](https://vercel.com/)).
- **Provision a managed Postgres database** (e.g., [Supabase](https://supabase.com/), [Railway](https://railway.app/), [Render](https://render.com/)).
- **Set the `DATABASE_URL` environment variable** in your hosting dashboard using the credentials from your managed database.

---

## Summary Table

| Step              | Command/Action                                 |
| :---------------- | :--------------------------------------------- |
| Install Postgres  | `brew install postgresql` or installer         |
| Create DB         | `CREATE DATABASE nutrition_app;`               |
| Add Prisma        | `npm install @prisma/client prisma --save-dev` |
| Init Prisma       | `npx prisma init`                              |
| Configure .env    | `DATABASE_URL="..."`                           |
| Define models     | Edit `prisma/schema.prisma`                    |
| Run migration     | `npx prisma migrate dev --name init`           |
| Use Prisma Client | Import and use in API routes                   |
| Store secrets     | Use `.env` locally, env vars in production     |

---

## Useful Resources

- [Prisma + Next.js Guide](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/nextjs)
- [PostgreSQL Download](https://www.postgresql.org/download/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

---

# PostgreSQL Passwords and Environment Variables: Local and Production

---

## How to Find or Set Your Local Postgres Password

### 1. During Installation

- **Windows/Mac Installers**:  
  During installation, you are usually asked to set a password for the `postgres` user.  
  If you don’t remember it, try `postgres` or leave it blank.

- **Homebrew (Mac)**:  
  By default, the `postgres` user may not have a password. You can set one using:

```bash
psql -U postgres
```

Then, in the psql prompt:

```sql
\password postgres
```

Enter a new password when prompted.

### 2. If You Forgot the Password

- You can reset it by running:

```bash
psql -U postgres
```

If you get a password error, you can temporarily change authentication methods in your Postgres config, but **setting the password as above is the easiest way**.

---

## Where is the Password Used?

- **Locally:**  
  The password is used in your `.env` file for the `DATABASE_URL`.

Example:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nutrition_app"
```

- **In Production/Deploy:**
- **You will get a new connection string** from your cloud Postgres provider (Supabase, Railway, Render, etc.).
- This connection string will include a **different password**, username, host, and database name.
- **You should NOT use your local password in production.**
- You will set the production `DATABASE_URL` as an environment variable in your hosting provider’s dashboard (e.g., Vercel).

---

## Summary Table

| Environment | Where to find password?                         | Where to use it?                 |
| :---------- | :---------------------------------------------- | :------------------------------- |
| Local       | Set during install or with `\password postgres` | `.env` file                      |
| Production  | Provided by cloud DB provider                   | Hosting dashboard (env variable) |

---

## Example: Local vs. Production

| Use Case   | Example Connection String                                                               |
| :--------- | :-------------------------------------------------------------------------------------- |
| Local      | `postgresql://postgres:my_local_password@localhost:5432/nutrition_app`                  |
| Production | `postgresql://user:prod_password@dbhost.railway.app:5432/dbname` (provided by provider) |

---

## Best Practice

- **Never commit your `.env` file** with passwords to version control.
- **Always use environment variables** for secrets in both local and production environments.
