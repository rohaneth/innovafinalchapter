import { anonymizePII } from '../anonymize';

describe('anonymizePII', () => {
  it('should redact email addresses', () => {
    const input = 'Contact me at alice@example.com for more info.';
    const output = anonymizePII(input);
    expect(output).toBe('Contact me at [EMAIL] for more info.');
  });

  it('should redact phone numbers', () => {
    const input = 'Call 555-123-4567 tomorrow.';
    const output = anonymizePII(input);
    expect(output).toBe('Call [PHONE] tomorrow.');
  });

  it('should redact SSNs', () => {
    const input = 'My SSN is 123-45-6789.';
    const output = anonymizePII(input);
    expect(output).toBe('My SSN is [SSN].');
  });

  it('should redact multiple PII types in the same string', () => {
    const input = 'Alice (alice@test.com) can be reached at 123-456-7890. SSN: 987-65-4321.';
    const output = anonymizePII(input);
    expect(output).toBe('Alice ([EMAIL]) can be reached at [PHONE]. SSN: [SSN].');
  });

  it('should return original text if no PII is found', () => {
    const input = 'This is a normal sentence without any sensitive info.';
    const output = anonymizePII(input);
    expect(output).toBe(input);
  });
});
