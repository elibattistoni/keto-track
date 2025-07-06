import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

//>> TODO fetch user-specific data from the database using session.user.email or session.user.id

export default async function DashboardPage() {
  // when page loads, get the session on the server
  const session = await getServerSession(authOptions);
  // if not logged in, redirect to login
  if (!session) {
    redirect('/login');
  }

  const foods = await prisma.foods.findMany();
  // console.log('Fetched food:', foods);

  return <div>Welcome to your dashboard, {session.user?.name || session.user?.email}!</div>;
}
