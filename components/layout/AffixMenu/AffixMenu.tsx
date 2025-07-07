'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome2, IconLogin2, IconUser } from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import { ActionIcon, Affix, Tooltip } from '@mantine/core';

export const AffixMenu = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  return (
    <Affix position={{ bottom: 20, right: 20 }}>
      {session && (
        <Tooltip label="Logout" position="left">
          <ActionIcon size="xl" radius="xl" onClick={() => signOut({ callbackUrl: '/' })}>
            <IconUser />
          </ActionIcon>
        </Tooltip>
      )}
      {!session && (
        <Tooltip label={isAuthPage ? 'Go Home!' : 'Come on in!'} position="left">
          <ActionIcon component={Link} href={isAuthPage ? '/' : '/login'} size="xl" radius="xl">
            {isAuthPage ? <IconHome2 /> : <IconLogin2 />}
          </ActionIcon>
        </Tooltip>
      )}
    </Affix>
  );
};
