import { RawFeedbackInput, ReviewGraphState } from "../../types/agents";
import { sanitizeText } from "../sanitization";

/**
 * Sample mock feedback dataset used for standalone execution
 * when no external database input is supplied.
 */
export const MOCK_FEEDBACK_DATASET: RawFeedbackInput[] = [
  {
    id: "fb-101",
    employeeId: "emp-001",
    authorId: "emp-001",
    authorRole: "employee",
    type: "self",
    content:
      "Led the Q2 database migration to pgvector on schedule. Implemented automated indexing scripts reducing search latency by 35%. I found it challenging to coordinate across frontend teams during sprint releases.",
    timestamp: "2026-06-15T10:00:00Z",
    projectContext: "Database Migration Project",
  },
  {
    id: "fb-102",
    employeeId: "emp-001",
    authorId: "mgr-002",
    authorRole: "manager",
    type: "manager",
    content:
      "Delivered strong technical architectural leadership on vector search. Sometimes comes across as aggressive when arguing design patterns in code reviews during July.",
    timestamp: "2026-07-20T14:30:00Z",
    projectContext: "Vector Search Core",
  },
  {
    id: "fb-103",
    employeeId: "emp-001",
    authorId: "peer-003",
    authorRole: "peer",
    type: "peer",
    content:
      "Always available to pair program and clarify complex API specs. Great collaboration during the Q1 security overhaul.",
    timestamp: "2026-03-10T11:15:00Z",
    projectContext: "Security & Authentication",
  },
  {
    id: "fb-104",
    employeeId: "emp-001",
    authorId: "sys-004",
    authorRole: "system",
    type: "meeting_transcript",
    content:
      "Sprint Retro Transcript: Employee emp-001 resolved 24 high-priority technical debt issues and established team CI/CD standards.",
    timestamp: "2026-05-02T16:00:00Z",
    projectContext: "DevOps & Quality",
  },
  {
    id: "fb-105",
    employeeId: "emp-001",
    authorId: "mgr-002",
    authorRole: "manager",
    type: "project_goal",
    content:
      "Goal 1: Optimize semantic retrieval speed to under 100ms. Goal 2: Mentor junior team members on system design.",
    timestamp: "2026-01-10T09:00:00Z",
  },
];

/**
 * Collector Node: Aggregates scoped feedback inputs across all sources.
 * If raw inputs are not provided in the state, it falls back to the mock dataset
 * to ensure standalone execution for Developer 3.
 */
export async function collectorNode(
  state: ReviewGraphState
): Promise<Partial<ReviewGraphState>> {
  let inputs =
    state.rawInputs && state.rawInputs.length > 0
      ? state.rawInputs
      : MOCK_FEEDBACK_DATASET;

  // Mask PII in feedback content
  inputs = inputs.map(input => ({
    ...input,
    content: sanitizeText(input.content)
  }));

  return {
    rawInputs: inputs,
    currentNode: "collector",
    status: "collecting",
    metrics: {
      ...state.metrics,
      collectorItemCount: inputs.length,
    },
  };
}
