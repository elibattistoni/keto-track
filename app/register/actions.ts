'use server';

// server action for internal web app registration
import { registerUserLogic } from '@/lib/auth/register';
import { RegisterUserResponse } from '@/types/registration';

export default async function registerUser(
  prevState: RegisterUserResponse,
  formData: FormData
): Promise<RegisterUserResponse> {
  const name = String(formData.get('name') || '');
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  return registerUserLogic({ name, email, password, confirmPassword });
}
