'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@mantine/core';

export function LogoutButton() {
  return <Button onClick={() => signOut({ callbackUrl: '/login' })}>Logout</Button>;
}
