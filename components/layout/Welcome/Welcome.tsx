import { getTranslations } from 'next-intl/server';
import { rem, Title } from '@mantine/core';
import { KetoTrack } from '../KetoTrack/KetoTrack';
import classes from './Welcome.module.css';

export async function Welcome() {
  const t = await getTranslations('HomePage');

  return (
    <Title
      className={classes.title}
      ta="center"
      mt={100}
      fw={900}
      fz={rem(100)}
      styles={{ root: { letterSpacing: rem(-1) } }}
    >
      {t('welcome')} <KetoTrack />
    </Title>
  );
}
