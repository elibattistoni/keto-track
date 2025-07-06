# Mantine Next.js template

This is a template for [Next.js](https://nextjs.org/) app router + [Mantine](https://mantine.dev/).
If you want to use pages router instead, see [next-pages-template](https://github.com/mantinedev/next-pages-template).

## Features

This template comes with the following features:

- [PostCSS](https://postcss.org/) with [mantine-postcss-preset](https://mantine.dev/styles/postcss-preset)
- [TypeScript](https://www.typescriptlang.org/)
- [Storybook](https://storybook.js.org/)
- [Jest](https://jestjs.io/) setup with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- ESLint setup with [eslint-config-mantine](https://github.com/mantinedev/eslint-config-mantine)

## npm scripts (run with yarn, not npm)

### Build and dev scripts

- `dev` – start dev server
- `build` – bundle application for production
- `analyze` – analyzes application bundle with [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Testing scripts

- `typecheck` – checks TypeScript types
- `lint` – runs ESLint
- `prettier:check` – checks files with Prettier
- `jest` – runs jest tests
- `jest:watch` – starts jest watch
- `test` – runs `jest`, `prettier:check`, `lint` and `typecheck` scripts

### Other scripts

- `storybook` – starts storybook dev server
- `storybook:build` – build production storybook bundle to `storybook-static`
- `prettier:write` – formats all files with Prettier

<br>
<br>
<br>

# KetoTrack Project Overview

## Tech Stack

| Layer     | Tool/Library          | Notes                                            |
| :-------- | :-------------------- | :----------------------------------------------- |
| Frontend  | Next.js 15            | App Router, React 19, TypeScript, SSR/SSG        |
| UI        | Mantine 8             | Latest major version, all UI components          |
| ORM/DB    | Prisma                | Connected to PostgreSQL                          |
| Database  | PostgreSQL            | Local dev, db: `keto_track`, user: `development` |
| Auth      | next-auth (Auth.js)   | Prisma Adapter, role-based support               |
| Utility   | TablePlus             | DB management, CSV import                        |
| Scripting | Bash, tsx, TypeScript | Automation, seeding, scripting                   |

---

## Database Structure

<details>
<summary><strong>Foods Table (<code>foods</code>)</strong></summary>

- Populated from CSV via bash.
- Columns:
- `id SERIAL PRIMARY KEY`
- `name_eng`
- `name_ita`
- `food_category_eng`
- `food_category_ita`
- `calories_kcal`
- `total_carbs_g`
- `net_carbs_g`
- `fiber_g`
- `proteins_g`
- `fats_g`
- `accuracy`

</details>

<details>
<summary><strong>User & Auth Tables (NextAuth/Prisma Style)</strong></summary>

- **User Table (`"User"`):**
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name`, `email`, `email_verified`, `image`, `password`
- `role` as ENUM (`'admin'`, `'starter'`, `'premium'`), default `'starter'`
- **Account Table (`"Account"`):** OAuth support, references `"User"`
- **Session Table (`"Session"`):** Session management, references `"User"`
- **VerificationToken Table (`"VerificationToken"`):** Email verification/password reset

</details>

<details>
<summary><strong>Meals & Meal-Foods Tables</strong></summary>

- **meals:** `id SERIAL PRIMARY KEY`, `user_id` (UUID), `meal_time`, `notes`
- **meal_foods:** Many-to-many join between meals and foods, columns: `meal_id`, `food_id`, `quantity_g`, composite PK

</details>

---

## Prisma Setup

- Prisma initialized and connected to PostgreSQL
- Singleton pattern in `lib/prisma.ts`
- Models generated via `npx prisma db pull` from real DB schema
- Using default Prisma client output

---

## API & Data Fetching

- **Server Components:** Fetch directly from Prisma for SSR/SSG
- **Route Handlers:** Used for client-side fetches and external API access

---

## Automation & Scripting

- Bash scripts:
  - Drop all tables and reset schema
  - Create tables and relationships
  - Import foods data from CSV
- Loads env vars from `.env.local` or `.env`

---

## Authentication & Authorization

- Using next-auth (Auth.js) with Prisma Adapter
- Role-based access via `role` ENUM in `"User"` table
- Supports OAuth, session management, email verification

---

## Security Practices

- Passwords stored in `password` (should be hashed!)
- Role-based access via ENUM
- Meals and foods linked via foreign keys and join table

---

## Mantine 8

- All UI components and forms are built using **Mantine 8**

---

## Sample Prisma Model

```prisma
enum Role {
  admin
  starter
  premium
}

model User {
  id             String   @id @default(uuid())
  name           String?
  email          String?  @unique
  email_verified DateTime?
  image          String?
  password       String?
  role           Role     @default(starter)
  // ...relations to Account, Session, VerificationToken
}
```

---

## Summary Table

| Layer     | Tool/Lib   | Notes                                      |
| :-------- | :--------- | :----------------------------------------- |
| UI        | Mantine 8  | All components built with Mantine 8        |
| Frontend  | Next.js 15 | App Router, React 19, TypeScript           |
| ORM/DB    | Prisma     | Connected to PostgreSQL, models from DB    |
| Auth      | next-auth  | With Prisma Adapter, roles via ENUM        |
| DB        | PostgreSQL | Tables: foods, User, Account, Session, etc |
| Scripting | Bash/tsx   | For automation, seeding, and DB setup      |

---

<br>
<br>
<br>

# Steps for installing & initializing the project

## Install all the packages needed:

```bash
yarn install
```

## Install PostgreSQL

```bash
brew install postgresql
brew services start postgresql
```

## In Postgres, create a user, password, and a database

see more info in init/notes/db-integration.md:
TL;DR for Mac:

1. connect to the default db with your default user (does not matter, automatically set by postgresql):

```bash
psql
```

2. create a new user, just for organization/best practices:

```sql
CREATE ROLE new_user WITH LOGIN CREATEDB PASSWORD 'your_new_user_password';
```

3. exit psql:

```
\q
```

4. connect to the default db with your new user:

```bash
psql -U new_user
```

5. now create a database (so that the new_user will be the owner of this new database):

```sql
CREATE DATABASE new_database;
```

## Create a .env or .env.local file with this info:

```
DB_USER=new_user
DB_PASSWORD=your_new_user_password
DB_NAME=new_database
DATABASE_URL="postgresql://new_user:your_new_user_password@localhost:5432/new_database"
```

the port 5432 is the default for PostgreSQL

## In the terminal, from the root project folder, run:

```bash
chmod +x ./init/script/00_run-all.sh
```

and then

```bash
./init/script/00_run-all.sh
```

## Start the project locally:

```bash
yarn dev
```
