import { useTranslations } from 'next-intl';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import { ForgotPasswordFormFields } from '@/types/auth';

export function useForgotPasswordForm() {
  // hook used in client side component
  const t = useTranslations('Authentication');

  return useForm<ForgotPasswordFormFields>({
    initialValues: { email: '' },
    validate: {
      email: (value) =>
        isNotEmpty(t('shared.emailRequired'))(value) || isEmail(t('shared.invalidEmail'))(value),
    },
    validateInputOnBlur: true,
    onSubmitPreventDefault: 'validation-failed',
  });
}
