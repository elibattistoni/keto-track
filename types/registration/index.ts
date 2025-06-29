export type RegisterFormFields = {
  name: string;
  password: string;
  confirmPassword: string;
  email: string;
};
export type LoginFormFields = Pick<RegisterFormFields, 'email' | 'password'>;
export type AuthFormFields = LoginFormFields | RegisterFormFields;

export type RegistrationFormError = { [key: string]: null | string };
export type RegisterUserResponse = { success: string | null; error: RegistrationFormError | null };

export type AuthMode = 'login' | 'register';
