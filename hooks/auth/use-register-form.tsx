import { hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';
import { messages } from '@/lib/messages';
import { RegistrationFormFields } from '@/types/registration';

export function useRegisterForm() {
  return useForm<RegistrationFormFields>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) =>
        isNotEmpty(messages.register.nameRequired)(value) ||
        hasLength({ min: 3 }, messages.register.nameTooShort)(value),
      email: (value) =>
        isNotEmpty(messages.register.emailRequired)(value) ||
        isEmail(messages.register.invalidEmail)(value),
      password: (value) =>
        isNotEmpty(messages.register.passwordRequired)(value) ||
        hasLength({ min: 6 }, messages.register.passwordTooShort)(value),
      confirmPassword: (value, values) =>
        isNotEmpty(messages.register.confirmPasswordRequired)(value) ||
        (value !== values.password ? messages.register.passwordsDoNotMatch : null),
    },
    // validateInputOnChange: true,
    validateInputOnBlur: true,
    onSubmitPreventDefault: 'validation-failed',
  });
}
