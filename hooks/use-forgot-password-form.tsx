import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { messages } from '@/lib/messages';
import { ForgotPasswordFormFields } from '@/types/password-reset';

export function useForgotPasswordForm() {
  return useForm<ForgotPasswordFormFields>({
    initialValues: { email: '' },
    validate: {
      email: (value) =>
        isNotEmpty(messages.passwordReset.emailRequired)(value) ||
        isEmail(messages.passwordReset.invalidEmail)(value),
    },
    validateInputOnBlur: true,
    onSubmitPreventDefault: 'validation-failed',
  });
}
