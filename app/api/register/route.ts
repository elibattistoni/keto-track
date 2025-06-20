import { NextRequest, NextResponse } from 'next/server';

//>> TODO add registration to login form

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  //>> TODO: Add database logic, check if user exists, hash password, save user
  // For demo, just return success if email doesn't end with 'fail.com'
  if (email.endsWith('fail.com')) {
    return NextResponse.json({ message: 'Email is not allowed' }, { status: 400 });
  }

  // Simulate user creation
  return NextResponse.json({ message: 'User created' });
}
