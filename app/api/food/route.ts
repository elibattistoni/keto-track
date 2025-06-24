import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Fetch all food from the database
  const food = await prisma.foods.findMany();
  return NextResponse.json(food);
}
