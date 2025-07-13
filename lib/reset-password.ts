import crypto from 'crypto';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/send-email';

export interface PasswordResetResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export async function resetPassword(email: string): Promise<PasswordResetResult> {
  const t = await getTranslations('Authentication');

  const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: t('shared.invalidEmail') }),
  });

  try {
    // Validate input
    const result = ForgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const err of result.error.errors) {
        errors[err.path[0] as string] = err.message;
      }
      return {
        success: false,
        message: t('passwordReset.failed'),
        errors,
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        success: false,
        message: t('passwordReset.failed'),
        errors: {
          email: t('passwordReset.notExistingEmail'),
        },
      };
    }

    // Invalidate any existing tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: {
        email,
        used: false,
        expires: { gt: new Date() },
      },
      data: { used: true },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
      // Send password reset email
      await sendEmail({
        email,
        resetUrl,
        userName: user.name || undefined,
      });
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue with success response since token was created
      console.log(`🔗 Fallback - Password reset link for ${email}: ${resetUrl}`);
    }

    return {
      success: true,
      message: t('passwordReset.emailSent'),
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: t('passwordReset.failed'),
    };
  }
}
