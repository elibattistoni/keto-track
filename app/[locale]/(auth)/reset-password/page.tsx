'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { messages } from '@/lib/messages';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'error',
        text: messages.passwordReset.invalidToken,
      });
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = messages.passwordReset.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = messages.passwordReset.passwordTooShort;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = messages.passwordReset.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = messages.passwordReset.passwordsDoNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setMessage({
        type: 'error',
        text: messages.passwordReset.invalidToken,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: messages.passwordReset.success,
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || messages.passwordReset.failed,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: messages.passwordReset.failed,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Container size="xs">
        <Paper shadow="md" p="xl" withBorder radius="md">
          <Stack>
            <Title order={2} ta="center">
              Invalid Reset Link
            </Title>
            <Alert color="red">{messages.passwordReset.invalidToken}</Alert>
            <Anchor component={Link} href="/forgot-password" ta="center">
              Request a new reset link
            </Anchor>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs">
      <Paper shadow="md" p="xl" withBorder radius="md">
        <Stack>
          <Title order={2} ta="center">
            Set New Password
          </Title>

          <Text size="sm" c="dimmed" ta="center">
            Enter your new password below.
          </Text>

          {message && (
            <Alert color={message.type === 'error' ? 'red' : 'green'}>{message.text}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack>
              <PasswordInput
                label="New Password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.currentTarget.value);
                  setErrors({ ...errors, password: undefined });
                }}
                error={errors.password}
                withAsterisk
                disabled={loading}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.currentTarget.value);
                  setErrors({ ...errors, confirmPassword: undefined });
                }}
                error={errors.confirmPassword}
                withAsterisk
                disabled={loading}
              />

              <Button type="submit" radius="xl" disabled={loading} loading={loading} fullWidth>
                Reset Password
              </Button>

              <Anchor component={Link} href="/login" c="dimmed" size="sm" ta="center">
                Back to Login
              </Anchor>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
