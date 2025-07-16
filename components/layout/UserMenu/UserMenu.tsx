'use client';

import {
  IconCalendarFilled,
  IconChartDots2,
  IconClipboardHeart,
  IconLayoutDashboard,
  IconLogin2,
  IconLogout2,
  IconSettings,
  IconTimeline,
  IconTreadmill,
  IconUpload,
  IconUser,
} from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { Link } from '@/i18n/navigation';

const UserSessionMenu = () => {
  return (
    <Menu shadow="md" width="fit-content" position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="default">
          <IconUser size={20} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>User</Menu.Label>
        <Menu.Item
          leftSection={<IconLogout2 size={14} />}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Logout
        </Menu.Item>
        <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item leftSection={<IconLayoutDashboard size={14} />}>Dashboard</Menu.Item>
        <Menu.Item leftSection={<IconUpload size={14} />}>Upload foods</Menu.Item>
        <Menu.Item leftSection={<IconCalendarFilled size={14} />}>Daily log</Menu.Item>
        <Menu.Item leftSection={<IconChartDots2 size={14} />}>Ketosis</Menu.Item>
        <Menu.Item leftSection={<IconTimeline size={14} />}>Weight</Menu.Item>
        <Menu.Item leftSection={<IconClipboardHeart size={14} />}>Symptoms</Menu.Item>
        <Menu.Item leftSection={<IconTreadmill size={14} />}>Activity</Menu.Item>
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
