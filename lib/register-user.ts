// contains the shared registration logic
// (shared between the server action app/register/actions.ts and the route handler app/api/register/route.ts)

import bcrypt from 'bcrypt';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { FormError, RegisterUserResponse, RegistrationFormFields } from '@/types/auth';

export async function registerUser(input: RegistrationFormFields): Promise<RegisterUserResponse> {
  const t = await getTranslations('Authentication');

  const RegisterSchema = z
    .object({
      name: z.string().min(3, { message: t('registration.nameTooShort') }),
      email: z.string().email({ message: t('shared.invalidEmail') }),
      password: z.string().min(6, { message: t('shared.passwordTooShort') }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('shared.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  const error: FormError = {
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
    general: null,
  };

  try {
    const { name, email, password, confirmPassword } = input;

    const result = RegisterSchema.safeParse({ name, email, password, confirmPassword });

    if (!result.success) {
      for (const err of result.error.errors) {
        error[err.path[0] as keyof typeof error] = err.message;
      }
      return {
        success: null,
        error: { ...error, general: t('registration.failed') },
      };
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return {
        success: null,
        error: {
          ...error,
          email: t('registration.emailTaken'),
          general: t('registration.failed'),
        },
      };
    }

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);

    // TODO: Add role if needed
    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return { success: t('registration.success'), error: null };
  } catch (e: any) {
    return {
      success: null,
      error: {
        ...error,
        general: t('registration.failed'),
      },
    };
  }
}
