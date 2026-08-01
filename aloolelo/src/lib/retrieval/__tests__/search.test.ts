import { retrieveEvidence } from '../search';
import { generateEmbedding } from '../../embeddings/generate';
import { prisma } from '../../vector/client';

// Mock dependencies
jest.mock('../../embeddings/generate');
jest.mock('../../vector/client', () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(),
  },
}));

describe('retrieveEvidence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve and map search results correctly', async () => {
    // Setup mocks
    const mockEmbedding = [0.1, 0.2, 0.3];
    (generateEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);
    
    const mockDbResults = [
      { id: '1', content: 'mock content 1', metadata: { source: 'jira' }, similarity: 0.95 },
      { id: '2', content: 'mock content 2', metadata: null, similarity: 0.82 },
    ];
    (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(mockDbResults);

    // Execute
    const query = 'test query';
    const limit = 2;
    const results = await retrieveEvidence(query, limit);

    // Verify
    expect(generateEmbedding).toHaveBeenCalledWith(query);
    expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, content, metadata, 1 - (embedding <=> $1::vector) as similarity'),
      '[0.1,0.2,0.3]',
      limit
    );
    expect(results).toHaveLength(2);
    expect(results[0].content).toBe('mock content 1');
    expect(results[0].similarity).toBe(0.95);
  });
});
