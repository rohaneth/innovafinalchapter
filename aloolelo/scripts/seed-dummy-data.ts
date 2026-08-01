import 'dotenv/config';
import { prisma } from '../src/lib/vector/client';
import { generateEmbedding } from '../src/lib/embeddings/generate';
import { sanitizePII } from '../src/lib/privacy/anonymize';

async function seedDummyData() {
  console.log('🌱 Seeding dummy employee data...');

  const dummyEmployeeId = 'emp_dummy_001';
  const managerId = 'mgr_001';

  // 1. Create a dummy feedback review
  const rawFeedback = "Alice is a fantastic engineer. She completed the dashboard migration 2 weeks ahead of schedule. However, her email alice@company.com sometimes takes days to reply to. Contact 555-123-4567 for emergencies.";
  const cleanFeedback = sanitizePII(rawFeedback);

  console.log('Sanitized Feedback:', cleanFeedback);

  let vectorStr = '';
  try {
    const embedding = await generateEmbedding(cleanFeedback);
    vectorStr = `[${embedding.join(',')}]`;
  } catch (err) {
    console.log('⚠️ No OpenAI API key found, using a fallback dummy vector.');
    // generate a dummy 1536 dimension vector
    const dummyVector = new Array(1536).fill(0).map(() => Math.random());
    vectorStr = `[${dummyVector.join(',')}]`;
  }

  const metadata = {
    source: 'peer_review',
    authorId: managerId,
    targetId: dummyEmployeeId,
  };

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "EvidenceChunk" (id, content, metadata, embedding)
    VALUES (gen_random_uuid(), $1, $2::jsonb, $3::vector)
    `,
    cleanFeedback,
    JSON.stringify(metadata),
    vectorStr
  );

  console.log('✅ Dummy employee feedback securely embedded into pgvector database!');
  console.log('You can now run the AI Review Engine for employee ID: emp_dummy_001');
}

seedDummyData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
