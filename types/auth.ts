/*
registration
*/
export type RegistrationFormFields = {
  name: string;
  password: string;
  confirmPassword: string;
  email: string;
};
export type FormError = { [key: string]: null | string };
export type RegisterUserResponse = { success: string | null; error: FormError | null };

/*
login
*/
export type LoginFormFields = Pick<RegistrationFormFields, 'email' | 'password'>;

/*
forgot password & reset password
*/
export type ForgotPasswordFormFields = {
  email: string;
};

export type SendPasswordResetEmailResponse = {
  success: string | null;
  error: FormError | null;
};
