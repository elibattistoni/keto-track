'use client';

import { useState } from 'react';
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

// TODO improve code

export function RegistrationForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  return (
    <Stack align="center" justify="center">
      <Paper shadow="md" p="xl" withBorder style={{ minWidth: 320, maxWidth: 400 }}>
        <Stack>
          <Title order={2}>Register</Title>
          <Text size="sm">Create a new account</Text>
          {/* TODO server action to handle form submission */}
          <form>
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                {...form.getInputProps('email')}
                required
                type="email"
                autoComplete="email"
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                {...form.getInputProps('password')}
                required
                autoComplete="new-password"
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat your password"
                {...form.getInputProps('confirmPassword')}
                required
                autoComplete="new-password"
              />
              {error && (
                <Alert color="red" variant="light">
                  {error}
                </Alert>
              )}
              {success && (
                <Alert color="green" variant="light">
                  {success}
                </Alert>
              )}
              <Button type="submit" loading={loading} fullWidth>
                Register
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Stack>
  );
}
