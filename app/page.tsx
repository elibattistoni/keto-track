import { Welcome } from '@/components/layout';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const foods = await prisma.foods.findMany();
  // console.log('Fetched food:', foods);
  return <Welcome />;
}
