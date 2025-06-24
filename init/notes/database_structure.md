Perfect! Here’s a full **recap and step-by-step plan** tailored to your stack and needs:

---

## **Tech Stack Recap**

- **Frontend:** Next.js 15, Mantine v8
- **Database:** PostgreSQL
- **ORM:** Prisma v6
- **Authentication:** NextAuth.js (now called [Auth.js](https://authjs.dev/))
- **Goal:**
- Automate DB setup (tables for users, authentication, foods, etc.)
- Insert a few mocked users (with hashed passwords)
- Ready for both web and mobile apps

---

## **1. Database Structure**

### **A. Users & Auth (next-auth / Auth.js tables)**

- **users**: Core user info, including a `role` field (admin, starter, premium)
- **accounts**: For OAuth/social logins
- **sessions**: For session management
- **verification_token**: For email/password verification and reset

### **B. Foods Table**

- **foods**: List of foods with nutritional values (for diary lookup)

### **C. Meals & Diary Tables** (for tracking what users eat)

- **meals**: Each meal entry, linked to a user
- **meal_foods**: Foods eaten in each meal (many-to-many: meal <-> food)

### Running the bash scripts

see:

- init/script/02_db-populate-food-csv.sh
- init/script/03_db-create-users-tables.sh

About the structure of the resulting database:

| Table                  | Purpose & Columns                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **users**              | Stores user info: `id`, `name`, `email`, `email_verified`, `image`, `password` (hashed), `role` |
| **accounts**           | OAuth/social logins: `id`, `user_id`, `type`, `provider`, `provider_account_id`, tokens, etc.   |
| **sessions**           | Login sessions: `id`, `session_token`, `user_id`, `expires`                                     |
| **verification_token** | Email/password verification: `identifier` (email), `token`, `expires`                           |
| **foods**              | Food database: `id`, `name_eng`, `name_ita`, nutritional values, etc.                           |
| **meals**              | Meal records: `id`, `user_id`, `meal_time`, `notes`                                             |
| **meal_foods**         | Foods in meals: `meal_id`, `food_id`, `quantity_g` (many-to-many between meals and foods)       |

### **1. Why These Tables?**

When using **next-auth** with PostgreSQL and Prisma, these tables are needed to support:

- **User accounts** (local or via OAuth)
- **Session management** (so users stay logged in)
- **OAuth provider accounts** (for Google, GitHub, etc.)
- **Verification flows** (email verification, password reset)
- **Role-based authorization** (e.g., admin, starter, premium)

---

### **2. SQL Script with Explanations**

```sql
-- 1. Create ENUM for user roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'starter', 'premium');
    END IF;
END$$;
```

**Purpose:**  
Defines the possible roles a user can have.

- `'admin'`: Admin users, can manage the app.
- `'starter'`: Regular users, default role.
- `'premium'`: Paying or advanced users.

---

```sql
-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,              -- Unique user identifier (cuid or uuid, set by next-auth)
    name TEXT,                        -- User's display name
    email TEXT UNIQUE,                -- User's email address (must be unique)
    email_verified TIMESTAMP,         -- When the user's email was verified (nullable)
    image TEXT,                       -- URL to user's avatar/profile image
    password TEXT,                    -- Hashed password (if using credentials login)
    role user_role NOT NULL DEFAULT 'starter' -- User's role (admin, starter, premium)
);
```

**Purpose:**  
Stores all core information about each user.

- **id**: Unique user ID (string, set by next-auth; not integer).
- **name**: User’s display name (optional).
- **email**: User’s email, must be unique.
- **email_verified**: Timestamp of when the user verified their email (nullable).
- **image**: Optional profile picture URL.
- **password**: Hashed password (only used if you implement credentials login).
- **role**: User’s role for authorization (default is `'starter'`).

---

```sql
-- 3. Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,                     -- Unique account ID (cuid or uuid)
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Link to user
    type TEXT NOT NULL,                      -- Account type (e.g., oauth, credentials)
    provider TEXT NOT NULL,                  -- Provider name (e.g., google, github)
    provider_account_id TEXT NOT NULL,       -- Provider-specific account ID
    refresh_token TEXT,                      -- OAuth refresh token (optional)
    access_token TEXT,                       -- OAuth access token (optional)
    expires_at INTEGER,                      -- Token expiry (optional)
    token_type TEXT,                         -- OAuth token type (optional)
    scope TEXT,                              -- OAuth scope (optional)
    id_token TEXT,                           -- OAuth ID token (optional)
    session_state TEXT,                      -- OAuth session state (optional)
    UNIQUE (provider, provider_account_id)
);
```

**Purpose:**  
Stores OAuth or other authentication provider account details for each user.

- **id**: Unique account record ID.
- **user_id**: References the user this account belongs to.
- **type**: Account type (e.g., `oauth`, `credentials`).
- **provider**: Name of the provider (e.g., `google`, `github`).
- **provider_account_id**: The user’s ID on the provider’s system.
- **refresh_token**, **access_token**, **expires_at**, **token_type**, **scope**, **id_token**, **session_state**: Used for OAuth flows (optional).

---

```sql
-- 4. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,                      -- Unique session ID (cuid or uuid)
    session_token TEXT UNIQUE NOT NULL,       -- The session token (cookie value)
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User for this session
    expires TIMESTAMP NOT NULL                -- When the session expires
);
```

**Purpose:**  
Stores user sessions for persistent logins.

- **id**: Unique session record ID.
- **session_token**: The session token sent to the client (used for authentication).
- **user_id**: References the user who owns this session.
- **expires**: Timestamp for session expiration.

---

```sql
-- 5. Create verification_token table
CREATE TABLE IF NOT EXISTS verification_token (
    identifier TEXT NOT NULL,                 -- Email or other identifier
    token TEXT UNIQUE NOT NULL,               -- Verification token
    expires TIMESTAMP NOT NULL,               -- When the token expires
    PRIMARY KEY (identifier, token)
);
```

**Purpose:**  
Stores tokens for email verification, password reset, etc.

- **identifier**: Usually the user’s email address.
- **token**: The verification token sent to the user.
- **expires**: When the token expires.

---

### **3. What Data Does Each Table Store?**

| Table                  | What it stores                                                                                           |
| :--------------------- | :------------------------------------------------------------------------------------------------------- |
| **users**              | Core user info: display name, email, profile image, hashed password (if used), role, verification status |
| **accounts**           | Third-party login details (e.g., OAuth with Google, GitHub) linked to users                              |
| **sessions**           | Session tokens for persistent login, mapped to users                                                     |
| **verification_token** | Tokens for verifying emails or resetting passwords                                                       |

### **5. Recap: Why This Structure?**

- **users**: Core user data (plus `role` for authorization).
- **accounts**: Handles external authentication providers (OAuth, etc.).
- **sessions**: Manages persistent login sessions.
- **verification_token**: Supports email verification and password resets.
- **ENUM role**: Ensures only valid roles (`admin`, `starter`, `premium`) are used for users.

##

# HEREEEEEEEEEEEEE

## **4. Add Mocked Users: Insert with Hashed Passwords**

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
npm install tsx --save-dev
```

**Example Node.js script (seed_users.ts):**

```ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('adminpass', 10);

  await prisma.user.createMany({
    data: [
      {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        password: password1,
        role: 'starter',
      },
      {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        password: password2,
        role: 'admin',
      },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
```

---

## **Let Me Know:**

- If you want a ready-to-copy full bash script
- If you want to see the Prisma schema for this structure
- If you want an example of seeding foods or meals

**And when you’re ready, I’ll help you set up password hashing and authentication flows!**
