import { RawFeedbackInput, ReviewGraphState } from "../../types/agents";

export function createInitialReviewState(
  employeeId: string,
  reviewPeriod: string,
  rawInputs: RawFeedbackInput[] = []
): ReviewGraphState {
  return {
    employeeId,
    reviewPeriod,
    rawInputs,
    evidenceChunks: [],
    draftReview: null,
    auditFlags: [],
    metrics: {
      startTime: new Date().toISOString(),
      collectorItemCount: 0,
      retrieverChunkCount: 0,
      synthesizerCitationCount: 0,
      auditorFlagCount: 0,
    },
    currentNode: "initial",
    status: "idle",
    error: null,
  };
}
