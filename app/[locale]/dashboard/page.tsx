import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { getTranslations } from 'next-intl/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

//>> TODO fetch user-specific data from the database using session.user.email or session.user.id

export default async function DashboardPage({ params }: { params: { locale: 'en' | 'it' } }) {
  // when page loads, get the session on the server
  const session = await getServerSession(authOptions);
  const { locale } = await params;
  // if not logged in, redirect to login
  if (!session) {
    redirect('/login');
  }

  const t = await getTranslations();
  const foods = await prisma.foods.findMany();
  // console.log('Fetched food:', foods);

  return (
    <div>
      {/* <h1>{t('greeting')}</h1>
      <h1>{t('foods')}</h1>
      <h1>{t('cart')}</h1> */}
      <h1>Locale: {locale}</h1>
      {/* {params.locale === 'it' ? food.name_it : food.name_en} */}
      <div>Welcome to your dashboard, {session.user?.name || session.user?.email}!</div>
    </div>
  );
}
