import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create Company
  const company = await prisma.company.upsert({
    where: { id: "comp-001" },
    update: {},
    create: {
      id: "comp-001",
      name: "Innova Tech Inc.",
    },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  // 2. Create Manager
  const manager = await prisma.user.upsert({
    where: { email: "manager@company.com" },
    update: { role: "Manager", companyId: company.id },
    create: {
      id: "mgr-001",
      email: "manager@company.com",
      passwordHash,
      role: "Manager",
      companyId: company.id,
    },
  });

  // 3. Create Employee 1
  const employee1 = await prisma.user.upsert({
    where: { email: "employee@company.com" },
    update: { role: "Employee", companyId: company.id },
    create: {
      id: "emp-001",
      email: "employee@company.com",
      passwordHash,
      role: "Employee",
      companyId: company.id,
    },
  });

  // 4. Create Employee 2
  const employee2 = await prisma.user.upsert({
    where: { email: "sarah@company.com" },
    update: { role: "Employee", companyId: company.id },
    create: {
      id: "emp-002",
      email: "sarah@company.com",
      passwordHash,
      role: "Employee",
      companyId: company.id,
    },
  });

  // 5. Create Sample Goals
  await prisma.goal.createMany({
    data: [
      {
        id: "goal-101",
        title: "Optimize pgvector retrieval latency under 100ms",
        description: "Implement automated indexing scripts to reduce query response time.",
        status: "In Progress",
        progress: 65,
        assigneeId: employee1.id,
        managerId: manager.id,
      },
      {
        id: "goal-102",
        title: "Mentor junior team members on system design",
        description: "Lead pair programming sessions for cross-team alignment.",
        status: "Completed",
        progress: 100,
        assigneeId: employee1.id,
        managerId: manager.id,
      },
      {
        id: "goal-103",
        title: "Build automated test suite for API endpoints",
        description: "Achieve 85%+ unit test coverage for submission and goal routes.",
        status: "In Progress",
        progress: 40,
        assigneeId: employee2.id,
        managerId: manager.id,
      },
    ],
  });

  // 6. Create Sample Submissions
  await prisma.submission.createMany({
    data: [
      {
        id: "sub-101",
        type: "SelfAssessment",
        content: "Led the Q2 database migration to pgvector on schedule, reducing latency by 35%.",
        userId: employee1.id,
      },
      {
        id: "sub-102",
        type: "MeetingNote",
        content: "Sprint Retro Transcript: Employee emp-001 resolved 24 high-priority technical debt issues.",
        userId: employee1.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
  console.log("Accounts created:");
  console.log("- Manager:  manager@company.com  / password123");
  console.log("- Employee: employee@company.com / password123");
  console.log("- Employee: sarah@company.com    / password123");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
