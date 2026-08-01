import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";
import { sanitizeText } from "@/lib/sanitization";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching submissions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const sanitizedContent = sanitizeText(content);

    const submission = await prisma.submission.create({
      data: {
        type: type || "SelfAssessment",
        content: sanitizedContent,
        userId: session.user.id,
      },
    });

    await logAction("CREATE", session.user.id, "Submission", submission.id, { type: submission.type });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating submission" }, { status: 500 });
  }
}
