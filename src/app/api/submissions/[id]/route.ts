import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";
import { sanitizeText } from "@/lib/sanitization";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { type, content } = await req.json();

    const existing = await prisma.submission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sanitizedContent = content ? sanitizeText(content) : existing.content;

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        type: type || existing.type,
        content: sanitizedContent,
      },
    });

    await logAction("UPDATE", session.user.id, "Submission", updated.id, { type: updated.type });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error updating submission" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const existing = await prisma.submission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.submission.delete({ where: { id } });

    await logAction("DELETE", session.user.id, "Submission", id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting submission" }, { status: 500 });
  }
}
