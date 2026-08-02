import {
  ReviewGraphState,
  SynthesizedReview,
} from "../../types/agents";
import { invokeGroq } from "../llm/groq";

/**
 * Synthesizer Node: Generates structured performance report draft
 * Using Grok LLM for generation.
 * (Strengths, Growth Areas, Impact Highlights, Goal Progress)
 * with strict source citations pointing to EvidenceChunk IDs.
 */
export async function synthesizerNode(
  state: ReviewGraphState
): Promise<Partial<ReviewGraphState>> {
  const chunks = state.evidenceChunks || [];

  // If no chunks are available
  if (chunks.length === 0) {
    return {
      currentNode: "synthesizer",
      status: "failed",
      error: "Insufficient evidence to generate a review."
    };
  }

  // Prepare prompt payload mapping chunks
  const evidencePayload = chunks.map(c => ({
    id: c.id,
    type: c.sourceType,
    role: c.authorRole,
    content: c.content,
    tags: c.tags
  }));

  const systemPrompt = `You are an expert HR Manager AI.
Your task is to synthesize performance review evidence into a structured JSON report.
Rules:
1. ONLY use the supplied evidence. Do NOT invent or hallucinate any information.
2. If evidence is missing for a section, state that there is insufficient evidence.
3. You must provide clear explainability by including a 'reason' and 'citations' for each item. 'citations' must ONLY contain IDs of the provided evidence.
4. Output must match the JSON schema strictly.
5. If a generated claim or statement is unsupported by the provided evidence, you must mark it with low confidence in your summary text and ensure the overall confidence score is adjusted downwards. NEVER generate completely unsupported claims as facts.`;

  const userPrompt = `
Generate a performance review for Employee ID: ${state.employeeId || "unknown"} 
Review Period: ${state.reviewPeriod || "unknown"}

Provided Evidence (JSON):
${JSON.stringify(evidencePayload, null, 2)}

Required JSON Structure:
{
  "employeeId": "string",
  "period": "string",
  "strengths": [{ "summary": "...", "reason": "...", "citations": ["chunk_id1"] }],
  "growthAreas": [{ "summary": "...", "reason": "...", "citations": ["chunk_id2"] }],
  "impactHighlights": [{ "summary": "...", "reason": "...", "citations": ["chunk_id1"] }],
  "goalProgress": [{ "goal": "...", "status": "exceeded|achieved|in_progress|needs_attention", "summary": "...", "reason": "...", "citations": ["chunk_id3"] }],
  "overallSummary": "...",
  "confidence": {
    "overallConfidence": 80,
    "evidenceStrength": "Weak" | "Moderate" | "Strong",
    "evidenceCount": 5,
    "missingEvidenceCount": 1
  }
}
`;

  let draft: SynthesizedReview;
  try {
    const rawResponse = await invokeGroq(systemPrompt, userPrompt, true);
    draft = rawResponse as SynthesizedReview;
    } catch (err: any) {
    return {
      currentNode: "synthesizer",
      status: "failed",
      error: `Groq Synthesis failed: ${err.message}`
    };
  }

  // Calculate total citations count across sections
  let citationCount = 0;
  draft.strengths?.forEach((s) => (citationCount += s.citations?.length || 0));
  draft.growthAreas?.forEach((g) => (citationCount += g.citations?.length || 0));
  draft.impactHighlights?.forEach((i) => (citationCount += i.citations?.length || 0));
  draft.goalProgress?.forEach((gp) => (citationCount += gp.citations?.length || 0));

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
