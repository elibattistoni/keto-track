'use client';

import { useState } from 'react';
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';

// TODO improve code

export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => isNotEmpty('Insert email')(value) || isEmail('Invalid email')(value),
      password: (value) =>
        isNotEmpty('Insert password')(value) ||
        hasLength({ min: 6 }, 'Password must be at least 6 characters')(value),
    },
  });

  return (
    <Stack align="center" justify="center">
      <Paper shadow="md" p="xl" withBorder>
        <Stack>
          <Title order={2}>Login</Title>
          <Text size="sm" c="dimmed">
            Enter your credentials to access your account
          </Text>
          {/* TODO FORM: transform into server action */}
          <form>
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
              <Button type="submit" loading={loading} fullWidth>
                Login
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Stack>
  );
}
