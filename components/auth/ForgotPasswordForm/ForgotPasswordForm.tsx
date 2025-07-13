'use client';

import { useActionState, useEffect, useState } from 'react';
import { IconAt } from '@tabler/icons-react';
import {
  Alert,
  Anchor,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Portal,
  Stack,
  Text,
  TextInput,
  Title,
  Transition,
} from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import passwordResetRequestAction from '@/actions/auth/password-reset-request-action';
import { AnimatedBackground } from '@/components/layout';
import { useForgotPasswordForm } from '@/hooks/use-forgot-password-form';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ForgotPasswordFormFields } from '@/types/auth';

export const ForgotPasswordForm = () => {
  const mounted = useMounted();
  const t = useTranslations('Authentication');

  const [state, formAction, isPending] = useActionState(passwordResetRequestAction, {
    success: null,
    error: null,
  });

  const [message, setMessage] = useState<null | 'success' | 'error'>(null);
  const showOverlay = isPending || !!message;

  const iconAt = <IconAt size={16} />;

  const form = useForgotPasswordForm();

  // this keeps in sync the state errors (from the server action) with the form errors (from Mantine useForm)
  useEffect(() => {
    if (state?.error) {
      form.setErrors(state.error);
    }

    if (state?.error?.general) {
      setMessage('error');
    }

    if (state?.success) {
      setMessage('success');
    }
  }, [state]);

  // Show message for a short time after it appears
  useEffect(() => {
    if (message && !isPending) {
      const timer = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [message, isPending]);

  const handleFieldChange =
    (field: keyof ForgotPasswordFormFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
                {message === 'error'
                  ? t('passwordReset.failed')
                  : t('passwordReset.emailSent')}
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
                <Stack gap="xxs">
                  <Title order={2} ta="center" m={0}>
                    Forgot your password?
                  </Title>
                  <Text size="xs" c="dimmed" ta="center">
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>
                </Stack>
                <form action={formAction} onSubmit={form.onSubmit(() => {})}>
                  <Stack>
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
                    <Group justify="space-between" mt="lg">
                      <Anchor component={Link} href="/login" c="dimmed" size="xs" ta="center">
                        Back to Login
                      </Anchor>
                      <Button type="submit" radius="xl" disabled={isPending} loading={isPending}>
                        Send Reset Link
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
};
