import { z } from 'zod';

export const feedbackSchema = z.object({
  sourceUserId: z.string().min(1, 'Source user ID is required'),
  targetUserId: z.string().min(1, 'Target user ID is required'),
  content: z.string().min(10, 'Feedback content must be at least 10 characters long'),
});

export type FeedbackPayload = z.infer<typeof feedbackSchema>;
