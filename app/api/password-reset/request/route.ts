import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/reset-password';

export async function POST(request: NextRequest) {
  try {
    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Content-Type must be application/json',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Email is required and must be a string',
        },
        { status: 400 }
      );
    }

    const result = await resetPassword(email);

    if (result.success) {
      return NextResponse.json({
        success: result.message,
        error: null,
      });
    } else {
      return NextResponse.json(
        {
          success: null,
          error: {
            general: result.message,
            ...(result.errors || {}),
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      {
        success: null,
        error: {
          general: 'An error occurred. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
