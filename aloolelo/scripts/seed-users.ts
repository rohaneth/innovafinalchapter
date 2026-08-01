import 'dotenv/config';
import { prisma } from '../src/lib/vector/client';
import bcrypt from 'bcrypt';

async function seedUsers() {
  console.log('👤 Seeding dummy accounts (Manager and Employee)...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Seed Manager
  await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: { password: passwordHash, role: 'Manager' },
    create: {
      email: 'manager@company.com',
      name: 'Dummy Manager',
      password: passwordHash,
      role: 'Manager',
    },
  });

  // Seed Employee
  await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: { password: passwordHash, role: 'Employee', id: 'emp-001' },
    create: {
      id: 'emp-001',
      email: 'employee@company.com',
      name: 'Alex Vance',
      password: passwordHash,
      role: 'Employee',
    },
  });

  console.log('✅ Dummy accounts successfully seeded!');
}

seedUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
