import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { logAction } from "@/lib/audit";
import { sanitizeText } from "@/lib/sanitization";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { type, content } = await req.json();

    // Sanitize content
    const sanitizedContent = sanitizeText(content);

    const submission = await prisma.submission.create({
      data: {
        type,
        content: sanitizedContent,
        userId: session.user.id
      }
    });

    await logAction("CREATE", session.user.id, "Submission", submission.id, { type });

    return new Response(JSON.stringify(submission), { status: 201 });
  } catch (error) {
    return new Response("Error creating submission", { status: 500 });
  }
}
