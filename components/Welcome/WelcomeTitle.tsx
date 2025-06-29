import { rem, Title } from '@mantine/core';
import { KetoTrack } from '../KetoTrack/KetoTrack';
import classes from './WelcomeTitle.module.css';

export function WelcomeTitle() {
  return (
    <Title
      className={classes.title}
      ta="center"
      mt={100}
      fw={900}
      fz={rem(100)}
      styles={{ root: { letterSpacing: rem(-1) } }}
    >
      Welcome to <KetoTrack />
    </Title>
  );
}
