// API router for mobile/external user registration
// ⚠️ TODO ELISA THIS IS NOT BEING USED AT THE MOMENT (needed for mobile/external app)
// ✅ TESTED WITH POSTMAN
import { NextRequest, NextResponse } from 'next/server';
import { userRegistrationLogic } from '@/lib/auth/register';
import { messages } from '@/lib/messages';

/*
	•	The API always returns both ⁠success and ⁠error keys, matching the shared logic in userRegistrationLogic
  •	On validation or business logic errors, it returns ⁠{ success: null, error: { ... } } with HTTP 400.
  •	On system errors (e.g., server crash), it returns ⁠{ success: null, error: { general: ... } } with HTTP 500.
  •	On success, it returns ⁠{ success: 'Registration successful! You can now log in.', error: null } with HTTP 200.
*/

export async function POST(req: NextRequest) {
  try {
    const { name = '', email = '', password = '', confirmPassword = '' } = await req.json();

    const result = await userRegistrationLogic({ name, email, password, confirmPassword });

    return NextResponse.json(
      {
        success: result.success,
        error: result.error,
      },
      {
        status: result.error ? 400 : 200,
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: null,
        error: { general: messages.register.failed },
      },
      {
        status: 500,
      }
    );
  }
}
