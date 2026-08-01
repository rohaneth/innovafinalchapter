import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";
import { sanitizeText } from "@/lib/sanitization";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "Manager") {
    // For MVP Phase 1, mostly Managers give feedback.
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { targetUserId, type, content } = await req.json();

    // Sanitize content
    const sanitizedContent = sanitizeText(content);

    const feedback = await prisma.feedback.create({
      data: {
        type,
        content: sanitizedContent,
        targetUserId,
        authorId: session.user.id
      }
    });

    await logAction("CREATE", session.user.id, "Feedback", feedback.id, { type, targetUserId });

    return new Response(JSON.stringify(feedback), { status: 201 });
  } catch (error) {
    return new Response("Error creating feedback", { status: 500 });
  }
}
