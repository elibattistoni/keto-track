'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { useMounted } from '@mantine/hooks';

export function ColorSchemeToggle() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <Tooltip label={colorScheme === 'light' ? 'Dark mode' : 'Light mode'}>
      <ActionIcon
        variant="default"
        aria-label="Color Scheme"
        onClick={() => (colorScheme === 'light' ? setColorScheme('dark') : setColorScheme('light'))}
      >
        {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}
