'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { messages } from '@/lib/messages';
import { LoginFormFields } from '@/types/registration';
import { useLoginForm } from '../../hooks/auth/use-login-form';
import { AnimatedBackground } from '../AnimatedBackground/AnimatedBackground';
import { GoogleButton } from '../GoogleButton/GoogleButton';
import { KetoTrack } from '../KetoTrack/KetoTrack';

// TODO improve code with LoadingOverlay & message

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<null | 'success' | 'error'>(null);
  const showOverlay = loading || !!message;

  const mounted = useMounted();

  const form = useLoginForm();

  useEffect(() => {
    if (message && !loading) {
      const timer = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [message, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { email, password } = form.values;

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setMessage('error');
      form.setFieldError('email', messages.login.checkEmail);
      form.setFieldError('password', messages.login.checkPassword);
    } else {
      setMessage('success');
      setTimeout(() => router.push('/dashboard'), 1000);
    }

    setLoading(false);
  };

  const handleFieldChange =
    (field: keyof LoginFormFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
      form.setFieldValue(field, event.currentTarget.value);
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
                {message === 'error' ? messages.login.failed : messages.login.success}
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
                      onChange={handleFieldChange('email')}
                    />
                    <PasswordInput
                      label="Password"
                      placeholder="Your password"
                      withAsterisk
                      key={form.key('password')}
                      {...form.getInputProps('password')}
                      onChange={handleFieldChange('password')}
                    />

                    <Group justify="space-between" mt="lg">
                      <Anchor component={Link} href="/register" c="dimmed" size="xs">
                        Don't have an account? Register
                      </Anchor>
                      <Button type="submit" radius="xl" disabled={loading} loading={loading}>
                        Login
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
