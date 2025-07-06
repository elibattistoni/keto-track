export type RegistrationFormFields = {
  name: string;
  password: string;
  confirmPassword: string;
  email: string;
};
export type LoginFormFields = Pick<RegistrationFormFields, 'email' | 'password'>;
export type AuthFormFields = LoginFormFields | RegistrationFormFields;

export type RegistrationFormError = { [key: string]: null | string };
export type RegisterUserResponse = { success: string | null; error: RegistrationFormError | null };

export type AuthMode = 'login' | 'register';
