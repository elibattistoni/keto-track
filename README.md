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

## npm scripts

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

# Initialize the project: create the database, the data tables, and the Prisma connection

1. Install all the packages needed:

```bash
npm install
```

2. In Postgres, create a user (e.g. development), password, and a database (e.g. keto_track) -- see more info in init/notes/db-integration.md:
   TL;DR for Mac:

install postgresql:

```bash
brew install postgresql
brew services start postgresql
```

connect to the default db with your default user (does not matter, automatically set by postgresql):

```bash
psql
```

create a new user, just for organization/best practices:

```sql
    CREATE ROLE new_user WITH LOGIN CREATEDB PASSWORD 'your_new_user_password';
```

exit psql

```
   \q
```

connect to the default db with your new user

```bash
psql -U new_user
```

now create a database (so that the new_user will be the owner of this new database)

```sql
CREATE DATABASE new_database;
```

3. Create a .env or .env.local file with this info:

```
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_database"
```

the port 5432 is the default for PostgreSQL

4. In the terminal, from the root project folder, run:

```bash
chmod +x ./init/script/00_run-all.sh
```

and then

```bash
./init/script/00_run-all.sh
```

5. start the project locally:

```bash
npm run dev
```
