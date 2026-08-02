import { RawFeedbackInput, ReviewGraphState } from "../../types/agents";
import { collectorNode } from "./collector";
import { retrieverNode } from "./retriever";
import { synthesizerNode } from "./synthesizer";
import { auditorNode } from "./auditor";
import { createInitialReviewState } from "./state";

/**
 * Multi-Agent State Graph Engine
 * Orchestrates the sequential pipeline:
 * Collector -> Retriever -> Synthesizer -> Auditor
 */
export async function runReviewGraph(
  employeeId: string = "emp-001",
  reviewPeriod: string = "2026-H1",
  rawInputs: RawFeedbackInput[] = []
): Promise<ReviewGraphState> {
  let currentState: ReviewGraphState = createInitialReviewState(
    employeeId,
    reviewPeriod,
    rawInputs
  );

  try {
    // Step 1: Collector Node
    const collectorPatch = await collectorNode(currentState);
    currentState = { ...currentState, ...collectorPatch };
    if (currentState.status === "failed") return currentState;

    // Step 2: Retriever Node
    const retrieverPatch = await retrieverNode(currentState);
    currentState = { ...currentState, ...retrieverPatch };
    if (currentState.status === "failed") return currentState;

    // Step 3: Synthesizer Node
    const synthesizerPatch = await synthesizerNode(currentState);
    currentState = { ...currentState, ...synthesizerPatch };
    if (currentState.status === "failed") return currentState;

    // Step 4: Auditor Node
    const auditorPatch = await auditorNode(currentState);
    currentState = { ...currentState, ...auditorPatch };
    if (currentState.status === "failed") return currentState;

    return currentState;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      ...currentState,
      status: "failed",
      error: errorMsg,
    };
  }
}
