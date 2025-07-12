import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { messages } from '@/lib/messages';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

const RequestResetSchema = z.object({
  email: z.string().email({ message: messages.passwordReset.invalidEmail }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = RequestResetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // but only send email if user exists
    if (user) {
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
        await sendPasswordResetEmail({
          email,
          resetUrl,
          userName: user.name || undefined,
        });
        console.log(`✅ Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Still mark token as valid but log the error
        // In production, you might want to handle this differently
        console.log(`🔗 Fallback - Password reset link for ${email}: ${resetUrl}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: messages.passwordReset.emailSent,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
