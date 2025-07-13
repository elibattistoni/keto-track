import { hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';
import { messages } from '@/lib/messages';
import { LoginFormFields } from '@/types/registration';

export function useLoginForm() {
  return useForm<LoginFormFields>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) =>
        isNotEmpty(messages.login.emailRequired)(value) ||
        isEmail(messages.login.invalidEmail)(value),
      password: (value) =>
        isNotEmpty(messages.login.passwordRequired)(value) ||
        hasLength({ min: 6 }, messages.login.passwordTooShort)(value),
    },
    validateInputOnBlur: true,
  });
}
