import { OpenAIEmbeddings } from '@langchain/openai';

// Initialize the OpenAI embedding model (defaulting to text-embedding-3-small)
export const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
  // Ensure the OPENAI_API_KEY environment variable is set
});

/**
 * Generates an embedding for a given text chunk.
 * @param text The input text to embed.
 * @returns An array of numbers representing the vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddings.embedQuery(text);
  return result;
}

/**
 * Generates embeddings for an array of text chunks (batch processing).
 * @param texts Array of text chunks to embed.
 * @returns Array of vectors.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const results = await embeddings.embedDocuments(texts);
  return results;
}
