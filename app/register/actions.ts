'use server';

import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

type RegistrationFormError = { [key: string]: null | string };

const RegisterSchema = z
  .object({
    name: z.string().min(3, { message: 'Name too short' }),
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function registerUser(
  prevState: any,
  formData: FormData
): Promise<{ success: string | null; error: RegistrationFormError | null }> {
  const error: RegistrationFormError = {
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
    general: null,
  };

  try {
    const name = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    const result = RegisterSchema.safeParse({ name, email, password, confirmPassword });

    if (!result.success) {
      for (const err of result.error.errors) {
        error[err.path[0] as keyof typeof error] = err.message;
      }

      return { success: null, error };
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return {
        success: null,
        error: {
          ...error,
          email: 'Email already registered',
          general: 'Registration failed. Please try again.',
        },
      };
    }

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);

    // TODO add role
    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return { success: 'Registration successful! You can now log in.', error: null };
  } catch (e: any) {
    return {
      success: null,
      error: {
        ...error,
        general: 'Registration failed. Please try again.',
      },
    };
  }
}
