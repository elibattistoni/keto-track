'use client';

import { usePathname } from 'next/navigation';
import { Flex } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { KetoTrack } from '../KetoTrack/KetoTrack';
import { LocaleSwitcher } from '../LocaleSwitcher/LocaleSwitcher';

export function Header() {
  const pathname = usePathname();
  const isAuthPage =
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/forgot-password') ||
    pathname.includes('/reset-password');

  if (isAuthPage) {
    return null;
  }

  return (
    <header>
      <Flex justify="space-between" align="center" px="md" py="md">
        <Link href="/">
          <KetoTrack fw={800} fz="lg" />
        </Link>
        <Flex justify="right" align="center" gap="sm">
          <LocaleSwitcher />
          <ColorSchemeToggle />
        </Flex>
      </Flex>
    </header>
  );
}
