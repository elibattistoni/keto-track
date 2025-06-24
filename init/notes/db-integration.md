# Step-by-Step: PostgreSQL + Prisma in Next.js

<br>

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

### **Why/When to Use It?**

- **After installing PostgreSQL via Homebrew**, you need to start the server before you can use it.
- **If you restart your Mac**, this command ensures PostgreSQL starts up automatically.
- You only need to run this once (unless you stop or restart the service).

### **Related Commands**

| Command                            | What it Does                           |
| :--------------------------------- | :------------------------------------- |
| `brew services stop postgresql`    | Stops the PostgreSQL service           |
| `brew services restart postgresql` | Restarts the PostgreSQL service        |
| `brew services list`               | Shows all services managed by Homebrew |

- **Summary:**  
  `brew services start postgresql` ensures your PostgreSQL server is running in the background on your Mac, ready for your apps to connect to.

<br>
<br>

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
psql -d another_database
```

### **Summary Table**

| What you want to do                        | Command                                     |
| :----------------------------------------- | :------------------------------------------ |
| Connect to default db with system user     | `psql`                                      |
| Connect to default db with system user     | `psql -d postgres`                          |
| Connect to default db with system/any user | `psql -U whatever_user -d postgres`         |
| Connect to specific db with system user    | `psql -d another_database`                  |
| Connect to specific db with any user       | `psql -U whatever_user -d another_database` |

### **Create the `development` User (Role)**

1. **Connect with system user** (your macOS username):

   ```bash
   psql
   ```

2. **Create the `development` role with LOGIN CREATEDB privileges:**

   ```sql
    CREATE ROLE development WITH LOGIN CREATEDB PASSWORD 'your_dev_password';
   ```

   - Replace `'your_dev_password'` with a secure password you choose.

3. **Exit psql:**

   ```
   \q
   ```

4. **Now try connecting as `development`:**

   ```bash
   psql -U development
   ```

   - Enter the password you set above.

### **Setup or change password for a user**

**1. Connect to PostgreSQL**

Connect to the `postgres` default database as the user of which you want to change the password:

if you want to change the password of your default system user:

```bash
psql -d postgres
```

alternatively, you can specify the user:

```bash
psql -U your_superuser -d postgres
```

**2. Change the Password**

At the `psql` prompt, run:

```sql
ALTER USER your_superuser WITH PASSWORD 'your_new_password';
```

- Replace `'your_new_password'` with your chosen password (use single quotes).

**3. Exit psql**

```sql
\q
```

4. **Security Tips**

- Choose a strong password.
- Never share your password or commit it to version control.
- Update your `.env` or any connection strings if you use this user for app connections.

### Clarifying prompts

- The prompt you see in `psql` is:

```
database_name=#
```

where `database_name` is the name of the database you are currently connected to.

**Connection Scenarios**

| Command                              | User             | Database         | Prompt shown       |
| :----------------------------------- | :--------------- | :--------------- | :----------------- |
| `psql -d postgres`                   | your system user | `postgres`       | `postgres=#`       |
| `psql -U my_system_user -d postgres` | `my_system_user` | `postgres`       | `postgres=#`       |
| `psql`                               | your system user | your system user | `my_system_user=#` |

- If you don’t specify a database, `psql` tries to connect to a database **with the same name as your user**.
- If you don’t specify a user, `psql` uses your **system username**.

**Quick Reference Table**

| What you type                        | User used        | Database used    | Prompt             |
| :----------------------------------- | :--------------- | :--------------- | :----------------- |
| `psql`                               | `my_system_user` | `my_system_user` | `my_system_user=#` |
| `psql -d postgres`                   | `my_system_user` | `postgres`       | `postgres=#`       |
| `psql -U my_system_user -d postgres` | `my_system_user` | `postgres`       | `postgres=#`       |
| `psql -U someuser -d mydb`           | `someuser`       | `mydb`           | `mydb=#`           |

**Summary**

