import Link from 'next/link';
import { Button, Group } from '@mantine/core';
import { WelcomeTitle } from './WelcomeTitle';

export function Welcome() {
  return (
    <>
      <WelcomeTitle />
      <Group justify="center" mt="xl">
        <Button variant="default" component={Link} href="/login">
          Log in
        </Button>
        <Button component={Link} href="/register">
          Sign up
        </Button>
      </Group>
    </>
  );
}
