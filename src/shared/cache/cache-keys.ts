export const CacheKeys = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_ORGS: (userId: string) => `user:orgs:${userId}`,
  ORG_DETAILS: (orgId: string) => `org:details:${orgId}`,
  ORG_MEMBERS: (orgId: string) => `org:members:${orgId}`,
  PROJECT_DETAILS: (projectId: string) => `project:details:${projectId}`,
  PROJECT_STATUSES: (projectId: string) => `project:statuses:${projectId}`,
  PROJECT_ISSUE_TYPES: (projectId: string) => `project:issue-types:${projectId}`,
  PROJECT_PRIORITIES: (projectId: string) => `project:priorities:${projectId}`,
  SYSTEM_STATUSES: 'system:statuses',
  SYSTEM_ISSUE_TYPES: 'system:issue-types',
  SYSTEM_PRIORITIES: 'system:priorities',
  PERMISSIONS_ALL: 'permissions:all',
  NOTIFICATIONS_UNREAD: (userId: string) => `notifications:unread:${userId}`,
} as const;

export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