- The **user** is determined by `-U` or your system username.
- The **database** is determined by `-d` or your system username.
- The **prompt** shows the name of the database you’re connected to.

If you connect to PostgreSQL with:

```bash
psql -d postgres
```

or

```bash
psql -U my_system_user -d postgres
```

in the console you see:

```sql
postgres=#
```

Instead if you connect to PostgreSQL with

```bash
psql
```

in the console you see:

```sql
elisabattistoni=#
```

**You are logging in as `my_system_user` in both cases, but the database you connect to changes depending on the command.**

<br>
<br>

## Step 2: Create and connect to keto_track database with development user

IMPORTANT: you should create the `keto_track` database with the 'development' user, not with the system user. In this way, the owner of the `keto_track` database will be 'development' and not the system user.

1. Create connection:

```bash
psql -U development -d postgres
```

2. Create database:

```sql
CREATE DATABASE keto_track;
```

3. Exit:

```sql
\q
```

4. Connect to the keto_track database with the development user:

```bash
psql -U development -d keto_track
```

When you are inside psql, if you want to check with which user you have established the connection to the database, i.e. the **current connected user**:

```sql
SELECT current_user;
```

or simply:

```sql
SELECT user;
```

<br>
<br>

## Step 3: add data to the keto_track database

You can add data in several ways. In this case, I am using the GUI TablePlus.

1. Open TablePlus and connect to the `keto_track` database as the `development` user

- Click on "Create connection"
- choose PostgreSQL (double-click)
- enter all the details of the database you want to connect to

2. Create the table, see TablePlus docs https://docs.tableplus.com/gui-tools/import-and-export

<br>
<br>

## Step 4: Set up Prisma in the Next.js 15 project

https://www.prisma.io/docs/guides/nextjs

### **Step 1: Install Prisma**

In your Next.js app root directory, run:

```bash
npm install @prisma/client
npm install prisma --save-dev
```

### **Step 2: Initialize Prisma**

```bash
npx prisma init
```

This creates:

- `prisma/schema.prisma` (your Prisma schema)
- `.env` (for environment variables)

IMPORTANT in prisma/scheme.prisma remove:
`output   = "../lib/generated/prisma"`
because this line tells Prisma to generate the client in ⁠lib/generated/prisma instead of the default location.

This command outputs the following:

```bash
Fetching latest updates for this subcommand...

✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.

warn You already have a .gitignore file. Don't forget to add `.env` in it to not commit any private information.

Next steps:
1. Run prisma dev to start a local Prisma Postgres server.
2. Define models in the schema.prisma file.
3. Run prisma migrate dev to migrate your local Prisma Postgres database.
4. Tip: Explore how you can extend the ORM with scalable connection pooling, global caching, and a managed serverless Postgres database. Read: https://pris.ly/cli/beyond-orm

More information in our documentation:
https://pris.ly/d/getting-started
```

### **Step 3: Configure the Database Connection**

Edit the `.env` file:

```
DATABASE_URL="postgresql://your_username:your_dev_password@localhost:5432/keto_track"
```

- Replace `development` and `your_dev_password` with your actual PostgreSQL username and password.

### **Step 4: Introspect Your Existing Database**

IMPORTANT before letting Prisma generate the model, you should know that (I tried to pull the vegetables table but got a warning):

Prisma requires every table/model to have a unique identifier—usually a primary key column (e.g., `id SERIAL PRIMARY KEY`).  
Your `vegetables` table does **not** have a primary key, so Prisma marks it with `@@ignore` and does **not** generate code to access it.
Prisma Client needs a way to uniquely identify each row, for operations like `findUnique`, `update`, `delete`, etc.  
Without a primary key, it can’t do this safely.

**How to Fix: Add a Primary Key to Your Table**
Add an `id` column (integer, auto-incrementing, primary key) to your `vegetables` table: in psql or TablePlus, run:

```bash
psql -U development -d keto_track
```

```sql
ALTER TABLE vegetables ADD COLUMN id SERIAL PRIMARY KEY;
```

