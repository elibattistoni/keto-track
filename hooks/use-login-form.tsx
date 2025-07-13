import { useTranslations } from 'next-intl';
import { hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';
import { LoginFormFields } from '@/types/auth';

export function useLoginForm() {
  // client side hook
  const t = useTranslations('Authentication');

  return useForm<LoginFormFields>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) =>
        isNotEmpty(t('shared.emailRequired'))(value) || isEmail(t('shared.invalidEmail'))(value),
      password: (value) =>
        isNotEmpty(t('shared.passwordRequired'))(value) ||
        hasLength({ min: 6 }, t('shared.passwordTooShort'))(value),
    },
    validateInputOnBlur: true,
  });
}
