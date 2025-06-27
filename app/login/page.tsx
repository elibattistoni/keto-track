import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { LoginForm } from '@/components';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
