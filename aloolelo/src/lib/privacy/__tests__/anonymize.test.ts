import { sanitizePII } from '../anonymize';

describe('sanitizePII', () => {
  it('should redact email addresses', () => {
    const input = 'Contact me at alice@example.com for more info.';
    const output = sanitizePII(input);
    expect(output).toBe('Contact me at [EMAIL_REDACTED] for more info.');
  });

  it('should redact phone numbers', () => {
    const input = 'Call 555-123-4567 tomorrow.';
    const output = sanitizePII(input);
    expect(output).toBe('Call [PHONE_REDACTED] tomorrow.');
  });

  it('should redact SSNs', () => {
    const input = 'My SSN is 123-45-6789.';
    const output = sanitizePII(input);
    expect(output).toBe('My SSN is [SSN_REDACTED].');
  });

  it('should redact multiple PII types in the same string', () => {
    const input = 'Alice (alice@test.com) can be reached at 123-456-7890. SSN: 987-65-4321.';
    const output = sanitizePII(input);
    expect(output).toBe('Alice ([EMAIL_REDACTED]) can be reached at [PHONE_REDACTED]. SSN: [SSN_REDACTED].');
  });

  it('should return original text if no PII is found', () => {
    const input = 'This is a normal sentence without any sensitive info.';
    const output = sanitizePII(input);
    expect(output).toBe(input);
  });
});
