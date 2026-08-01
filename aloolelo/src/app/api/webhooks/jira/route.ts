import { NextResponse } from 'next/server';
import { jiraWebhookSchema } from '@/lib/validators/jira';
import { sanitizePII } from '@/lib/privacy/anonymize';
import { generateEmbedding } from '@/lib/embeddings/generate';
import { prisma } from '@/lib/vector/client';
import crypto from 'crypto';

// Optional: Validate Jira webhook signature if you configure a secret in Jira
function verifyJiraWebhook(request: Request, bodyText: string): boolean {
  const secret = process.env.JIRA_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification if no secret is set

  // Jira sends the signature in a header, typically X-Hub-Signature
  // This is a simplified check. Adjust according to Atlassian webhook docs.
  const signature = request.headers.get('X-Hub-Signature');
  if (!signature) return false;

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(bodyText)
    .digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    
    // 1. Verify webhook signature (optional but recommended)
    if (!verifyJiraWebhook(request, rawBody)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const json = JSON.parse(rawBody);

    // 2. Validate payload using Zod
    const validationResult = jiraWebhookSchema.safeParse(json);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { issue } = validationResult.data;

    // Only process tickets that are considered "Done" or "Resolved"
    if (!issue.fields.status.name.match(/done|resolved|closed/i)) {
      return NextResponse.json({ success: true, message: 'Ignored non-resolved ticket' });
    }

    // 3. Extract and Sanitize content
    const rawText = `${issue.fields.summary}\n${issue.fields.description || ''}`;
    const cleanText = sanitizePII(rawText);

    // 4. Generate Vector Embedding for pgvector
    const embedding = await generateEmbedding(cleanText);
    const vectorStr = `[${embedding.join(',')}]`;

    // 5. Store as EvidenceChunk
    const metadata = {
      source: 'jira',
      ticketId: issue.key,
      assigneeId: issue.fields.assignee?.accountId || 'unassigned',
      assigneeName: issue.fields.assignee?.displayName || 'Unknown',
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
