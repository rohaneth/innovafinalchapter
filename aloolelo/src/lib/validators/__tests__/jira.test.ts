import { jiraWebhookSchema } from '../jira';

describe('Jira Webhook Schema Validation', () => {
  it('should validate a correct Jira webhook payload', () => {
    const validPayload = {
      webhookEvent: 'jira:issue_updated',
      issue: {
        id: '10001',
        key: 'PROJ-123',
        fields: {
          summary: 'Fix login bug',
          description: 'The login page crashes when using Safari.',
          assignee: {
            accountId: '5d41c1234b4a1',
            displayName: 'John Doe',
          },
          status: {
            name: 'Done',
          },
        },
      },
    };

    const result = jiraWebhookSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should invalidate if issue key is missing', () => {
    const invalidPayload = {
      webhookEvent: 'jira:issue_updated',
      issue: {
        id: '10001',
        fields: {
          summary: 'Fix login bug',
          status: {
            name: 'Done',
          },
        },
      },
    };

    const result = jiraWebhookSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
