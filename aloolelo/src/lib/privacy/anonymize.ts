/**
 * A basic utility for sanitizing PII (Personally Identifiable Information) from text.
 * In a production environment, this should be replaced with a robust NLP solution like AWS Comprehend or Presidio.
 */
export function sanitizePII(text: string): string {
  let sanitized = text;

  // 1. Redact Email Addresses
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  sanitized = sanitized.replace(emailRegex, '[EMAIL_REDACTED]');

  // 2. Redact Phone Numbers (Basic US format matching)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  sanitized = sanitized.replace(phoneRegex, '[PHONE_REDACTED]');

  // 3. Redact Social Security Numbers
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  sanitized = sanitized.replace(ssnRegex, '[SSN_REDACTED]');

  // Note: Names are extremely difficult to redact accurately with regex.
  // We rely on downstream agents to flag bias or missing context if names slip through,
  // or a more advanced NER model to handle names.

  return sanitized;
}
