import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { AuthenticationForm } from '@/components';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export default async function AuthPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }
  return <AuthenticationForm />;
}
