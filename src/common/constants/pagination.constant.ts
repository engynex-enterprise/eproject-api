/**
 * Default number of items per page when no limit is specified.
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum number of items per page to prevent excessive queries.
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Default page number.
 */
export const DEFAULT_PAGE = 1;

/**
 * Default sort field.
 */
export const DEFAULT_SORT_FIELD = 'createdAt';

/**
 * Default sort order.
 */
export const DEFAULT_SORT_ORDER = 'desc' as const;
