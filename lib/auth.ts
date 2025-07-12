import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

// 1. Configure next-auth options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), // Connects next-auth to your database via Prisma

  providers: [
    // 2. CredentialsProvider allows email+password login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 3. Logic to verify user credentials
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        // Only return safe user fields
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // Add OAuth providers (Google, GitHub, etc.) here if needed
  ],

  session: { strategy: 'jwt' }, // Use JWTs for session management

  // 4. Callbacks to customize session/jwt behavior
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role; // Add role to JWT token
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.role = token.role; // Add role to session
      return session;
    },
  },

  pages: {
    signIn: '/login', // Custom login page
  },
};
