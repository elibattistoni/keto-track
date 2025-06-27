import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { RegistrationForm } from '@/components';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }
  return <RegistrationForm />;
}
