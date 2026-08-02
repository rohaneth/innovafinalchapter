import { runReviewGraph } from "../../../lib/agents/graph";
import { RawFeedbackInputSchema } from "../../../types/agents";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/db";
import { logAction } from "../../../lib/audit";

const ReviewRequestSchema = z.object({
  employeeId: z.string().default("emp-001"),
  reviewPeriod: z.string().default("2026-H1"),
  rawInputs: z.array(RawFeedbackInputSchema).optional(),
});

/**
 * POST /api/review
 * Unified endpoint for triggering the multi-agent AI review generation graph.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "Manager") {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
    }
    const managerId = session.user.id;

    const body = await request.json().catch(() => ({}));
    const parseResult = ReviewRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: parseResult.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { employeeId, reviewPeriod, rawInputs } = parseResult.data;

    // Run the multi-agent graph
    const finalState = await runReviewGraph(
      employeeId,
      reviewPeriod,
      rawInputs || []
    );

    if (finalState.status === "failed" || !finalState.draftReview) {
      return new Response(
        JSON.stringify({
          success: false,
          data: finalState,
          error: finalState.error || "Multi-agent graph execution failed or draft review is null",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save to Database
    const savedReview = await prisma.performanceReview.create({
      data: {
        employeeId: finalState.employeeId,
        managerId: managerId,
        status: "DRAFT",
        rating: "Satisfactory", // Default rating for a draft
        performanceSummary: finalState.draftReview.overallSummary || "",
        keyStrengths: JSON.stringify(finalState.draftReview.strengths || []),
        areasForImprovement: JSON.stringify(finalState.draftReview.growthAreas || []),
        goalAchievement: JSON.stringify(finalState.draftReview.goalProgress || []),
        collaborationComm: JSON.stringify(finalState.draftReview.impactHighlights || []),
        aiRecommendations: JSON.stringify(finalState.auditFlags || []),
        evidenceUsed: JSON.stringify(finalState.evidenceChunks.map(c => c.id) || []),
      }
    });

    await logAction("CREATE", managerId, "PerformanceReview", savedReview.id, {
      metrics: finalState.metrics,
      confidence: finalState.draftReview.confidence
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reviewId: savedReview.id,
          employeeId: finalState.employeeId,
          reviewPeriod: finalState.reviewPeriod,
          draftReview: finalState.draftReview,
          auditFlags: finalState.auditFlags,
          evidenceChunks: finalState.evidenceChunks,
          metrics: finalState.metrics,
          status: finalState.status,
        },
        error: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: errorMessage,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
