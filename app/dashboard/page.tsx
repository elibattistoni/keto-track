'use client';

// protect pages (require login)
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  // ensure that only logged-in users can access the dashboard
  // when page loads, get the session on the server
  const session = await getServerSession(authOptions);

  // if not logged in, redirect to login
  if (!session) {
    redirect('/login');
  }

  //>> TODO fetch user-specific data from the database using session.user.email or session.user.id

  return (
    <SessionProvider>
      <main>
        <div>Welcome, {session.user.email}!</div>
      </main>
    </SessionProvider>
  );
}
