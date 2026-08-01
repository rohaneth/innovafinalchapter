import { ingestSchema } from '../ingest';

describe('ingestSchema validation', () => {
  it('should validate a valid payload', () => {
    const validPayload = {
      sourceUserId: 'user_123',
      targetUserId: 'user_456',
      content: 'Great work on the dashboard.',
    };

    const result = ingestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should invalidate if sourceUserId is missing', () => {
    const invalidPayload = {
      targetUserId: 'user_456',
      content: 'Great work on the dashboard.',
    };

    const result = ingestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('should invalidate if content is missing', () => {
    const invalidPayload = {
      sourceUserId: 'user_123',
      targetUserId: 'user_456',
    };

    const result = ingestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
