import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../lib/db";
import { logAction } from "../../../../../lib/audit";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "Manager") {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
    }
    const managerId = session.user.id;
    
    // In Next.js 15, route segment params are promises.
    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    if (!id) {
       return new Response(JSON.stringify({ success: false, error: "Missing review ID" }), { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!status || !["DRAFT", "APPROVED", "CHANGES_REQUESTED"].includes(status)) {
       return new Response(JSON.stringify({ success: false, error: "Invalid status" }), { status: 400 });
    }

    const review = await prisma.performanceReview.findUnique({
      where: { id }
    });

    if (!review) {
       return new Response(JSON.stringify({ success: false, error: "Review not found" }), { status: 404 });
    }

    if (review.managerId !== managerId) {
       return new Response(JSON.stringify({ success: false, error: "Forbidden: Not the assigned manager" }), { status: 403 });
    }

    const updatedReview = await prisma.performanceReview.update({
      where: { id },
      data: { status }
    });

    await logAction("UPDATE_STATUS", managerId, "PerformanceReview", id, { previousStatus: review.status, newStatus: status });

    return new Response(JSON.stringify({ success: true, data: updatedReview }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
