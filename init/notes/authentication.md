Absolutely! Here’s a **clear, up-to-date guide** for implementing authentication in your **Next.js 15 (App Router) + TypeScript + next-auth + Prisma 6 + Mantine 8** stack.

---

# **1. High-Level Guide**

**What you’ll do:**

1. **Install Dependencies:**  
   Add `next-auth`, `@next-auth/prisma-adapter`, `bcrypt`, and types.

2. **Project Structure:**
   - Auth API route: `/app/api/auth/[...nextauth]/route.ts`
   - Registration API route: `/app/api/register/route.ts` (for custom registration)
   - Forms: Mantine-based register/login forms in `/components`
   - Prisma client singleton in `/lib/prisma.ts`

3. **Database & Prisma:**
   - User model includes password hash and role.
   - Use Prisma 6 migrations.

4. **Registration Flow:**
   - Form submits to `/api/register` (server action or API route)
   - Password hashed with `bcrypt`, user saved via Prisma

5. **Login Flow:**
   - Form calls `signIn("credentials")` from next-auth
   - next-auth validates password with `bcrypt`, creates session

6. **Session & Authorization:**
   - Use next-auth helpers to check session and user role in server components or route handlers

---

# **2. Step-by-Step Guide**

---

## **Step 1: Install Dependencies**

```bash
npm install next-auth @next-auth/prisma-adapter
```

---

## **Step 2: Check Prisma Schema**

**In `prisma/schema.prisma`:** check the presence of the correct models

- By default, next-auth (Auth.js) expects singular table names (⁠User, ⁠Account, ⁠Session, ⁠VerificationToken).
- Prisma is flexible, and you can use plural names, but you must specify the model mapping in your Auth.js adapter if you do so.
- If you want to use Auth.js with zero config, consider renaming your models to singular (⁠User, ⁠Account, etc.). Otherwise, you’ll need to tell Auth.js about your custom model names.

```prisma
enum Role {
  ADMIN
  STARTER
  PREMIUM
}

model User {
  id             String   @id @default(cuid())
  name           String?
  email          String?  @unique
  emailVerified  DateTime?
  image          String?
  password       String?  // For credentials login
  role           Role     @default(STARTER)
  accounts       Account[]
  sessions       Session[]
}
```

---

## **Step 3: Check Prisma Client Singleton**

**In `/lib/prisma.ts`:**

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## **Step 4: next-auth API Route**

**In `/app/api/auth/[...nextauth]/route.ts`:**

```ts
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
```

---

## **Step 5: Registration API Route**

**In `/app/api/register/route.ts`:**

```ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      // role: 'STARTER' // default
    },
  });

  return NextResponse.json({ success: true });
}
```

---

## **Step 6: Registration Form Integration**

- in `components/RegistrationForm/RegistrationForm.tsx`:
  - `useForm` (from Mantine) performs client-side validation
  - `useFormState` is linked to the server action `registerUser` (in `app/register/actions.ts`) and calls this server action when the submit button is clicked; it also updates the UI with messages from the server action if there are any errors
  - the form's `action` posts to the server action `registerUser` which does secure validation and DB logic

```tsx
'use client';

import { useFormState } from 'react-dom';
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { registerUser } from '@/app/register/actions';

export function RegistrationForm() {
  // Integrate server state with useFormState
  const [state, formAction] = useFormState(registerUser, {});

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  return (
    <Stack align="center" justify="center">
      <Paper shadow="md" p="xl" withBorder style={{ minWidth: 320, maxWidth: 400 }}>
        <Stack>
          <Title order={2}>Register</Title>
          <Text size="sm">Create a new account</Text>
          <form
            action={async (formData) => {
              // Let server action handle everything
              formAction(formData);
            }}
            // Optionally, you can add onSubmit validation here
            onSubmit={form.onSubmit(() => {})}
          >
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                {...form.getInputProps('email')}
                required
                name="email"
                type="email"
                autoComplete="email"
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                {...form.getInputProps('password')}
                required
                name="password"
                autoComplete="new-password"
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat your password"
                {...form.getInputProps('confirmPassword')}
                required
                name="confirmPassword"
                autoComplete="new-password"
              />

              {state?.error && (
                <Alert color="red" variant="light">
                  {state.error}
                </Alert>
              )}
              {state?.success && (
                <Alert color="green" variant="light">
                  {state.success}
                </Alert>
              )}

              <Button type="submit" fullWidth>
                Register
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Stack>
  );
}
```

A note about this:

```tsx
<form
  action={async (formData) => {
    // Let server action handle everything
    formAction(formData);
  }}
  // Optionally, you can add onSubmit validation here
  onSubmit={form.onSubmit(() => {})}
>
```

This approach is needed if you use a combination of **Mantine’s `useForm`** (for client-side validation) and **React’s server actions** (`formAction` from `useFormState`).

- **1. The “Simple” Approach: `<form action={formAction}>`**
  - This is the **default and recommended way** to use server actions in Next.js 15.
  - When you use `<form action={formAction}>`, the browser will submit the form and the server action will receive the form data.
  - **Downside:** If you want to run custom client-side validation (e.g., with Mantine’s `useForm`), you can’t easily intercept or prevent a submit with errors, because the native form submission happens immediately.

