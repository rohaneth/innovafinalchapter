import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { feedbackSchema } from '@/lib/validators/ingest';
import { sanitizePII } from '@/lib/privacy/anonymize';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate incoming payload against Zod schema
    const validationResult = feedbackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { sourceUserId, targetUserId, content } = validationResult.data;

    // 2. Sanitize PII from the feedback content
    const sanitizedContent = sanitizePII(content);

    // 3. Store the clean, validated feedback in PostgreSQL via Prisma
    const feedback = await prisma.feedback.create({
      data: {
        sourceUserId,
        targetUserId,
        content: sanitizedContent,
      },
    });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error('Error during data ingestion:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
