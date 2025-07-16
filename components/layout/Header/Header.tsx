'use client';

import { Flex } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { AuthButton } from '../AuthButton/AuthButton';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { KetoTrack } from '../KetoTrack/KetoTrack';
import { LocaleSwitcher } from '../LocaleSwitcher/LocaleSwitcher';

export function Header() {
  return (
    <header>
      <Flex justify="space-between" align="center" px="md" py="md">
        <Link href="/">
          <KetoTrack fw={800} fz="lg" />
        </Link>
        <Flex justify="right" align="center" gap="sm">
          <AuthButton />
          <LocaleSwitcher />
          <ColorSchemeToggle />
        </Flex>
      </Flex>
    </header>
  );
}
