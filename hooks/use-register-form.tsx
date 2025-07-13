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
        isNotEmpty(messages.registration.nameRequired)(value) ||
        hasLength({ min: 3 }, messages.registration.nameTooShort)(value),
      email: (value) =>
        isNotEmpty(messages.registration.emailRequired)(value) ||
        isEmail(messages.registration.invalidEmail)(value),
      password: (value) =>
        isNotEmpty(messages.registration.passwordRequired)(value) ||
        hasLength({ min: 6 }, messages.registration.passwordTooShort)(value),
      confirmPassword: (value, values) =>
        isNotEmpty(messages.registration.confirmPasswordRequired)(value) ||
        (value !== values.password ? messages.registration.passwordsDoNotMatch : null),
    },
    // validateInputOnChange: true,
    validateInputOnBlur: true,
    onSubmitPreventDefault: 'validation-failed',
  });
}
