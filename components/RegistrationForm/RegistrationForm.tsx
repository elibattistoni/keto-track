'use client';

import { useActionState, useEffect, useState } from 'react';
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { registerUser } from '@/app/register/actions';
import { FormFields } from '@/types/registration';

export function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerUser, {
    success: null,
    error: null,
  });
  const [showMessage, setShowMessage] = useState<null | 'success' | 'error'>(null);

  const form = useForm<FormFields>({
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

  // this keeps in sync the state errors (from the server action) with the form errors (from Mantine useForm)
  useEffect(() => {
    console.log('USE EFFECT TRIGGERED', state.error, form.errors);

    if (state?.error) {
      form.setErrors(state.error);
    }

    if (state?.error?.general) {
      setShowMessage('error');
    }

    if (state?.success) {
      setShowMessage('success');
    }
  }, [state]);

  // issue that this solves:
  // if you get back an error from the server action, if the user starts typing, the error is not cleared immediately
  // which is what we want for better UX
  // so we clear the error for that field when the user starts typing
  // this is a workaround, as Mantine's useForm does not provide a way to clear errors on field change directly.
  const handleFieldChange =
    (field: keyof FormFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
      // update form value (needed because with the onChange handler, Mantine's useForm does not update the value automatically)
      form.setFieldValue(field, event.currentTarget.value);
      // clear error for that field
      form.clearFieldError(field);
      // remove the general error/message if the user starts typing
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
          {/* action triggers the server action, which performs server side validation */}
          {/* onSubmit triggers the mantine useForm validate function, which performs client side validation */}
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
              />
              <TextInput
                label="Email"
                placeholder="you@example.com"
                {...form.getInputProps('email')}
                withAsterisk
                name="email"
                type="email"
                onChange={handleFieldChange('email')}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                {...form.getInputProps('password')}
                withAsterisk
                name="password"
                onChange={handleFieldChange('password')}
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat your password"
                {...form.getInputProps('confirmPassword')}
                withAsterisk
                name="confirmPassword"
                onChange={handleFieldChange('confirmPassword')}
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
