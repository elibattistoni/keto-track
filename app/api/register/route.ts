// API router for mobile/external user registration
// ⚠️ TODO ELISA THIS IS NOT BEING USED AT THE MOMENT (needed for mobile/external app)
// ✅ TESTED WITH POSTMAN
import { NextRequest, NextResponse } from 'next/server';
import { messages } from '@/lib/messages';
import { registerUser } from '@/lib/register-user';

/*
	•	The API always returns both ⁠success and ⁠error keys, matching the shared logic in registerUser
  •	On validation or business logic errors, it returns ⁠{ success: null, error: { ... } } with HTTP 400.
  •	On system errors (e.g., server crash), it returns ⁠{ success: null, error: { general: ... } } with HTTP 500.
  •	On success, it returns ⁠{ success: 'Registration successful! You can now log in.', error: null } with HTTP 200.
*/

export async function POST(req: NextRequest) {
  try {
    // Validate Content-Type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        {
          success: null,
          error: { general: 'Content-Type must be application/json' },
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name = '', email = '', password = '', confirmPassword = '' } = body;

    // Basic input validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: null,
          error: { general: 'All fields are required' },
        },
        { status: 400 }
      );
    }

    const result = await registerUser({ name, email, password, confirmPassword });

    return NextResponse.json(
      {
        success: result.success,
        error: result.error,
      },
      {
        status: result.error ? 400 : 200,
      }
    );
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      {
        success: null,
        error: { general: messages.registration.failed },
      },
      {
        status: 500,
      }
    );
  }
}
