import { useTranslations } from 'next-intl';
import { hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';
import { RegistrationFormFields } from '@/types/auth';

export function useRegisterForm() {
  // hook used in client side component
  const t = useTranslations('Authentication');

  return useForm<RegistrationFormFields>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) =>
        isNotEmpty(t('registration.nameRequired'))(value) ||
        hasLength({ min: 3 }, t('registration.nameTooShort'))(value),
      email: (value) =>
        isNotEmpty(t('shared.emailRequired'))(value) || isEmail(t('shared.invalidEmail'))(value),
      password: (value) =>
        isNotEmpty(t('shared.passwordRequired'))(value) ||
        hasLength({ min: 6 }, t('shared.passwordTooShort'))(value),
      confirmPassword: (value, values) =>
        isNotEmpty(t('shared.confirmPasswordRequired'))(value) ||
        (value !== values.password ? t('shared.passwordsDoNotMatch') : null),
    },
    // validateInputOnChange: true,
    validateInputOnBlur: true,
    onSubmitPreventDefault: 'validation-failed',
  });
}
