'use client';

import { Text, useMantineTheme } from '@mantine/core';

export function KetoTrack() {
  const theme = useMantineTheme();
  return (
    <Text
      inherit
      variant="gradient"
      component="span"
      gradient={{ from: theme.colors.brandViolet[4], to: theme.colors.brandGreen[4] }}
    >
      KetoTrack
    </Text>
  );
}
