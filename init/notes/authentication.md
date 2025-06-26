**Step-by-step authentication setup** for your KetoTrack project using:

- Next.js 15 (App Router, TypeScript)
- Prisma (with PostgreSQL)
- next-auth (Auth.js) with Prisma Adapter
- Mantine 8 (UI)
- Role-based access (admin, starter, premium)
- Secure password storage (bcrypt)
- Server-side and client-side session handling

You can use this as a README section or developer setup guide.

---

# 🛡️ Authentication Setup (Next.js + Prisma + next-auth + Mantine)

## 1. Install Dependencies

```bash
npm install next-auth @next-auth/prisma-adapter
```

---

## 2. Check Prisma Schema

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

## 3. Prisma Client Singleton

Create `/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 4. Registration Form (Mantine)

- in `components/RegistrationForm/RegistrationForm.tsx`:
  - `useForm` (from Mantine) performs client-side validation
  - `useActionState` is linked to the server action `registerUser` (in `app/register/actions.ts`) and calls this server action when the submit button is clicked; it also updates the UI with messages from the server action if there are any errors
  - the form's `action` posts to the server action `registerUser` which does secure validation and DB logic

  A note about this:

```tsx
<form
  action={formAction}
  onSubmit={form.onSubmit(() => {})}
>
```

This approach is needed if you use a combination of **Mantine’s `useForm`** (for client-side validation) and **React’s server actions** (`formAction` from `useActionState`).

- **`<form action={formAction}>`**
- This is the function that actually calls the server action if validation passes.
  - This is the **default and recommended way** to use server actions in Next.js 15.
  - When you use `<form action={formAction}>`, the browser will submit the form and the server action will receive the form data.
  - **Downside:** If you want to run custom client-side validation (e.g., with Mantine’s `useForm`), you can’t easily intercept or prevent a submit with errors, because the native form submission happens immediately.

- **`onSubmit={form.onSubmit(() => {})}`**
- This is Mantine’s handler for client-side validation.
- If validation fails, it prevents form submission.

**This combination ensures:**

- The form only submits if client-side validation passes.
- The server action always receives valid data (but it still performs a validation server-side).

Integrating the client-side and the server-side errors to be displayed correctly in the UI for best UX, was a little challenging!

---

## 5. Registration API Route (Route Handler)

**`/app/api/register/route.ts`:**

Question: for the registration (and also e.g. login), should I keep both a server action and an API route (route handler)?

**Yes, you should keep (or create) the `/api/register/route.ts` API route if you want to support registration from a mobile app or any external client in the future.**

Why?

- **Server actions** are only accessible from within your Next.js web app—they are not exposed as HTTP endpoints that external clients (like a mobile app) can call.
- **API routes** (`/api/register/route.ts`) are standard HTTP endpoints. They can be called from:
- Your own Next.js app (via `fetch`)
- Any mobile app (React Native, Flutter, etc.)
- Other external services or tools

### **Recommended Approach**

- **For your web app:**  
  Use a server action for registration to get all the benefits of the new Next.js 15 architecture (faster, more secure, direct integration with React forms).

- **For your mobile app/external clients:**  
  Keep `/api/register/route.ts` as a REST endpoint for registration.

- **How to avoid code duplication?**  
  Move the actual registration logic (e.g., validation, password hashing, Prisma call) into a shared function (e.g., `/lib/auth/register.ts`).  
  Then call this function from both your server action and your API route.

### **Example Structure**

```
/lib/auth/register.ts      <-- Shared registration logic
/app/api/register/route.ts <-- API route for mobile/external
/app/register/actions.ts   <-- Server action for internal web app registration
```

| Use Case            | Use API Route? | Use Server Action? |
| :------------------ | :------------- | :----------------- |
| Next.js web app     | Optional       | ✅ Recommended     |
| Mobile app/external | ✅ Required    | ❌ Not possible    |

### Test the API route with Postman

1. Open Postman.
2. Create a new POST request to ⁠http://localhost:3000/api/register.
3. Set the Body to raw and JSON, and enter:
   {
   "name": "Test User",
   "email": "testuser@example.com",
   "password": "password123",
   "confirmPassword": "password123"
   }
4. Click Send and check the response.

<br>
Your registration implementation is **very solid and aligns well with modern best practices** for a Next.js 15 + Prisma + next-auth stack. Here’s a detailed review of why your approach is good, and a few suggestions for further improvement if you want to go the extra mile.

---

### ✅ What’s Good About Your Registration Flow

| Practice                          | Your Implementation                                                | Why it’s Good                      |
| :-------------------------------- | :----------------------------------------------------------------- | :--------------------------------- |
| **Separation of concerns**        | Registration is handled separately from authentication (next-auth) | Keeps code maintainable and clear  |
| **Server-side validation**        | Uses Zod schema in `registerUserLogic`                             | Ensures only valid data is stored  |
| **Client-side validation**        | Uses Mantine’s form validation                                     | Gives instant feedback to the user |
| **Password hashing**              | Uses bcrypt before storing in DB                                   | Secure, industry standard          |
| **No duplicate emails**           | Checks for existing user before creating                           | Prevents account collisions        |
| **Shared logic**                  | `registerUserLogic` is reused between server action and API route  | DRY, easy to maintain              |
| **API route for mobile/external** | `/api/register/route.ts`                                           | Enables future flexibility         |
| **Good error handling**           | Returns structured errors for both validation and system errors    | UX and debugging friendly          |
| **No sensitive data leak**        | No password or sensitive info sent to the client                   | Secure                             |

---

### ⭐ Suggestions for "Even Better" Practice

These are optional, but can add polish or security:

1. **Email Verification (optional for MVP):**
   - Consider sending a verification email before activating the account.
   - This prevents bots and ensures the user owns the email.

2. **Rate Limiting / Throttling:**
   - Prevent abuse by limiting registration attempts per IP/email.

3. **Logging & Monitoring:**
   - Log registration attempts, errors, and successes for security/audit purposes.

4. **Auto-login after registration (optional):**
   - You can programmatically sign in the user after successful registration for a smoother UX.
   - Can be done by calling `signIn("credentials", ...)` after success.

5. **Strong password policy:**
   - Consider enforcing stronger password rules (e.g., numbers, symbols).

6. **User feedback:**
   - Consider adding loading states, success redirects, or onboarding steps after registration.

7. **Role assignment:**
   - If you want to support different roles (starter, premium, admin), assign the appropriate default role in your registration logic.

---

### 🚦 TL;DR

- **Your registration flow is already best-practice, secure, and ready for production.**
- **You’re using the right separation:** registration (sign-up) is your custom logic; authentication (sign-in/session) is next-auth’s job.
- **You’re future-proofed** by also having an API route for mobile/external use.

---

## 6. next-auth API Route

**`/app/api/auth/[...nextauth]/route.ts`**

The `[...nextauth]` part means:  
**“Handle all requests under `/api/auth/*` with this file.”**

### What is the next-auth API Route?

In Next.js (with App Router), **next-auth** (now called Auth.js) manages authentication via a special API route.  
This route handles all authentication-related requests, such as:

- Signing in and out
- Session management
- Callback handling (for OAuth or custom providers)
- User registration (if you set it up)
- Token and session callbacks

- By default, next-auth does NOT provide a registration endpoint or UI.
- Some social providers (like Google) will create a user on first sign-in, but for email/password, you must build the registration flow yourself (as you did).
- If you want registration to go through next-auth, you’d need to customize its callbacks or use community solutions, but that’s not typical for email/password.

How Does next-auth Use Your Registered Users?

- When a user tries to sign in with email/password, next-auth (via your CredentialsProvider) looks up the user in the database.
- If their credentials match (and the password is correctly hashed), next-auth creates a session for them.
- So:
  1. You create users (registration)
  2. next-auth authenticates users (login/session)

---

### Why is this needed?

- **Centralizes authentication logic:** All login, logout, and session activities are handled here.
- **Enables multiple providers:** You can add Google, GitHub, and custom credential providers in one place.
- **Session management:** Handles issuing and verifying JWT tokens or database sessions.
- **Secure API:** Only this route knows how to validate passwords, issue sessions, and protect user data.

Without this, you’d have to write (and maintain) all the authentication logic yourself—including password checks, session cookies, etc.

---

### How does it work in practice?

- **User submits login form** → `/api/auth/callback/credentials` is called → hits this route.
- **CredentialsProvider.authorize** runs: checks email/password, returns user if valid.
- **Session is created** (JWT or DB, depending on config).
- **Session and JWT callbacks**: Add custom info (like user role) to tokens and session objects.
- **All session checks** (e.g., in `getServerSession`) look up info via this route.

---

### Why is this file so important?

| Reason                       | Description                                                            |
| :--------------------------- | :--------------------------------------------------------------------- |
| Centralizes authentication   | All auth logic (login, session, providers) lives here                  |
| Secure credential validation | Ensures only hashed passwords are checked, never exposes raw passwords |
| Extensible                   | Add/remove providers (Google, GitHub, etc.) in one place               |
| Session customization        | Add custom fields (like `role`) to session and JWTs                    |
| Next.js integration          | Works with both API routes and App Router                              |

---

### Typical lifecycle

1. **User logs in** → Hits this route → Credentials are checked → Session is created.
2. **Any page needing auth** → Calls `getServerSession` (server) or `useSession` (client) → Loads session info from here.
3. **User logs out** → Hits this route → Session is destroyed.

---

### Summary Table

| Part                    | Code Location                              | What it does                                   |
| :---------------------- | :----------------------------------------- | :--------------------------------------------- |
| CredentialsProvider     | providers array                            | Handles email/password login                   |
| authorize()             | CredentialsProvider                        | Checks credentials, returns user if valid      |
| PrismaAdapter           | adapter                                    | Connects next-auth to your DB                  |
| callbacks.jwt, .session | callbacks                                  | Adds user info (e.g., role) to the session/JWT |
| export handler          | export { handler as GET, handler as POST } | Handles all auth-related HTTP requests         |

---

**In short:**  
This route is the "brain" of authentication in your app. It securely checks credentials, manages sessions, and makes sure only the right info is shared with the UI and other API routes.

If you want examples of adding OAuth providers, customizing session logic, or more, just ask!

---

## 7. Successful registration => auto-login => redirect to /dashboard (protected page)

see `RegistrationForm.tsx`

### Protecting `/dashboard` page

Make sure your ⁠/dashboard page is protected using `⁠getServerSession` (server component) or `⁠useSession` (client component):

app/dashboard/page.tsx

```tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <div>Welcome to your dashboard, {session.user?.name || session.user?.email}!</div>;
}
```

Don't you need `import { SessionProvider } from 'next-auth/react';`?
**You do not need to use `SessionProvider` in `dashboard/page.tsx` if it is a server component and you are using `getServerSession`.**

- `SessionProvider` from `next-auth/react` is **only needed in client components** that use the `useSession` hook or want to access session context on the client side.
- In server components (like your `app/dashboard/page.tsx`), you use `getServerSession` to fetch the session directly on the server, so there's no need for the context provider.

#### 1. **Server Component (App Router, e.g. `/app/dashboard/page.tsx`):**

```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <div>Welcome to your dashboard, {session.user?.name || session.user?.email}!</div>;
}
```

**No need for `SessionProvider` here.**

---

#### 2. **Client Component (e.g. `/components/UserMenu.tsx`):**

If you need session info on the client (e.g., for a user menu, navbar, etc.), you should wrap your app (usually in `app/layout.tsx`) with `SessionProvider`:

```typescript
// app/layout.tsx (or a client layout)
'use client';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
```

Then, in your client components, you can use:

```typescript
import { useSession } from 'next-auth/react';

export function UserMenu() {
  const { data: session } = useSession();
  // ...
}
```

**In short:**

- Use `getServerSession` on the server (no provider needed).
- Use `SessionProvider` + `useSession` on the client.

## 8. Logout functionality

To set up logout functionality with NextAuth.js in your Next.js project, you mainly need to use the built-in NextAuth signOut method on the client side. The backend (your route.ts) is already configured to handle authentication, including sign-out, via the NextAuth API.

Here’s how you can add logout functionality:

- Use the signOut function from next-auth/react in your frontend components (e.g., in your header, dashboard, or user menu).
- Optionally, you can redirect users after logout.

No backend changes are needed—NextAuth handles the sign-out route automatically at /api/auth/signout.

With NextAuth.js, the logout (sign-out) process is initiated client-side using the signOut function from next-auth/react. However, this function actually makes a request to the built-in NextAuth API route (/api/auth/signout), which is handled server-side by NextAuth.

So, to clarify:

- You trigger logout from the client (e.g., with a button).
- The actual session/token invalidation and cleanup are handled server-side by NextAuth (via the API route).

You do not need to write custom server-side code for logout—NextAuth already provides and handles the necessary API endpoint. You just need to call signOut() on the client.

If you want to customize the server-side sign-out logic, you would need to override NextAuth’s default behavior, but for most use cases, the built-in functionality is sufficient and secure.

## 8. Login Form (Mantine + next-auth)

Create `/components/LoginForm/LoginForm.tsx`:

---

## TODO ELISA HEREEE

## 8. Protecting Pages / Server Components

Example: `/app/profile/page.tsx` (server component):

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div>
      <h1>Welcome, {session.user?.name || session.user?.email}</h1>
      <p>Your role: {session.user?.role}</p>
    </div>
  );
}
```

---

## 9. Role-based Authorization Example

To restrict access to admins only:

```typescript
if (!session || session.user?.role !== 'admin') {
  redirect('/unauthorized');
}
```

---

## 10. Summary Table

| Step                 | File/Location                       | Purpose                                  |
| :------------------- | :---------------------------------- | :--------------------------------------- |
| Install packages     | Terminal                            | next-auth, Prisma adapter, bcrypt        |
| Update Prisma schema | prisma/schema.prisma                | User model with password/role            |
| Prisma client        | lib/prisma.ts                       | Singleton for DB access                  |
| Auth API route       | app/api/auth/[...nextauth]/route.ts | next-auth config with credentials        |
| Register API route   | app/api/register/route.ts           | Handles user registration                |
| Registration form    | components/RegistrationForm.tsx     | Calls register API                       |
| Login form           | components/LoginForm.tsx            | Calls next-auth signIn                   |
| Protect pages        | Any server component                | Use session helpers to check login/roles |

---

### 📝 **Notes & Best Practices**

- Mantine is used for UI forms; you can style as you wish.
- Role-based protection: Expand session checks for role-based redirects.
- Session management: Use `getServerSession` in server components, or `useSession` in client components.
- Social login: Add more providers (Google, GitHub, etc.) to the `providers` array in next-auth config.
- Security: Always hash passwords! Never log or send plain-text passwords.
- ENV config: Use `.env.local` for secrets and database URLs.

---

# Example Project Structure

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
