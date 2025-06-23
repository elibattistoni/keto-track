# Automate Database setup and data import with PostgreSQL and Prisma

# **1. Automate Table Creation and CSV Import**

## **A. Create a SQL Script**

You can create a SQL script (e.g., `setup_db.sql`) that:

- Creates the `vegetables` table.
- Imports data from `vegetables.csv`.
- Adds a primary key.
- Creates the `users` table with recommended columns for authentication and authorization.

**Example: `setup_db.sql`**

```sql
-- 1. Create the vegetables table (structure must match your CSV columns)
CREATE TABLE IF NOT EXISTS vegetables (
  name_eng TEXT,
  name_ita TEXT,
  total_carbs_g FLOAT,
  net_carbs_g FLOAT,
  fiber_g FLOAT,
  proteins_g FLOAT,
  fats_g FLOAT,
  vitamin_c_mg INT,
  potassium_mg INT,
  calcium_mg INT,
  magnesium_mg INT,
  confidence_accuracy_macronutrients TEXT
);

-- 2. Import CSV data (run this command in your terminal, not inside SQL)
-- \copy vegetables FROM 'path/to/vegetables.csv' DELIMITER ',' CSV HEADER;

-- 3. Add a primary key column
ALTER TABLE vegetables ADD COLUMN id SERIAL PRIMARY KEY;
```

## HERE TODO
```bash
-- 4. Create the users table
-- First, create the ENUM type
CREATE TYPE user_role AS ENUM ('admin', 'starter', 'premium');

-- Then, use it in your table
CREATE TABLE IF NOT EXISTS users (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
session_token TEXT,
role user_role NOT NULL,
);
```


---

## **B. Importing the CSV File**

- The `\copy` command is a `psql` meta-command, not standard SQL.
- You **must run it from the terminal** (not inside the SQL script):

```bash
psql -d keto_track -U development -f setup_db.sql
psql -d keto_track -U development -c "\copy vegetables FROM '$(pwd)/vegetables.csv' DELIMITER ',' CSV HEADER;"
```

- Make sure your `vegetables.csv` is in the correct path.

---

# **2. Recommended Structure for `users` Table**

| Column        | Type    | Notes                                    |
| :------------ | :------ | :--------------------------------------- |
| id            | SERIAL  | Primary key                              |
| name          | TEXT    | User's display name                      |
| email         | TEXT    | Unique, for login                        |
| password_hash | TEXT    | Store hashed password (never plaintext!) |
| session_token | TEXT    | For session management (optional)        |
| is_admin      | BOOLEAN | `TRUE` for admins, `FALSE` for regular   |

- **Don’t store passwords in plaintext!** Use a library like `bcrypt` to hash them.
- You can extend this table later (e.g., for OAuth, password reset, etc.).

---

# **3. Prisma Model for `users` Table**

After running your SQL script, run:

```bash
npx prisma db pull
```

Your `prisma/schema.prisma` will have something like:

```prisma
model users {
  id           Int     @id @default(autoincrement())
  name         String
  email        String  @unique
  password_hash String
  session_token String?
  is_admin     Boolean @default(false)
}
```

---

# **4. Optional: Automate Everything with a Shell Script**

You can create a shell script (e.g., `setup.sh`) to run all steps:

```bash
#!/bin/bash
set -e

# Run SQL setup (creates tables)
psql -d keto_track -U development -f setup_db.sql

# Import CSV data
psql -d keto_track -U development -c "\copy vegetables FROM '$(pwd)/vegetables.csv' DELIMITER ',' CSV HEADER;"

# Re-introspect for Prisma
npx prisma db pull
```

Make it executable:

```bash
chmod +x setup.sh
```

Run it:

```bash
./setup.sh
```

---

# **Summary Table**

| Step                 | Command/Action       |
| :------------------- | :------------------- |
| Create SQL script    | `setup_db.sql`       |
| Create shell script  | `setup.sh`           |
| Run setup            | `./setup.sh`         |
| Re-introspect Prisma | `npx prisma db pull` |

---

# **Security Note**

- Always **hash passwords** before inserting into the database.
- For production, use a proper authentication library (e.g., [next-auth](https://next-auth.js.org/)).

---
