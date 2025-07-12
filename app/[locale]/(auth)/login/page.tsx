import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LoginForm } from '@/components/auth';

//>> TODO ELISA implement Reset Password functionality

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
