'use client';

import { usePathname } from 'next/navigation';
import { IconHome2, IconLogin2, IconUser } from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { ActionIcon, Affix, Tooltip } from '@mantine/core';
import { Link } from '@/i18n/navigation';

export const AuthButton = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthPage =
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/forgot-password') ||
    pathname.includes('/reset-password');
  const t = useTranslations('HomePage');

  return (
    <Affix position={{ bottom: 20, right: 20 }}>
      {session && (
        <Tooltip label={t('logout')} position="left">
          <ActionIcon
            size="xl"
            radius="xl"
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="default"
          >
            <IconUser />
          </ActionIcon>
        </Tooltip>
      )}
      {!session && (
        <Tooltip label={isAuthPage ? t('home') : t('login')} position="left">
          <ActionIcon
            component={Link}
            href={isAuthPage ? '/' : '/login'}
            size="xl"
            radius="xl"
            variant="default"
          >
            {isAuthPage ? <IconHome2 /> : <IconLogin2 />}
          </ActionIcon>
        </Tooltip>
      )}
    </Affix>
  );
};
