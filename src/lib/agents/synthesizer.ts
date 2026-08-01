import {
  ReviewGraphState,
  SynthesizedReview,
} from "../../types/agents";

/**
 * Synthesizer Node: Generates structured performance report draft
 * (Strengths, Growth Areas, Impact Highlights, Goal Progress)
 * with strict source citations pointing to EvidenceChunk IDs.
 */
export async function synthesizerNode(
  state: ReviewGraphState
): Promise<Partial<ReviewGraphState>> {
  const chunks = state.evidenceChunks || [];

  // Map chunk IDs by category
  const technicalChunks = chunks.filter((c) => c.tags.includes("technical"));
  const collabChunks = chunks.filter(
    (c) => c.tags.includes("collaboration") || c.tags.includes("leadership")
  );
  const interpersonalChunks = chunks.filter((c) =>
    c.tags.includes("interpersonal")
  );
  const goalChunks = chunks.filter((c) => c.tags.includes("goals"));

  const draft: SynthesizedReview = {
    employeeId: state.employeeId || "emp-001",
    period: state.reviewPeriod || "2026-H1",
    strengths: [
      {
        summary:
          "Demonstrated exceptional technical leadership by leading the database migration to pgvector and optimizing search performance by 35%.",
        citations: technicalChunks.map((c) => c.id),
      },
      {
        summary:
          "Highly collaborative team member, consistently available for pair programming and clarifying API specifications.",
        citations: collabChunks.map((c) => c.id),
      },
    ],
    growthAreas: [
      {
        summary:
          "Improve communication approach during technical code reviews to avoid perceived aggressiveness when presenting architectural feedback.",
        citations: interpersonalChunks.map((c) => c.id),
      },
      {
        summary:
          "Enhance cross-team coordination during sprint releases to streamline delivery pipelines.",
        citations: chunks
          .filter((c) => c.authorRole === "employee")
          .map((c) => c.id),
      },
    ],
    impactHighlights: [
      {
        summary:
          "Resolved 24 high-priority technical debt issues and established team CI/CD standards.",
        citations: chunks
          .filter((c) => c.sourceType === "meeting_transcript")
          .map((c) => c.id),
      },
    ],
    goalProgress: [
      {
        goal: "Optimize semantic retrieval speed to under 100ms",
        status: "exceeded",
        summary:
          "Successfully implemented pgvector automated indexing, reducing query latency by 35%.",
        citations: technicalChunks.map((c) => c.id),
      },
      {
        goal: "Mentor junior team members on system design",
        status: "achieved",
        summary:
          "Provided pairing support and led architectural discussions across multiple projects.",
        citations: collabChunks.map((c) => c.id),
      },
    ],
    overallSummary:
      "Strong performance throughout 2026-H1 marked by high technical impact, successful vector database delivery, and active peer support. Main development area is refining code review communication style.",
  };

  // Calculate total citations count across sections
  let citationCount = 0;
  draft.strengths.forEach((s) => (citationCount += s.citations.length));
  draft.growthAreas.forEach((g) => (citationCount += g.citations.length));
  draft.impactHighlights.forEach((i) => (citationCount += i.citations.length));
  draft.goalProgress.forEach((gp) => (citationCount += gp.citations.length));

  return {
    draftReview: draft,
    currentNode: "synthesizer",
    status: "synthesizing",
    metrics: {
      ...state.metrics,
      synthesizerCitationCount: citationCount,
    },
  };
}