- `SERIAL` makes an auto-incrementing integer column.
- `PRIMARY KEY` ensures uniqueness.

```sql
\q
```

After adding the primary key, you can run the following command to let Prisma generate models from them:

```bash
npx prisma db pull
```

Now your `prisma/schema.prisma` should look like:

```prisma
model vegetables {
  id                                 Int     @id @default(autoincrement())
  name_eng                           String?
  name_ita                           String?
  total_carbs_g                      Float?
  net_carbs_g                        Float?
  fiber_g                            Float?
  proteins_g                         Float?
  fats_g                             Float?
  vitamin_c_mg                       Int?
  potassium_mg                       Int?
  calcium_mg                         Int?
  magnesium_mg                       Int?
  confidence_accuracy_macronutrients String?
}
```

This updates `prisma/schema.prisma` with models representing your current database structure, including `vegetables`.

If in this file you see an @@ignore, it means that there is no primary key. If you want to start fresh after adding the primary key to the table:

```bash
rm -rf prisma
npx prisma init
npx prisma db pull
```

### **Step 5: Generate the Prisma Client**

```bash
npx prisma generate
```

You can inspect your data with Prisma Studio:

```bash
npx prisma studio
```

### **Step 6: Set up Prisma Client & connect it to your db**

Create a `lib/prisma.ts` file:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Optional: logs all queries to console
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### **Step 7: Create an API route (in Pages Router) aka Route Handlers (in App Router) to Fetch Data**

Create the file: `app/api/vegetables/route.ts`

```ts
// app/api/vegetables/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Fetch all vegetables from the database
  const vegetables = await prisma.vegetables.findMany();
  return NextResponse.json(vegetables);
}
```

**Note:**  
If your table is named `vegetables`, Prisma model will likely be `Vegetables` (capitalized).  
The generated client will use the plural, i.e., `prisma.vegetables.findMany()`.

**You need an API route (in Pages Router) aka Route Handlers (in App Router) if:**

- You want to fetch data **client-side** (e.g., with `fetch()` inside a React component or with SWR/React Query).
- You want to expose your data to the browser or to external clients.
- You want a clear separation between frontend and backend logic.

Example of fetching data in a Client Component:

```tsx
// app/vegetables/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function VegetablesPage() {
  const [vegetables, setVegetables] = useState([]);

  useEffect(() => {
    fetch('/api/vegetables')
      .then((res) => res.json())
      .then((data) => setVegetables(data));
  }, []);

  return (
    <div>
      <h1>Vegetables</h1>
      <ul>
        {vegetables.map((veg: any) => (
          <li key={veg.id}>
            {veg.name} {/* Adjust property names based on your table */}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**You do NOT need an API route (in Pages Router) aka Route Handlers (in App Router) if:**

- You are fetching data **server-side** (in a Next.js Server Component or in `getServerSideProps`/`getStaticProps`).
- You are using Prisma **directly** in your React Server Component or page file.

Example of fetching data in a Server Component:

```tsx
// app/vegetables/page.tsx (Server Component)
import { prisma } from '@/lib/prisma';

export default async function VegetablesPage() {
  const vegetables = await prisma.vegetables.findMany();
  return (
    <ul>
      {vegetables.map((veg) => (
        <li key={veg.id}>{veg.name_eng}</li>
      ))}
    </ul>
  );
}
```

**Best Practice**

- **For server-side rendering (SSR) or static site generation (SSG):**  
  Use Prisma directly in Server Components or data fetching functions.
- **For client-side fetching, or if you want an API for other clients:**  
  Create an API route (in Pages Router) aka Route Handlers (in App Router).

<br>
<br>

## Step 7: Use Prisma Client in Next.js; the Singleton Pattern

The **singleton pattern** is a software design pattern that ensures a class (in this case, `PrismaClient`) is **instantiated only once** during the lifetime of your application.

**Why is this important with Prisma and Next.js (especially in development)?**

- In development, **Next.js hot reloads** and can re-execute your code multiple times.
- If you create a new `PrismaClient` instance every time a file is evaluated, you can quickly run into the error:

```
Error: There are already N instances of Prisma Client actively running.
```

- This can exhaust your database connections and cause memory leaks.

**How does the singleton pattern solve this?**

- By **storing your PrismaClient instance on the global object**, you ensure that even if your files are reloaded, you _reuse_ the same instance instead of creating a new one.

**Example: Singleton Pattern for PrismaClient**

```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Optional: logs queries to the console
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- On the **first run**, `globalForPrisma.prisma` is undefined, so a new client is created.
- On **subsequent runs** (after hot reloads), the existing client is reused.

