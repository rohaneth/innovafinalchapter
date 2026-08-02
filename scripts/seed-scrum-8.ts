import prisma from "../src/lib/db";

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "Employee" } });
  if (!user) {
    console.error("No employee found. Please run seed script first.");
    process.exit(1);
  }

  const dummyTicket = {
    key: "SCRUM-8",
    summary: "Integrate Jira Webhook into Dashboard",
    description: "Connect the Jira webhook to the employee dashboard so we can track Jira activity as part of performance reviews.",
  };

  const rawText = `Jira Ticket ${dummyTicket.key}: ${dummyTicket.summary}\n${dummyTicket.description}`;

  await prisma.submission.create({
    data: {
      type: "JiraTicket",
      content: rawText,
      userId: user.id,
    }
  });

  console.log(`Successfully seeded Jira ticket ${dummyTicket.key} for ${user.email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

