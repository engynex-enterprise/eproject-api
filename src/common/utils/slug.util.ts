/**
 * Generates a URL-safe slug from the given string.
 *
 * @param input - The raw string to slugify.
 * @returns A lowercase, URL-safe slug with hyphens separating words.
 *
 * @example
 * generateSlug('My Project Name') // 'my-project-name'
 * generateSlug('  Hello   World!!! ') // 'hello-world'
 * generateSlug('Café & Résumé') // 'cafe-resume'
 */
export function generateSlug(input: string): string {
  return input
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars (except spaces and hyphens)
    .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-') // Collapse consecutive hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a random suffix.
 *
 * @param input - The raw string to slugify.
 * @param suffixLength - Length of the random suffix (default: 6).
 * @returns A slug with a random alphanumeric suffix.
 *
 * @example
 * generateUniqueSlug('My Project') // 'my-project-a3b2c1'
 */
export function generateUniqueSlug(
  input: string,
  suffixLength: number = 6,
): string {
  const base = generateSlug(input);
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < suffixLength; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${base}-${suffix}`;
}
