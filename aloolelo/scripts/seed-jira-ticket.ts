import 'dotenv/config';
import { prisma } from '../src/lib/vector/client';
import { generateEmbedding } from '../src/lib/embeddings/generate';
import { sanitizePII } from '../src/lib/privacy/anonymize';

/**
 * INDEPENDENT JIRA SEEDER MODULE
 * You can copy this script to any other project that uses pgvector.
 * It simulates fetching a Jira ticket and securely embedding it as evidence.
 */
async function seedJiraTicket() {
  console.log('🎫 Simulating Jira Ticket Ingestion...');

  const dummyEmployeeId = 'emp_dummy_001';

  // 1. Mock Jira Ticket Data (as if we just fetched it from Jira API or Webhook)
  const jiraTicket = {
    key: 'PROJ-999',
    summary: 'Implement OAuth Authentication',
    description: 'The OAuth flow was completed ahead of schedule. Contacted bob@client.com to verify the tokens. Call 555-987-6543 if the server goes down.',
    assigneeId: dummyEmployeeId,
  };

  // 2. Combine and scrub sensitive PII from the ticket
  const rawText = `${jiraTicket.summary}\n${jiraTicket.description}`;
  const cleanText = sanitizePII(rawText);
  console.log('Sanitized Jira Ticket:', cleanText);

  // 3. Generate Mathematical Vector Embedding
  let vectorStr = '';
  try {
    const embedding = await generateEmbedding(cleanText);
    vectorStr = `[${embedding.join(',')}]`;
  } catch (err) {
    console.log('⚠️ No OpenAI API key found, using a fallback dummy vector.');
    const dummyVector = new Array(1536).fill(0).map(() => Math.random());
    vectorStr = `[${dummyVector.join(',')}]`;
  }

  // 4. Save to Vector Database
  const metadata = {
    source: 'jira',
    ticketId: jiraTicket.key,
    targetId: jiraTicket.assigneeId,
  };

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "EvidenceChunk" (id, content, metadata, embedding)
    VALUES (gen_random_uuid(), $1, $2::jsonb, $3::vector)
    `,
    cleanText,
    JSON.stringify(metadata),
    vectorStr
  );

  console.log(`✅ Jira Ticket ${jiraTicket.key} securely embedded into pgvector database!`);
}

seedJiraTicket()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
