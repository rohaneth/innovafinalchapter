import { generateEmbedding } from '../embeddings/generate';
import { prisma } from '../vector/client';

export interface SearchResult {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
}

/**
 * Searches the vector database for the most relevant evidence chunks based on semantic similarity.
 * @param query The search query string.
 * @param limit The maximum number of results to return.
 * @returns An array of relevant evidence chunks with their similarity scores.
 */
export async function retrieveEvidence(query: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    // 1. Generate an embedding for the user's query
    const queryEmbedding = await generateEmbedding(query);
    const queryVectorStr = `[${queryEmbedding.join(',')}]`;

    // 2. Perform a vector similarity search using pgvector
    // Adjust the table name and column names as per your Prisma schema
    const results = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT id, content, metadata, 1 - (embedding <=> $1::vector) as similarity
      FROM "EvidenceChunk"
      ORDER BY embedding <=> $1::vector
      LIMIT $2
      `,
      queryVectorStr,
      limit
    );

    return results.map((row: any) => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      similarity: row.similarity,
    }));
  } catch (error) {
    console.error('Error retrieving evidence:', error);
    throw error;
  }
}
