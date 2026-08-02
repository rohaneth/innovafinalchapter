import { AuditFlag, ReviewGraphState } from "../../types/agents";
import { invokeGroq } from "../llm/groq";

/**
 * Auditor Node: Scans the draft review and evidence pool for bias, gaps, and ungrounded claims.
 * Checks for:
 * 1. Recency Bias
 * 2. Gender / Personality Bias
 * 3. Ungrounded Claims
 * 4. Missing Voice Gaps
 * 5. LLM Validation (Groq) for Unsupported Claims, Contradictory Feedback, Stakeholder Imbalance, etc.
 */
export async function auditorNode(
  state: ReviewGraphState
): Promise<Partial<ReviewGraphState>> {
  const flags: AuditFlag[] = [];
  const draft = state.draftReview;
  const chunks = state.evidenceChunks || [];

  if (!draft) {
    return {
      auditFlags: [
        {
          id: "flag-err-01",
          biasType: "ungrounded_claim",
          severity: "critical",
          targetSection: "overall",
          description: "No draft review was produced by the Synthesizer.",
          evidenceIds: [],
          suggestedRevision: "Re-run Synthesizer node with valid evidence.",
        },
      ],
      currentNode: "auditor",
      status: "auditing",
    };
  }

  // 1. Check for Gender / Personality Bias
  const growthText = draft.growthAreas?.map((g) => g.summary).join(" ") || "";
  if (
    growthText.toLowerCase().includes("aggressive") ||
    growthText.toLowerCase().includes("bossy") ||
    growthText.toLowerCase().includes("abrasive")
  ) {
    flags.push({
      id: "flag-bias-01",
      biasType: "gender_personality_bias",
      severity: "high",
      targetSection: "growthAreas",
      description:
        "Personality attribute critique detected ('aggressive'). Focus feedback on objective code review standards and concrete behaviors rather than tone traits.",
      evidenceIds: chunks
        .filter((c) => c.content.toLowerCase().includes("aggressive"))
        .map((c) => c.id),
      suggestedRevision:
        "Frame as constructive technical communication: 'Focus on providing structured code review comments focusing on architectural trade-offs.'",
    });
  }

  // 2. Check for Recency Bias
  const timestamps = chunks.map((c) => new Date(c.timestamp).getTime());
  if (timestamps.length > 0) {
    const newest = Math.max(...timestamps);
    const oldest = Math.min(...timestamps);
    const totalSpanDays = (newest - oldest) / (1000 * 60 * 60 * 24);

    if (totalSpanDays > 90) {
      const citedIds = new Set<string>();
      draft.strengths?.forEach((s) => s.citations?.forEach((c) => citedIds.add(c)));
      draft.growthAreas?.forEach((g) => g.citations?.forEach((c) => citedIds.add(c)));

      const citedChunks = chunks.filter((c) => citedIds.has(c.id));
      const citedTimestamps = citedChunks.map((c) =>
        new Date(c.timestamp).getTime()
      );
      if (citedTimestamps.length > 0) {
        const avgCitedTime =
          citedTimestamps.reduce((a, b) => a + b, 0) / citedTimestamps.length;
        const skewRatio = (avgCitedTime - oldest) / (newest - oldest);
        if (skewRatio > 0.75) {
          flags.push({
            id: "flag-recency-02",
            biasType: "recency_bias",
            severity: "medium",
            targetSection: "strengths_growthAreas",
            description:
              "Synthesized review heavily emphasizes feedback from recent months while under-representing contributions from earlier in the review period.",
            evidenceIds: chunks
              .filter((c) => new Date(c.timestamp).getTime() < avgCitedTime)
              .map((c) => c.id),
            suggestedRevision:
              "Incorporate earlier accomplishments into strengths.",
          });
        }
      }
    }
  }

  // 3. Check for Ungrounded Claims (sections missing citations)
  const allSections = [
    ...(draft.strengths || []),
    ...(draft.growthAreas || []),
    ...(draft.impactHighlights || []),
  ];
  allSections.forEach((section, idx) => {
    if (!section.citations || section.citations.length === 0) {
      flags.push({
        id: `flag-ungrounded-${idx}`,
        biasType: "ungrounded_claim",
        severity: "critical",
        targetSection: section.summary.slice(0, 20),
        description: `Statement '${section.summary}' lacks backing source citations.`,
        evidenceIds: [],
        suggestedRevision: "Attach explicit EvidenceChunk IDs or remove statement.",
      });
    }
  });

  // 4. Check for Missing Voice Gap
  const authorRoles = new Set(chunks.map((c) => c.authorRole));
  if (!authorRoles.has("peer")) {
    flags.push({
      id: "flag-gap-03",
      biasType: "missing_voice_gap",
      severity: "medium",
      targetSection: "perspective_balance",
      description: "No peer feedback sources were included in this evaluation period.",
      evidenceIds: [],
      suggestedRevision: "Request peer feedback input before finalizing report release.",
    });
  }

  // 5. LLM Validation (Groq)
  try {
    const evidencePayload = chunks.map(c => ({ id: c.id, content: c.content }));
    const systemPrompt = `You are an expert HR Auditor AI. 
Analyze the generated review against the provided evidence to detect advanced biases and unsupported claims.
Only return an array of AuditFlag objects matching the JSON schema.
Bias types allowed: unsupported_claim, halo_effect, horn_effect, leniency_bias, severity_bias, central_tendency_bias, manager_dominance, missing_peer_feedback, missing_self_assessment, contradictory_feedback, subjective_language, stakeholder_imbalance, weak_evidence, evidence_scarcity.`;

    const userPrompt = `
Generated Review:
${JSON.stringify(draft, null, 2)}

Provided Evidence:
${JSON.stringify(evidencePayload, null, 2)}

Return JSON array under key "flags":
{
  "flags": [
    {
      "id": "unique-id",
      "biasType": "unsupported_claim",
      "severity": "low|medium|high|critical",
      "targetSection": "summary text",
      "description": "reason for flag",
      "evidenceIds": ["matched evidence ids"],
      "missingEvidence": "description of what is missing",
      "suggestedRevision": "revision text"
    }
  ]
}
`;
    const groqResponse = await invokeGroq(systemPrompt, userPrompt, true);
    if (groqResponse && Array.isArray(groqResponse.flags)) {
      groqResponse.flags.forEach((f: any) => {
        flags.push({
          id: f.id || `flag-llm-${Math.random().toString(36).substring(7)}`,
          biasType: f.biasType || "unsupported_claim",
          severity: f.severity || "medium",
          targetSection: f.targetSection || "unknown",
          description: f.description || "LLM flagged an issue.",
          evidenceIds: f.evidenceIds || [],
          missingEvidence: f.missingEvidence,
          suggestedRevision: f.suggestedRevision || "Review manually.",
        });
      });
    }
  } catch (err: any) {
    console.error("Groq Auditor Failed:", err.message);
  }

  return {
    auditFlags: flags,
    currentNode: "auditor",
    status: "completed",
    metrics: {
      ...state.metrics,
      auditorFlagCount: flags.length,
      endTime: new Date().toISOString(),
    },
  };
}
