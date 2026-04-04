/**
 * Helper to detect potentially malicious content (XSS/SQL injection)
 * @param text The string to check
 * @returns true if any malicious patterns are found
 */
export const isMalicious = (text: string): boolean => {
  if (!text || typeof text !== "string") return false;
  
  const patterns = [
    /<script.*?>.*?<\/script>/gi,
    /javascript:/gi,
    /onerror=/gi,
    /onload=/gi,
    /alert\(/gi,
    /document\.cookie/gi,
    /SELECT\s+\*\s+FROM/gi,
    /INSERT\s+INTO/gi,
    /DROP\s+TABLE/gi,
    /UNION\s+SELECT/gi,
    /--/gi,
    /OR\s+1=1/gi,
  ];

  return patterns.some((pattern) => pattern.test(text));
};
