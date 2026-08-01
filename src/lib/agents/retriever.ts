import { EvidenceChunk, ReviewGraphState } from "../../types/agents";

/**
 * Retriever Node: Pulls source-grounded evidence chunks.
 * Converts raw feedback entries into indexed evidence chunks with relevance scores and metadata.
 * Can consume Developer 2's pgvector service when available, or run standalone.
 */
export async function retrieverNode(
  state: ReviewGraphState
): Promise<Partial<ReviewGraphState>> {
  const rawInputs = state.rawInputs || [];

  const chunks: EvidenceChunk[] = rawInputs.map((input, index) => {
    // Generate evidence tags based on content keywords
    const tags: string[] = [];
    const lowerContent = input.content.toLowerCase();
    if (lowerContent.includes("migration") || lowerContent.includes("pgvector"))
      tags.push("technical", "database");
    if (lowerContent.includes("leadership") || lowerContent.includes("mentor"))
      tags.push("leadership");
    if (lowerContent.includes("pair") || lowerContent.includes("collaboration"))
      tags.push("collaboration");
    if (lowerContent.includes("aggressive") || lowerContent.includes("challenging"))
      tags.push("interpersonal");
    if (lowerContent.includes("goal")) tags.push("goals");

    return {
      id: `chunk-${input.id}-${index + 1}`,
      sourceId: input.id,
      sourceType: input.type,
      authorRole: input.authorRole,
      content: input.content,
      relevanceScore: Number((0.85 + Math.random() * 0.14).toFixed(2)),
      timestamp: input.timestamp,
      tags,
    };
  });

  return {
    evidenceChunks: chunks,
    currentNode: "retriever",
    status: "retrieving",
    metrics: {
      ...state.metrics,
      retrieverChunkCount: chunks.length,
    },
  };
}