**In short:**  
The singleton pattern for PrismaClient in Next.js apps (especially in development) is a best practice to avoid multiple instances and database connection errors.

Example of POST request in in your API route (in Pages Router) aka Route Handlers (in App Router) (e.g., `app/api/users/route.ts`):

```ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

<br>
<br>

## Deploying & Storing Secrets Securely

- **Local Development:**  
  Store secrets in `.env` (never commit to version control).
- **Production (Vercel, Railway, etc.):**  
  Set environment variables via the hosting dashboard (never hardcode in code).

**.gitignore** should include:

```
.env
.env.local
```

- **Deploy your Next.js app** (e.g., [Vercel](https://vercel.com/)).
- **Provision a managed Postgres database** (e.g., [Supabase](https://supabase.com/), [Railway](https://railway.app/), [Render](https://render.com/)).
- **Set the `DATABASE_URL` environment variable** in your hosting dashboard using the credentials from your managed database.

## PostgreSQL Passwords and Environment Variables: Local and Production

- **Locally:**
  - The password is used in your `.env` file for the `DATABASE_URL`.

Example:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nutrition_app"
```

- **In Production/Deploy:**
  - **You will get a new connection string** from your cloud Postgres provider (Supabase, Railway, Render, etc.).
  - This connection string will include a **different password**, username, host, and database name.
  - **You should NOT use your local password in production.**
  - You will set the production `DATABASE_URL` as an environment variable in your hosting provider’s dashboard (e.g., Vercel).

| Environment | Where to find password?                         | Where to use it?                 |
| :---------- | :---------------------------------------------- | :------------------------------- |
| Local       | Set during install or with `\password postgres` | `.env` file                      |
| Production  | Provided by cloud DB provider                   | Hosting dashboard (env variable) |

| Use Case   | Example Connection String                                                               |
| :--------- | :-------------------------------------------------------------------------------------- |
| Local      | `postgresql://postgres:my_local_password@localhost:5432/nutrition_app`                  |
| Production | `postgresql://user:prod_password@dbhost.railway.app:5432/dbname` (provided by provider) |

- **Never commit your `.env` file** with passwords to version control.
- **Always use environment variables** for secrets in both local and production environments.

# A note about the DATABASE_URL

```
DATABASE_URL="postgresql://your_username:your_dev_password@localhost:5432/keto_track"
```

---

## **Decomposition of the URL**

| Part              | Example value       | What it means                                                               |
| :---------------- | :------------------ | :-------------------------------------------------------------------------- |
| **Scheme**        | `postgresql://`     | Tells Prisma (or any client) to use PostgreSQL                              |
| **Username**      | `your_username`     | The database user account to connect as                                     |
| **Password**      | `your_dev_password` | The password for that database user                                         |
| **Host**          | `localhost`         | The server where PostgreSQL is running (`localhost` means your own machine) |
| **Port**          | `5432`              | The network port PostgreSQL listens on (default is 5432)                    |
| **Database name** | `keto_track`        | The name of the specific database to connect to                             |

---

### **Visual Breakdown**

```
postgresql://your_username:your_dev_password@localhost:5432/keto_track
    |          |               |                |     |         |
  scheme   username        password        host  port   database
```

---

### **What Each Part Does**

- **postgresql://**  
  Protocol/scheme — tells the client which type of database to connect to.

