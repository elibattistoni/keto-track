import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const t = await getTranslations('Authentication');

  const ConfirmResetSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(6, { message: t('shared.passwordTooShort') }),
  });

  try {
    const body = await request.json();
    const result = ConfirmResetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
          message: t('shared.allInvalid'),
        },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    // Validate token
    if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: resetToken?.used
            ? t('passwardReset.tokenUsed')
            : t('passwardReset.tokenExpired'),
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: t('passwardReset.invalidToken'),
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    console.log(`✅ Password reset successful for ${user.email}`);

    return NextResponse.json({
      success: true,
      message: t('passwardReset.success'),
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: t('passwardReset.failed'),
      },
      { status: 500 }
    );
  }
}
