import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Fetch all vegetables from the database
  const vegetables = await prisma.vegetables.findMany();
  return NextResponse.json(vegetables);
}