- **your_username:your_dev_password@**  
  Authentication — credentials used to log in to the database server.

- **localhost**  
  Host — the address of the machine where PostgreSQL is running.
- `localhost` means "this computer."
- If your DB is on another server, replace with its IP or hostname.

- **5432**  
  Port — the network port PostgreSQL listens on.
- Default is `5432`, but it can be changed in your PostgreSQL config.

- **keto_track**  
  Database — the specific database on the server you want to use.

---

### **General Pattern**

```
postgresql://<username>:<password>@<host>:<port>/<database>
```

---

## **Example with Real Values**

Suppose:

- Username: `development`
- Password: `mypassword`
- Host: `localhost`
- Port: `5432`
- Database: `keto_track`

The URL would be:

```
postgresql://development:mypassword@localhost:5432/keto_track
```

---

## **Where is this used?**

- In your `.env` file for Prisma (`DATABASE_URL=...`)
- In any tool or library that connects to your PostgreSQL database

---

However, the DATABASE_URL that is automatically generated by Prisma has a different structure:

```
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."
```

is **not a standard PostgreSQL connection string**.  
It is a **special format used by Prisma Accelerate** (or sometimes by cloud database proxies/services) for advanced features like connection pooling, edge deployments, or data proxying.

---

## **What Does Each Part Mean?**

| Part                | Example Value        | What it Means                                                                                  |
| :------------------ | :------------------- | :--------------------------------------------------------------------------------------------- |
| **Scheme**          | `prisma+postgres://` | Tells Prisma to use its own proxy/data layer, not direct DB connection                         |
| **Host**            | `localhost`          | The address of the Prisma Data Proxy/Accelerate endpoint (can be a remote server or localhost) |
| **Port**            | `51213`              | The port where the proxy/accelerate endpoint is listening                                      |
| **Query parameter** | `?api_key=...`       | API key to authenticate with the proxy/accelerate endpoint                                     |

---

## **Why Does Prisma Generate This?**

- **If you use [Prisma Accelerate](https://www.prisma.io/docs/accelerate) or the Prisma Data Proxy,** Prisma will generate a URL like this for you.
- This URL tells Prisma Client to connect **not directly to PostgreSQL**, but to a managed proxy that handles connections, pooling, caching, and authentication for you.
- The `prisma+postgres://` scheme is recognized by Prisma Client, but **not by other tools** (like `psql`).

---

## **When Do You See This?**

- When you create a project using Prisma Accelerate or Data Proxy.
- When you copy the connection string from the Prisma Cloud dashboard.
- Sometimes when using cloud development environments or managed Prisma services.

---

## **Can You Use This with psql or TablePlus?**

**No.**

- This URL is **only for Prisma Client**.
- Tools like `psql`, TablePlus, or DBeaver **require a standard PostgreSQL URL** (e.g., `postgresql://user:password@host:port/dbname`).

---

## **Should You Use This Locally?**

- **If you are not using Prisma Accelerate or Data Proxy,** use the standard PostgreSQL URL.
- Use the `prisma+postgres://...` URL **only** if you have set up Accelerate/Data Proxy and want Prisma to connect through it.

---

## **Summary Table**

| URL Type                     | Use Case                         | Example Format                             |
| :--------------------------- | :------------------------------- | :----------------------------------------- |
| Standard PostgreSQL          | Local/dev/most production setups | `postgresql://user:pass@host:port/dbname`  |
| Prisma Accelerate/Data Proxy | Prisma-managed cloud features    | `prisma+postgres://host:port/?api_key=...` |

---

## **In Practice**

- For **local development**, use the standard PostgreSQL URL.
- For **Prisma Accelerate/Data Proxy**, use the generated `prisma+postgres://...` URL **only in Prisma Client**.

---

**If you want to use standard tools (psql, TablePlus), stick to the classic URL.  
If you want Prisma’s advanced features (Accelerate/Data Proxy), use the special URL in your Prisma `.env`.**
