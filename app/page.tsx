import { Welcome } from '@/components';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const vegetables = await prisma.vegetables.findMany();
  console.log('Fetched vegetables:', vegetables);
  return <Welcome />;
}
