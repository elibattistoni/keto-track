'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Alert,
  Button,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Portal,
  Stack,
  Text,
  TextInput,
  Title,
  Transition,
} from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import { messages } from '@/lib/messages';
import { LoginFormFields } from '@/types/registration';
import { GoogleButton } from '../GoogleButton/GoogleButton';
import { useAuthForm } from './use-auth-form';

export function AuthenticationForm() {
  const router = useRouter();
  const mounted = useMounted();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const form = useAuthForm(isLogin ? 'login' : 'register');

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<null | 'success' | 'error'>(null);
  const showOverlay = loading || !!message;

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
      <Transition transition="scale" duration={2000} timingFunction="ease" mounted={mounted}>
        {(styles) => (
          <Container size="xs" style={styles}>
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
                      <Text
                        fz="xs"
                        c="dimmed"
                        td="underline"
                        onClick={() => setIsLogin(!isLogin)}
                        styles={{ root: { cursor: 'pointer' } }}
                      >
                        {isLogin
                          ? "Don't have an account? Register"
                          : 'Already have an account? Login'}
                      </Text>
                      <Button type="submit" radius="xl" disabled={loading} loading={loading}>
                        {isLogin ? 'Login' : 'Register'}
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
