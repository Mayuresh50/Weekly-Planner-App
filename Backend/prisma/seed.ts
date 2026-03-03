import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Users
  const lead = await prisma.user.upsert({
    where: { email: 'lead@example.com' },
    update: {},
    create: {
      email: 'lead@example.com',
      name: 'Team Lead',
      password: hashedPassword,
      role: 'TEAM_LEAD',
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      name: 'Team Member',
      password: hashedPassword,
      role: 'TEAM_MEMBER',
    },
  });

  // Backlog Items
  await prisma.backlogItem.createMany({
    data: [
      { title: 'Feature A', description: 'Internal feature', category: 'CLIENT', estimatedHours: 8, status: 'BACKLOG' },
      { title: 'Refactor Auth', description: 'Fix technical debt', category: 'TECH_DEBT', estimatedHours: 4, status: 'BACKLOG' },
      { title: 'Research AI', description: 'Explore new tech', category: 'RND', estimatedHours: 10, status: 'BACKLOG' },
    ],
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
