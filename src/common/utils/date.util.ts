/**
 * Formats a Date object to ISO 8601 string.
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Formats a Date object to a human-readable date string (YYYY-MM-DD).
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object to a human-readable datetime string (YYYY-MM-DD HH:mm:ss).
 */
export function formatDateTime(date: Date): string {
  const datePart = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${datePart} ${hours}:${minutes}:${seconds}`;
}

/**
 * Returns the start of the day (00:00:00.000) for the given date.
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Returns the end of the day (23:59:59.999) for the given date.
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Adds a specified number of days to a date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculates the number of business days (Mon-Fri) between two dates.
 * Start date inclusive, end date exclusive.
 */
export function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current < endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Returns a relative time string (e.g., "2 hours ago", "in 3 days").
 */
export function timeAgo(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const absDiff = Math.abs(diffMs);
  const isFuture = diffMs < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let relative: string;

  if (seconds < 60) {
    relative = 'just now';
    return relative;
  } else if (minutes < 60) {
    relative = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    relative = `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (days < 7) {
    relative = `${days} day${days !== 1 ? 's' : ''}`;
  } else if (weeks < 5) {
    relative = `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else if (months < 12) {
    relative = `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    relative = `${years} year${years !== 1 ? 's' : ''}`;
  }

  return isFuture ? `in ${relative}` : `${relative} ago`;
}
