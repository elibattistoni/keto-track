---
# Step-by-Step: PostgreSQL + Prisma in Next.js
---

## Step 1: Install PostgreSQL Locally

- **Mac:**

```bash
brew install postgresql
brew services start postgresql
```

The command

```bash
brew services start postgresql
```

or

```bash
brew services start postgresql@14
```

does the same thing

**does the following:**

- **Starts the PostgreSQL database server** on your Mac as a background service (daemon).
- Ensures PostgreSQL automatically runs after you restart your computer.
- Makes PostgreSQL available system-wide, so you can connect to it from your terminal, apps, or GUI tools.

### **Details**

| Part of Command | What it Does                                                                    |
| :-------------- | :------------------------------------------------------------------------------ |
| `brew`          | Homebrew, the popular macOS package manager                                     |
| `services`      | Homebrew’s subcommand for managing background services (like databases, redis)  |
| `start`         | Tells Homebrew to launch the service and keep it running                        |
| `postgresql`    | Specifies the service you want to manage (here: the PostgreSQL database server) |

---

### **Why/When to Use It?**

- **After installing PostgreSQL via Homebrew**, you need to start the server before you can use it.
- **If you restart your Mac**, this command ensures PostgreSQL starts up automatically.
- You only need to run this once (unless you stop or restart the service).

---

### **Related Commands**

| Command                            | What it Does                           |
| :--------------------------------- | :------------------------------------- |
| `brew services stop postgresql`    | Stops the PostgreSQL service           |
| `brew services restart postgresql` | Restarts the PostgreSQL service        |
| `brew services list`               | Shows all services managed by Homebrew |

---

**Summary:**  
`brew services start postgresql` ensures your PostgreSQL server is running in the background on your Mac, ready for your apps to connect to.

## Step 1.2: Setup Postgres

Run

```bash
psql
```

When you run `psql` with no arguments, it tries to:

- Connect to the local PostgreSQL server
- Use your **macOS username** as both the **database name** and the **user**

### **Alternative 1: Connect to the Default Database**

Postgres often creates a database called `postgres` by default.  
Try connecting to it:

```bash
psql -d postgres
```

this command above worked successfully 👍🏻

or, if you want to specify the user (your username):

```bash
psql -U yourMacOSusername -d postgres
```

### **Alternative 2: Create the Database Named After Your User**

You can create a database with your username (while connected as a superuser):

1. Connect to the default database (as above).
2. Run:
   ```sql
   CREATE DATABASE yourMacOSusername;
   ```
3. Check the db was created: list all databases

   ```sql
   \l
   ```

   check roles: list all roles

   ```sql
   \du
   ```

4. exit the psql connection with:
   ```sql
   \q
   ```
   and press `Enter`
5. Now running `psql` by itself should work (which is the same as `psql -U yourMacOSusername`)

### **Alternative 3: Specify the Database you want to connect to**

```bash
psql -d keto_track
```

### **Summary Table**

| What you want to do      | Command                                 |
| :----------------------- | :-------------------------------------- |
| Connect to default db    | `psql -d postgres`                      |
| Connect as specific user | `psql -U yourMacOSusername -d postgres` |
| Connect to your app db   | `psql -d keto_track`                    |

### **Tip: Creating Your App Database**

If you haven’t already, create your app database (from `psql -d postgres`):

```sql
CREATE DATABASE keto_track;
```

### **Create the `postgres` User (Role), optional**

If you want to use `postgres` as your database user (recommended for tutorials and consistency):

1. **Connect as the existing user** (your macOS username):

   ```bash
   psql
   ```

2. **Create the `postgres` role with superuser privileges:**

   ```sql
   CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'yourpassword';
   ```

   - Replace `'yourpassword'` with a secure password you choose.

3. **Exit psql:**

   ```
   \q
   ```

4. **Now try connecting as `postgres`:**

   ```bash
   psql -U postgres
   ```

   - Enter the password you set above.

### **Setup a password for your main user** TODO IMPORTANT

# HEREEEEE TODO

---

---

---

---

---

---

---

---

# HEREEEEE

## **Step 3: Alternative — Use Your Current User**

If you don’t want to create a `postgres` user, just use your current user in your `.env` and Prisma configs:

```
DATABASE_URL="postgresql://yourMacOSusername@localhost:5432/keto_track"
```

<br>
<br>

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

<br>
<br>

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

<br>
<br>

## Step 4: Configure Database Connection

Open the generated `.env` file and set the connection string:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nutrition_app"
```

- Replace `YOUR_PASSWORD` with your actual Postgres password.
- Never commit this file with real secrets to GitHub!

---

<br>
<br>

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

<br>
<br>

## Step 6: Run Migrations

Apply your schema to the database:

```bash
npx prisma migrate dev --name init
```

This creates tables in your Postgres database.

---

<br>
<br>

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

<br>
<br>

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

<br>
<br>

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

<br>
<br>

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

<br>
<br>
<br>

# PostgreSQL Passwords and Environment Variables: Local and Production

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
