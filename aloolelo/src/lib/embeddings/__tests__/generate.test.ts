import { generateEmbedding, generateEmbeddingsBatch, embeddings } from '../generate';

jest.mock('@langchain/openai', () => {
  return {
    OpenAIEmbeddings: jest.fn().mockImplementation(() => {
      return {
        embedQuery: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
        embedDocuments: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]),
      };
    })
  };
});

describe('Embeddings Generator', () => {
  it('should generate a single embedding', async () => {
    const result = await generateEmbedding('hello world');
    expect(result).toEqual([0.1, 0.2, 0.3]);
    expect(embeddings.embedQuery).toHaveBeenCalledWith('hello world');
  });

  it('should generate a batch of embeddings', async () => {
    const result = await generateEmbeddingsBatch(['hello', 'world']);
    expect(result).toEqual([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]);
    expect(embeddings.embedDocuments).toHaveBeenCalledWith(['hello', 'world']);
  });
});
