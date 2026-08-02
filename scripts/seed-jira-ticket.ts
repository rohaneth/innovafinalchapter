import prisma from "../src/lib/db";

async function main() {
  const user = await prisma.user.findFirst({ where: { role: "Employee" } });
  if (!user) {
    console.error("No employee found. Please run seed script first.");
    process.exit(1);
  }

  const dummyTicket = {
    key: "ENG-402",
    summary: "Fix frontend rendering bug in dashboard",
    description: "The dashboard crashes when data is null. Need to add null checks.",
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

