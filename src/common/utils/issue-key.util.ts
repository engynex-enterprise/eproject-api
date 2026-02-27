/**
 * Generates an issue key from a project key and a sequence number.
 *
 * @param projectKey - The project key prefix (e.g., "TSD", "PROJ").
 * @param sequenceNumber - The monotonically increasing issue number.
 * @returns The formatted issue key (e.g., "TSD-2396").
 *
 * @example
 * generateIssueKey('TSD', 2396) // 'TSD-2396'
 * generateIssueKey('PROJ', 1)   // 'PROJ-1'
 */
export function generateIssueKey(
  projectKey: string,
  sequenceNumber: number,
): string {
  return `${projectKey.toUpperCase()}-${sequenceNumber}`;
}

/**
 * Parses an issue key into its project key and sequence number.
 *
 * @param issueKey - The issue key to parse (e.g., "TSD-2396").
 * @returns An object with projectKey and sequenceNumber, or null if invalid.
 *
 * @example
 * parseIssueKey('TSD-2396') // { projectKey: 'TSD', sequenceNumber: 2396 }
 * parseIssueKey('invalid')  // null
 */
export function parseIssueKey(
  issueKey: string,
): { projectKey: string; sequenceNumber: number } | null {
  const match = issueKey.match(/^([A-Z][A-Z0-9]{1,9})-(\d+)$/);
  if (!match) {
    return null;
  }
  return {
    projectKey: match[1],
    sequenceNumber: parseInt(match[2], 10),
  };
}

/**
 * Validates whether a string is a valid issue key format.
 *
 * @param value - The string to validate.
 * @returns True if the value matches the issue key pattern.
 */
export function isValidIssueKey(value: string): boolean {
  return /^[A-Z][A-Z0-9]{1,9}-\d+$/.test(value);
}
