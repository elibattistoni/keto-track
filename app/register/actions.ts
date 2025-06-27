'use server';

// server action for internal web app registration
import { registerUserLogic } from '@/lib/auth/register';
import { RegisterUserResponse } from '@/types/registration';

const SIMULATE_DELAY = false;

// Helper to simulate network delay (development only)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function registerUser(
  prevState: RegisterUserResponse,
  formData: FormData
): Promise<RegisterUserResponse> {
  const name = String(formData.get('name') || '');
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  // Simulate slow connection in development
  if (SIMULATE_DELAY && process.env.NODE_ENV === 'development') {
    await delay(2000); // 2 seconds
  }

  return registerUserLogic({ name, email, password, confirmPassword });
}
