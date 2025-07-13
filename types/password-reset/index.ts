export type ForgotPasswordFormFields = {
  email: string;
};

export type ForgotPasswordFormError = { [key: string]: null | string };
export type SendPasswordResetEmailResponse = {
  success: string | null;
  error: ForgotPasswordFormError | null;
};
