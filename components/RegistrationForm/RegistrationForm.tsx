'use client';

import { useActionState, useEffect, useState } from 'react';
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { registerUser } from '@/app/register/actions';

type FormFields = {
  name: string;
  password: string;
  confirmPassword: string;
  email: string;
};

export function RegistrationForm() {
  const [state, formAction] = useActionState(registerUser, { success: null, error: null });
  const [showMessage, setShowMessage] = useState<null | 'success' | 'error'>(null);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (value.length >= 3 ? null : 'Name too short'),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
    onSubmitPreventDefault: 'validation-failed',
  });

  useEffect(() => {
    console.log('USE EFFECT TRIGGERED', state.error, form.errors);

    if (state.error) {
      form.setErrors(state.error);
    }

    if (state?.error?.general) {
      setShowMessage('error');
    }

    if (state?.success) {
      setShowMessage('success');
    }
  }, [state]);

  // Handler to clear error when field changes
  const handleFieldChange =
    (field: keyof FormFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
      // Update form value
      form.setFieldValue(field, event.currentTarget.value);
      // Clear error for that field
      form.clearFieldError(field);

      if (showMessage === 'error' || showMessage === 'success') {
        setShowMessage(null);
      }
    };

  return (
    <Stack align="center" justify="center">
      <Paper shadow="md" p="xl" withBorder style={{ minWidth: 320, maxWidth: 400 }}>
        <Stack>
          <Title order={2}>Register</Title>
          <Text size="sm">Create a new account</Text>
          <form action={formAction} onSubmit={form.onSubmit(() => {})}>
            <Stack>
              <TextInput
                label="Name"
                placeholder="Your name"
                {...form.getInputProps('name')}
                withAsterisk
                name="name"
                type="text"
                onChange={handleFieldChange('name')}
                // error={state.error?.name || form.errors.name}
              />
              <TextInput
                label="Email"
                placeholder="you@example.com"
                {...form.getInputProps('email')}
                withAsterisk
                name="email"
                type="email"
                onChange={handleFieldChange('email')}
                // error={state.error?.email || form.errors.email}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                {...form.getInputProps('password')}
                withAsterisk
                name="password"
                onChange={handleFieldChange('password')}
                // error={state.error?.password || form.errors.password}
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat your password"
                {...form.getInputProps('confirmPassword')}
                withAsterisk
                name="confirmPassword"
                onChange={handleFieldChange('confirmPassword')}
                // error={state.error?.confirmPassword || form.errors.confirmPassword}
              />

              {showMessage && (
                <Alert color={showMessage === 'error' ? 'red' : 'green'} variant="light">
                  {showMessage === 'error' ? state?.error?.general : state?.success}
                </Alert>
              )}

              <Button type="submit" fullWidth>
                Register
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Stack>
  );
}
