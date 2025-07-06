'use client';

import { usePathname } from 'next/navigation';
import { Flex } from '@mantine/core';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';

export function Header() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAuthPage) {
    return null;
  }

  return (
    <header>
      <Flex px="md" py="md" justify="right">
        <ColorSchemeToggle />
      </Flex>
    </header>
  );
}
