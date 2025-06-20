'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';

export function ColorSchemeToggle() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Tooltip label={colorScheme === 'light' ? 'Dark mode' : 'Light mode'}>
      <ActionIcon
        variant="default"
        aria-label="Color Scheme"
        onClick={() => (colorScheme === 'light' ? setColorScheme('dark') : setColorScheme('light'))}
      >
        {colorScheme === 'dark' ? <IconSun /> : <IconMoon />}
      </ActionIcon>
    </Tooltip>
  );
}
