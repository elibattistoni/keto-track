import { useMemo } from 'react';
import { hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form';
import { messages } from '@/lib/messages';
import { AuthFormFields, AuthMode } from '@/types/registration';

const emailValidator = (value: string, mode: AuthMode) =>
  isNotEmpty(messages[mode].emailRequired)(value) || isEmail(messages[mode].invalidEmail)(value);

const passwordValidator = (value: string, mode: AuthMode) =>
  isNotEmpty(messages[mode].passwordRequired)(value) ||
  hasLength({ min: 6 }, messages[mode].passwordTooShort)(value);

const nameValidator = (value: string) =>
  isNotEmpty(messages.register.nameRequired)(value) ||
  hasLength({ min: 3 }, messages.register.nameTooShort)(value);

const confirmPasswordValidator = (passwordValue: string, confirmPasswordValue: string) =>
  isNotEmpty(messages.register.confirmPasswordRequired)(confirmPasswordValue) ||
  (confirmPasswordValue !== passwordValue ? messages.register.passwordsDoNotMatch : null);

/**
 * Custom hook, wrapper around useForm Mantine hook.
 * It creates a form for authentication (login or registration).
 * @param {'login' | 'register'} authType - Determines if the form is for login or registration.
 * @param {object} [customInitialValues] - Optional custom initial values.
 * @returns {object} - The form object with initial values and validation rules.
 */
export function useAuthForm(authType: AuthMode) {
  const isLogin = authType === 'login';

  const initialValues = useMemo(
    () =>
      ({
        ...(isLogin
          ? { email: '', password: '' }
          : { name: '', email: '', password: '', confirmPassword: '' }),
      }) as AuthFormFields,
    [isLogin]
  );

  const validate = useMemo(
    () =>
      isLogin
        ? {
            email: (value: string) => emailValidator(value, 'login'),
            password: (value: string) => passwordValidator(value, 'login'),
          }
        : {
            name: (value: string) => nameValidator(value),
            email: (value: string) => emailValidator(value, 'register'),
            password: (value: string) => passwordValidator(value, 'register'),
            confirmPassword: (value: string, values: AuthFormFields) =>
              confirmPasswordValidator(values.password, value),
          },
    [isLogin]
  );

  return useForm<AuthFormFields>({
    initialValues,
    validate,
    validateInputOnBlur: true,
    onSubmitPreventDefault: 'validation-failed',
  });
}
