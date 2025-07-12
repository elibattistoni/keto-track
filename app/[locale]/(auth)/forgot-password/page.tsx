'use client';

import { useState } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { messages } from '@/lib/messages';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setMessage(null);

    // Validate email
    if (!email) {
      setEmailError(messages.passwordReset.emailRequired);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(messages.passwordReset.invalidEmail);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: messages.passwordReset.emailSent,
        });
        setEmail(''); // Clear the form
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

  return (
    <Container size="xs">
      <Paper shadow="md" p="xl" withBorder radius="md">
        <Stack>
          <Title order={2} ta="center">
            Reset Your Password
          </Title>

          <Text size="sm" c="dimmed" ta="center">
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {message && (
            <Alert color={message.type === 'error' ? 'red' : 'green'}>{message.text}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  setEmailError(null);
                }}
                error={emailError}
                withAsterisk
                disabled={loading}
              />

              <Button type="submit" radius="xl" disabled={loading} loading={loading} fullWidth>
                Send Reset Link
              </Button>

              <Stack gap={8}>
                <Anchor component={Link} href="/login" c="dimmed" size="sm" ta="center">
                  Back to Login
                </Anchor>
                <Anchor component={Link} href="/register" c="dimmed" size="sm" ta="center">
                  Don't have an account? Register
                </Anchor>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
