// contains the shared registration logic
// (shared between the server action app/register/actions.ts and the route handler app/api/register/route.ts)

import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  RegisterUserResponse,
  RegistrationFormError,
  RegistrationFormFields,
} from '@/types/registration';
import { messages } from '../messages';

const RegisterSchema = z
  .object({
    name: z.string().min(3, { message: messages.registration.nameTooShort }),
    email: z.string().email({ message: messages.registration.invalidEmail }),
    password: z.string().min(6, { message: messages.registration.passwordTooShort }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.registration.passwordsDoNotMatch,
    path: ['confirmPassword'],
  });

export async function userRegistrationLogic(
  input: RegistrationFormFields
): Promise<RegisterUserResponse> {
  const error: RegistrationFormError = {
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
        error: { ...error, general: messages.registration.failed },
      };
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return {
        success: null,
        error: {
          ...error,
          email: messages.registration.emailTaken,
          general: messages.registration.failed,
        },
      };
    }

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);

    // TODO: Add role if needed
    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return { success: messages.registration.success, error: null };
  } catch (e: any) {
    return {
      success: null,
      error: {
        ...error,
        general: messages.registration.failed,
      },
    };
  }
}
