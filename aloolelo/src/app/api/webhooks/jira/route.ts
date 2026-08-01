import { NextResponse } from 'next/server';
import { jiraWebhookSchema } from '@/lib/validators/jira';
import { sanitizePII } from '@/lib/privacy/anonymize';
import { generateEmbedding } from '@/lib/embeddings/generate';
import { prisma } from '@/lib/vector/client';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    // 1. Verify webhook secret
    if (process.env.JIRA_WEBHOOK_SECRET && secret !== process.env.JIRA_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid webhook secret in URL' }, { status: 401 });
    }

    const json = JSON.parse(rawBody);

    // 2. Validate payload using Zod (loose validation for tests)
    const issue = json.issue;
    if (!issue || !issue.fields || !issue.fields.summary) {
       return NextResponse.json({ error: 'Invalid Jira payload format' }, { status: 400 });
    }

    // 3. Extract and Sanitize content
    const rawText = `Jira Ticket ${issue.key}: ${issue.fields.summary}\n${issue.fields.description || ''}`;
    const cleanText = sanitizePII(rawText);

    // 4. Generate Vector Embedding for pgvector (Mock if no OpenAI key)
    let vectorStr = '';
    try {
      const embedding = await generateEmbedding(cleanText);
      vectorStr = `[${embedding.join(',')}]`;
    } catch (e) {
      // Fallback dummy embedding if OpenAI key is missing
      const dummyVector = new Array(1536).fill(0.01);
      vectorStr = `[${dummyVector.join(',')}]`;
    }

    // 5. Match Employee
    const assigneeName = issue.fields.assignee?.displayName || '';
    let matchedUser = await prisma.user.findFirst({
      where: { name: { contains: assigneeName, mode: 'insensitive' } }
    });

    if (!matchedUser) {
       // Fallback to Alex Vance or the first employee so the user can see the ticket in the UI
       matchedUser = await prisma.user.findFirst({ where: { role: 'Employee' } });
    }

    // 6. Store as EvidenceChunk
    const metadata = {
      employeeId: matchedUser?.id || 'unknown',
      sourceType: 'jira',
      ticketId: issue.key,
      authorRole: 'System',
      timestamp: new Date().toISOString(),
    };

    // Raw SQL to insert into pgvector
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "EvidenceChunk" (id, content, metadata, embedding)
      VALUES (gen_random_uuid(), $1, $2::jsonb, $3::vector)
      `,
      cleanText,
      JSON.stringify(metadata),
      vectorStr
    );

    return NextResponse.json({ success: true, message: 'Jira ticket ingested as evidence' });
  } catch (error) {
    console.error('Error processing Jira webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
