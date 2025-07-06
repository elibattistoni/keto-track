'use server';

// server action for internal web app registration
import { userRegistrationLogic } from '@/lib/auth/register';
import { delay } from '@/lib/delay';
import { RegisterUserResponse } from '@/types/registration';

export default async function registerUser(
  prevState: RegisterUserResponse,
  formData: FormData
): Promise<RegisterUserResponse> {
  const name = String(formData.get('name') || '');
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  await delay(2000);

  return userRegistrationLogic({ name, email, password, confirmPassword });
}
