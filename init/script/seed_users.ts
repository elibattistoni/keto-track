import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

async function main() {
  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('adminpass', 10);

  await prisma.users.createMany({
    data: [
      {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        password: password1,
        role: 'starter',
      },
      {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        password: password2,
        role: 'admin',
      },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
