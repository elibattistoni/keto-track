import 'next-auth';

// extend the NextAuth Session Type
// we want Typescript to know that email is always available (recommended if your app requires email for all users)
// so we can add a "module augmentation" by creating this file
// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  }
}
