/**
 * Basic sanitization utilities to remove PII.
 * For Phase 1, we use simple regex matching for emails, phone numbers, and SSNs.
 */

export function sanitizeText(text: string): string {
  if (!text) return text;
  
  let sanitized = text;

  // Mask Emails
  sanitized = sanitized.replace(
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
    '[EMAIL REDACTED]'
  );

  // Mask Phone Numbers (simple format)
  sanitized = sanitized.replace(
    /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?[\d]{3}[-.\s]?[\d]{4}/g,
    '[PHONE REDACTED]'
  );

  // Mask SSN (simple format)
  sanitized = sanitized.replace(
    /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
    '[SSN REDACTED]'
  );

  return sanitized;
}
