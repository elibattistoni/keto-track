'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export function NextAuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
