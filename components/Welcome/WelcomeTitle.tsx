'use client';

import { Text, Title, useMantineTheme } from '@mantine/core';
import classes from './WelcomeTitle.module.css';

export function WelcomeTitle() {
  const theme = useMantineTheme();
  return (
    <Title className={classes.title} ta="center" mt={100}>
      Welcome to{' '}
      <Text
        inherit
        variant="gradient"
        component="span"
        gradient={{ from: theme.colors.brandViolet[4], to: theme.colors.brandGreen[4] }}
      >
        Keto Track
      </Text>
    </Title>
  );
}
