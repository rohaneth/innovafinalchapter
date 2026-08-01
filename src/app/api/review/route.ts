import { runReviewGraph } from "../../../lib/agents/graph";
import { RawFeedbackInputSchema } from "../../../types/agents";
import { z } from "zod";

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

    if (finalState.status === "failed") {
      return new Response(
        JSON.stringify({
          success: false,
          data: finalState,
          error: finalState.error || "Multi-agent graph execution failed",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
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
