import type { NextAuthOptions } from 'next-auth';
// main function to create the API handler
import NextAuth from 'next-auth';
// lets you authenticate users with email/password
import CredentialsProvider from 'next-auth/providers/credentials';

//>> TODO for a real app, use a real database and has passwords in production
// in a real app, this would be a database
const users = [{ id: 1, email: 'test@example.com', password: 'LZp@6CrKmrPjc7Uh*-dG@8QYWG' }];

/*
- this file creates and configures the authentication API route
- it handles all authentication requests (login, logout, session, ...)
- exposes HTTP GET and POST handlers for NextAuth
*/

export const authOptions: NextAuthOptions = {
  //! providers: list of login methods (here only email + password)
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', required: true },
        password: { label: 'Password', type: 'password', required: true },
      },
      //! the authorize function is called when a user tries to log in:
      //! it checks if email+password match a user in the hardcoded array
      async authorize(credentials, req) {
        // credentials is possibly undefined, so check it
        if (!credentials) return null;
        // try to get user
        const user = users.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );
        // if the user exists, return the user, else null
        if (user) {
          return { id: String(user.id), email: user.email };
        }
        return null;
      },
    }),
  ],

  //! uses JWTs for session management
  session: { strategy: 'jwt' },

  //! secret key for encrypting JWTs and cookies
  secret: process.env.NEXTAUTH_SECRET,

  //! where to redirect users for login
  pages: {
    signIn: '/login',
  },
};

//! create a handler function that responds to HTTP requests using my config
const handler = NextAuth(authOptions);

//! export the API route
// exposes the handler for both GET and POST requests
// (this is required for Next.js API routes in the App Router)
export { handler as GET, handler as POST };
