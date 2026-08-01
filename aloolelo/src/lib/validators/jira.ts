import { z } from 'zod';

export const jiraWebhookSchema = z.object({
  webhookEvent: z.string(),
  issue: z.object({
    id: z.string(),
    key: z.string(),
    fields: z.object({
      summary: z.string(),
      description: z.string().nullable().optional(),
      assignee: z
        .object({
          accountId: z.string(),
          displayName: z.string(),
        })
        .nullable()
        .optional(),
      status: z.object({
        name: z.string(),
      }),
    }),
  }),
});

export type JiraWebhookPayload = z.infer<typeof jiraWebhookSchema>;