- **2. The “Custom Handler” Approach:**

```tsx
<form
  action={async (formData) => {
    // Custom logic before calling the server action
    formAction(formData);
  }}
  onSubmit={form.onSubmit(() => {})}
>
```

Here, you provide an async function to the `action` prop. **Why?**

- This lets you intercept the submission, so you can:
  - Run **client-side validation** with Mantine’s `form.onSubmit`.
  - Optionally do something else (e.g., analytics, extra checks) before calling the server action.
- You still call the server action (`formAction(formData)`) manually, so you get all the benefits of server-side logic, error handling, etc.

- **`onSubmit={form.onSubmit(() => {})}`**
- This is Mantine’s handler for client-side validation.
- If validation fails, it prevents form submission.
- **`action={async (formData) => { formAction(formData); }}`**
- This is the function that actually calls the server action if validation passes.

**This combination ensures:**

- The form only submits if client-side validation passes.
- The server action always receives valid data.
- You can still use React’s server action features (like `useFormState`).

# ELISA TODO HERE

---

## **Step 7: Login Form Integration**

**In `/components/LoginForm.tsx`:**

```tsx
import { signIn } from 'next-auth/react';

// ...other imports

export function LoginForm() {
  // ...existing state & form setup

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { email, password } = form.values;

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      // Optionally redirect to a protected page
      window.location.href = '/profile';
    }
    setLoading(false);
  };

  return <form onSubmit={handleSubmit}>{/* ...fields and UI */}</form>;
}
```

---

## **Step 8: Protecting Pages/Server Components**

**In a server component:**

```ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // redirect to login or show unauthorized
  }
  // session.user.role is available!
}
```

---

# **Summary Table**

| Step                 | File/Location                         | Purpose                            |
| -------------------- | ------------------------------------- | ---------------------------------- |
| Install packages     | Terminal                              | next-auth, Prisma adapter, bcrypt  |
| Update Prisma schema | `prisma/schema.prisma`                | User model with password/role      |
| Prisma client        | `lib/prisma.ts`                       | Singleton for DB access            |
| Auth API route       | `app/api/auth/[...nextauth]/route.ts` | next-auth config with credentials  |
| Register API route   | `app/api/register/route.ts`           | Handles user registration          |
| Registration form    | `components/RegistrationForm.tsx`     | Calls register API                 |
| Login form           | `components/LoginForm.tsx`            | Calls next-auth signIn             |
| Protect pages        | Any server component                  | Use session helpers to check login |

---

**Let me know if you want a complete copy-paste example for any part, or additional info on session management, role-based access, or UI integration with Mantine!**

Certainly! Here’s an example of a **project folder structure** for a Next.js 15 app using the **App Router**, **next-auth**, **Prisma 6**, **Mantine 8**, and custom registration/login forms.

---

## **Example Project Structure**

```
/keto-track
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts       # next-auth API route
│   │   └── register/
│   │       └── route.ts                     # Custom registration API route
│   │
│   ├── login/
│   │   └── page.tsx                         # Login page (renders LoginForm)
│   ├── register/
│   │   └── page.tsx                         # Register page (renders RegistrationForm)
│   ├── profile/
│   │   └── page.tsx                         # Example protected page
│   └── layout.tsx                           # App layout (MantineProvider, etc.)
│
├── components/
│   ├── LoginForm.tsx                        # Mantine login form
│   ├── RegistrationForm.tsx                 # Mantine registration form
│   └── ...                                  # Other shared UI components
│
├── lib/
│   ├── prisma.ts                            # Prisma client singleton
│   └── ...                                  # Other utilities (e.g., auth helpers)
│
├── prisma/
│   ├── schema.prisma                        # Prisma schema
│   └── ...                                  # Prisma migrations, etc.
│
├── public/                                  # Static assets
│
├── styles/                                  # Global styles (if any)
│
├── .env                                     # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## **Explanation of Key Folders/Files**

| Folder/File                           | Purpose                                                |
| :------------------------------------ | :----------------------------------------------------- |
| `app/api/auth/[...nextauth]/route.ts` | next-auth route handler (login, logout, session, etc.) |
| `app/api/register/route.ts`           | Custom API route for user registration                 |
| `app/login/page.tsx`                  | Login page (renders `LoginForm`)                       |
| `app/register/page.tsx`               | Registration page (renders `RegistrationForm`)         |
| `app/profile/page.tsx`                | Example of a protected page                            |
| `components/LoginForm.tsx`            | Mantine-based login form UI                            |
| `components/RegistrationForm.tsx`     | Mantine-based registration form UI                     |
| `lib/prisma.ts`                       | Exports a singleton Prisma client instance             |
| `prisma/schema.prisma`                | Prisma schema file (models, enums, etc.)               |
| `.env`                                | Database credentials, next-auth secrets, etc.          |

---

**You can add more folders (e.g., `hooks/`, `utils/`, `middleware.ts` for route protection, etc.) as your app grows!**

---

Let me know if you want a more detailed breakdown or examples of any specific folder or file!
