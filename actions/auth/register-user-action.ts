'use server';

// server action for internal web app registration
import { delay } from '@/lib/delay';
import { registerUser } from '@/lib/register-user';
import { RegisterUserResponse } from '@/types/auth';

export default async function registerUserAction(
  prevState: RegisterUserResponse,
  formData: FormData
): Promise<RegisterUserResponse> {
  const name = String(formData.get('name') || '');
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  await delay(2000);

  return registerUser({ name, email, password, confirmPassword });
}
