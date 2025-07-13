'use server';

import { delay } from '@/lib/delay';
import { resetPassword } from '@/lib/reset-password';
import { ForgotPasswordFormError, SendPasswordResetEmailResponse } from '@/types/password-reset';

export default async function passwordResetRequestAction(
  prevState: SendPasswordResetEmailResponse,
  formData: FormData
): Promise<SendPasswordResetEmailResponse> {
  const email = String(formData.get('email') || '');

  await delay(2000);

  const result = await resetPassword(email);

  if (result.success) {
    return {
      success: result.message,
      error: null,
    };
  } else {
    const error: ForgotPasswordFormError = { email: null, general: null };

    // Map errors to your form format
    if (result.errors) {
      Object.keys(result.errors).forEach((key) => {
        error[key as keyof ForgotPasswordFormError] = result.errors![key];
      });
    }

    return {
      success: null,
      error: {
        ...error,
        general: result.message,
      },
    };
  }
}
