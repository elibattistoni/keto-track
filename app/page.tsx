import { Welcome } from '@/components';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const foods = await prisma.foods.findMany();
  // console.log('Fetched food:', food);
  return <Welcome />;
}
