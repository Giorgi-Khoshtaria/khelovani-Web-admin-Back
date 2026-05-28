/**
 * Helper to detect potentially malicious content (XSS/SQL injection)
 * @param text The string to check
 * @returns true if any malicious patterns are found
 */
export const isMalicious = (text: string): boolean => {
  if (!text || typeof text !== "string") return false;

  // XSS patterns only — SQL patterns removed (project uses MongoDB, not SQL)
  const patterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript\s*:/gi,
    /on(?:error|load|click|mouse\w+)\s*=/gi,
    /document\.cookie/gi,
    /eval\s*\(/gi,
  ];

  return patterns.some((pattern) => pattern.test(text));
};
