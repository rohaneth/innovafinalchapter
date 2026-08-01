import { z } from "zod";

// ==========================================
// Feedback Input Types & Schemas
// ==========================================

export const FeedbackTypeSchema = z.enum([
  "self",
  "peer",
  "manager",
  "meeting_transcript",
  "project_goal",
]);
export type FeedbackType = z.infer<typeof FeedbackTypeSchema>;

export const AuthorRoleSchema = z.enum(["employee", "peer", "manager", "system"]);
export type AuthorRole = z.infer<typeof AuthorRoleSchema>;

export const RawFeedbackInputSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  authorId: z.string(),
  authorRole: AuthorRoleSchema,
  type: FeedbackTypeSchema,
  content: z.string(),
  timestamp: z.string(),
  projectContext: z.string().optional(),
});
export type RawFeedbackInput = z.infer<typeof RawFeedbackInputSchema>;

// ==========================================
// Vector Retrieval Evidence Types & Schemas
// ==========================================

export const EvidenceChunkSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  sourceType: FeedbackTypeSchema,
  authorRole: AuthorRoleSchema,
  content: z.string(),
  relevanceScore: z.number().min(0).max(1),
  timestamp: z.string(),
  tags: z.array(z.string()).default([]),
});
export type EvidenceChunk = z.infer<typeof EvidenceChunkSchema>;

// ==========================================
// Synthesized Performance Review Types
// ==========================================

export const ReviewSectionItemSchema = z.object({
  summary: z.string(),
  citations: z.array(z.string()).describe("IDs of EvidenceChunk sources backing this statement"),
});
export type ReviewSectionItem = z.infer<typeof ReviewSectionItemSchema>;

export const GoalProgressItemSchema = z.object({
  goal: z.string(),
  status: z.enum(["exceeded", "achieved", "in_progress", "needs_attention"]),
  summary: z.string(),
  citations: z.array(z.string()),
});
export type GoalProgressItem = z.infer<typeof GoalProgressItemSchema>;

export const SynthesizedReviewSchema = z.object({
  employeeId: z.string(),
  period: z.string(),
  strengths: z.array(ReviewSectionItemSchema),
  growthAreas: z.array(ReviewSectionItemSchema),
  impactHighlights: z.array(ReviewSectionItemSchema),
  goalProgress: z.array(GoalProgressItemSchema),
  overallSummary: z.string(),
});
export type SynthesizedReview = z.infer<typeof SynthesizedReviewSchema>;

// ==========================================
// Bias & Audit Flag Types & Schemas
// ==========================================

export const BiasTypeSchema = z.enum([
  "recency_bias",
  "gender_personality_bias",
  "ungrounded_claim",
  "missing_voice_gap",
]);
export type BiasType = z.infer<typeof BiasTypeSchema>;

export const SeveritySchema = z.enum(["low", "medium", "high", "critical"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const AuditFlagSchema = z.object({
  id: z.string(),
  biasType: BiasTypeSchema,
  severity: SeveritySchema,
  targetSection: z.string(),
  description: z.string(),
  evidenceIds: z.array(z.string()),
  suggestedRevision: z.string(),
});
export type AuditFlag = z.infer<typeof AuditFlagSchema>;

// ==========================================
// Agent Metrics & State
// ==========================================

export const AgentExecutionMetricsSchema = z.object({
  startTime: z.string(),
  endTime: z.string().optional(),
  durationMs: z.number().optional(),
  collectorItemCount: z.number().default(0),
  retrieverChunkCount: z.number().default(0),
  synthesizerCitationCount: z.number().default(0),
  auditorFlagCount: z.number().default(0),
  tokensUsed: z.number().optional(),
});
export type AgentExecutionMetrics = z.infer<typeof AgentExecutionMetricsSchema>;

export interface ReviewGraphState {
  employeeId: string;
  reviewPeriod: string;
  rawInputs: RawFeedbackInput[];
  evidenceChunks: EvidenceChunk[];
  draftReview: SynthesizedReview | null;
  auditFlags: AuditFlag[];
  metrics: AgentExecutionMetrics;
  currentNode: string;
  status: "idle" | "collecting" | "retrieving" | "synthesizing" | "auditing" | "completed" | "failed";
  error: string | null;
}
