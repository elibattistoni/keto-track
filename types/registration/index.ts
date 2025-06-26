export type FormFields = {
  name: string;
  password: string;
  confirmPassword: string;
  email: string;
};

export type RegistrationFormError = { [key: string]: null | string };

export type RegisterUserResponse = { success: string | null; error: RegistrationFormError | null };
