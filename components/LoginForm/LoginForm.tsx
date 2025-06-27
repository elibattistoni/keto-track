'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';
import { messages } from '@/lib/messages';
import { GoogleButton } from '../GoogleButton/GoogleButton';

// TODO improve code with LoadingOverlay & message

export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) =>
        isNotEmpty(messages.login.emailRequired)(value) ||
        isEmail(messages.login.invalidEmail)(value),
      password: (value) =>
        isNotEmpty(messages.login.passwordRequired)(value) ||
        hasLength({ min: 6 }, messages.login.passwordTooShort)(value),
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { email, password } = form.values;

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <Container size="xs">
      <Paper shadow="md" p="xl" withBorder>
        <Stack>
          <Title order={2} ta="center">
            Welcome to KetoTrack
          </Title>
          <Divider label="Login with" labelPosition="center" my="xs" />
          <Group justify="center">
            <GoogleButton radius="xl">Google</GoogleButton>
          </Group>
          <Divider label="Or continue with email" labelPosition="center" my="xs" />
          {/* TODO FORM: transform into server action */}
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                withAsterisk
                key={form.key('email')}
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                withAsterisk
                key={form.key('password')}
                {...form.getInputProps('password')}
              />
              {error && (
                <Alert color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Group justify="space-between" mt="lg">
                <Anchor component={Link} href="/register" c="dimmed" size="xs">
                  Don't have an account? Register
                </Anchor>
                <Button type="submit" radius="xl">
                  Login
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
