'use client';

import { IconLogin2, IconLogout2, IconUser } from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { Link } from '@/i18n/navigation';

const UserSessionMenu = () => {
  return (
    <Menu shadow="md" width={150} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="default">
          <IconUser />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconLogout2 size={14} />}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const UserMenu = () => {
  const { data: session } = useSession();
  const t = useTranslations('HomePage');

  return (
    <Tooltip label={session ? t('logout') : t('login')} position="left">
      {session ? (
        <UserSessionMenu />
      ) : (
        <ActionIcon component={Link} href="/login" variant="default">
          <IconLogin2 size={20} />
        </ActionIcon>
      )}
    </Tooltip>
  );
};
