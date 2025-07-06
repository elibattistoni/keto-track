// next-auth.d.ts
import { Role } from '@prisma/client'; // adjust import if needed
import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: Role;
  }
  interface Session {
    user?: {
      role?: Role;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: Role;
  }
}
