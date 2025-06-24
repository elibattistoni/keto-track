import { Welcome } from '@/components';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const food = await prisma.food.findMany();
  // console.log('Fetched food:', food);
  return <Welcome />;
}
