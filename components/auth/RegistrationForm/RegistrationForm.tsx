'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IconAt from '@tabler/icons-react/dist/esm/icons/IconAt';
import IconLock from '@tabler/icons-react/dist/esm/icons/IconLock';
import { signIn } from 'next-auth/react';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Portal,
  Stack,
  TextInput,
  Title,
  Transition,
} from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import registerUser from '@/actions/auth/registerUser';
import { messages } from '@/lib/messages';
import { RegistrationFormFields } from '@/types/registration';
import { useRegisterForm } from '../../../hooks/auth/use-register-form';
import { AnimatedBackground } from '../../layout/AnimatedBackground/AnimatedBackground';
import { KetoTrack } from '../../layout/KetoTrack/KetoTrack';
import { GoogleButton } from '../GoogleButton/GoogleButton';
import { StrengthMeterPasswordInput } from './StrengthMeterPasswordInput';

export function RegistrationForm() {
  const router = useRouter();
  const mounted = useMounted();

  const [state, formAction, isPending] = useActionState(registerUser, {
    success: null,
    error: null,
  });

  const [message, setMessage] = useState<null | 'success' | 'error'>(null);
  const [autoLogin, setAutoLogin] = useState<boolean>(false);
  const isLoading = isPending || autoLogin;
  // the !! converts the value to a boolean (false if ShowMessage is null, otherwise true)
  const showOverlay = isLoading || !!message;

  const iconAt = <IconAt size={16} />;
  const iconLock = <IconLock size={18} stroke={1.5} />;

  const form = useRegisterForm();

  // this keeps in sync the state errors (from the server action) with the form errors (from Mantine useForm)
  useEffect(() => {
    console.log('USE EFFECT TRIGGERED', state.error, form.errors);

    if (state?.error) {
      form.setErrors(state.error);
    }

    if (state?.error?.general) {
      setMessage('error');
    }

    if (state?.success) {
      setMessage('success');
      setAutoLogin(true);
    }
  }, [state]);

  // Auto-login effect
  useEffect(() => {
    if (autoLogin) {
      console.log('AUTOLOGIN TRUE');

      // Wait a short moment to show the success message, then sign in
      const timer = setTimeout(async () => {
        const res = await signIn('credentials', {
          email: form.values.email,
          password: form.values.password,
          redirect: false,
        });

        // if successful, redirect to dashboard
        if (res && !res.error) {
          // Wait another moment for UX, then redirect
          setTimeout(() => router.push('/dashboard'), 1000);
        }

        // if there was an error, show it
        if (res && res.error) {
          form.setErrors({ ...form.errors, general: messages.login.autoLoginFailed });
          setMessage('error');
        }
      }, 1200); // 1.2 seconds before auto-login

      return () => clearTimeout(timer);
    }
  }, [autoLogin, form.values.email, form.values.password, router]);

  // Show message for a short time after it appears
  useEffect(() => {
    if (message && !isLoading) {
      const timer = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [message, isLoading]);

  // issue that this solves:
  // if you get back an error from the server action, if the user starts typing, the error is not cleared immediately
  // which is what we want for better UX
  // so we clear the error for that field when the user starts typing
  // this is a workaround, as Mantine's useForm does not provide a way to clear errors on field change directly.
  const handleFieldChange =
    (field: keyof RegistrationFormFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
      // update form value (needed because with the onChange handler, Mantine's useForm does not update the value automatically)
      form.setFieldValue(field, event.currentTarget.value);
      // clear error for that field
      form.clearFieldError(field);
    };

  return (
    <>
      <AnimatedBackground />
      <Portal>
        <LoadingOverlay
          visible={showOverlay}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{
            children: message && (
              <Alert color={message === 'error' ? 'red' : 'green'} mt="500px">
                {message === 'error' ? messages.registration.failed : messages.registration.success}
              </Alert>
            ),
          }}
        />
      </Portal>
      <Transition transition="fade" duration={1000} timingFunction="ease" mounted={mounted}>
        {(styles) => (
          <Container size="xs" style={styles}>
            <Paper shadow="md" p="xl" withBorder radius="md">
              <Stack>
                <Title order={2} ta="center">
                  Welcome to <KetoTrack />
                </Title>
                <Divider label="Register with" labelPosition="center" my="xs" />
                <Group justify="center">
                  <GoogleButton radius="xl">Google</GoogleButton>
                </Group>
                <Divider label="Or continue with email" labelPosition="center" my="xs" />
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
                      leftSectionPointerEvents="none"
                      leftSection={iconAt}
                    />
                    <StrengthMeterPasswordInput
                      label="Password"
                      placeholder="Your password"
                      {...form.getInputProps('password')}
                      withAsterisk
                      name="password"
                      onChange={handleFieldChange('password')}
                      leftSectionPointerEvents="none"
                      leftSection={iconLock}
                    />
                    <PasswordInput
                      label="Confirm Password"
                      placeholder="Repeat your password"
                      {...form.getInputProps('confirmPassword')}
                      withAsterisk
                      name="confirmPassword"
                      onChange={handleFieldChange('confirmPassword')}
                      leftSectionPointerEvents="none"
                      leftSection={iconLock}
                    />
                    <Group justify="space-between" mt="lg">
                      <Anchor component={Link} href="/login" c="dimmed" size="xs">
                        Already have an account? Login
                      </Anchor>
                      <Button type="submit" disabled={isLoading} loading={isLoading} radius="xl">
                        Register
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Stack>
            </Paper>
          </Container>
        )}
      </Transition>
    </>
  );
}
