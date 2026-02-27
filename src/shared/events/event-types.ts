export enum EventTypes {
  // Auth events
  USER_REGISTERED = 'user.registered',
  USER_LOGGED_IN = 'user.logged_in',
  USER_PASSWORD_RESET = 'user.password_reset',
  USER_EMAIL_VERIFIED = 'user.email_verified',

  // Organization events
  ORG_CREATED = 'org.created',
  ORG_UPDATED = 'org.updated',
  ORG_DELETED = 'org.deleted',
  ORG_MEMBER_ADDED = 'org.member_added',
  ORG_MEMBER_REMOVED = 'org.member_removed',
  ORG_INVITATION_SENT = 'org.invitation_sent',
  ORG_INVITATION_ACCEPTED = 'org.invitation_accepted',

  // Project events
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_DELETED = 'project.deleted',

  // Issue events
  ISSUE_CREATED = 'issue.created',
  ISSUE_UPDATED = 'issue.updated',
  ISSUE_DELETED = 'issue.deleted',
  ISSUE_MOVED = 'issue.moved',
  ISSUE_TRANSITIONED = 'issue.transitioned',
  ISSUE_ASSIGNED = 'issue.assigned',

  // Sprint events
  SPRINT_CREATED = 'sprint.created',
  SPRINT_STARTED = 'sprint.started',
  SPRINT_COMPLETED = 'sprint.completed',

  // Comment events
  COMMENT_CREATED = 'comment.created',
  COMMENT_UPDATED = 'comment.updated',
  COMMENT_DELETED = 'comment.deleted',

  // Attachment events
  ATTACHMENT_UPLOADED = 'attachment.uploaded',
  ATTACHMENT_DELETED = 'attachment.deleted',
}

export interface BaseEvent {
  userId: string;
  orgId?: string;
  timestamp: Date;
}

export interface IssueEvent extends BaseEvent {
  issueId: string;
  projectId: string;
}

export interface OrgEvent extends BaseEvent {
  orgId: string;
}

export interface ProjectEvent extends BaseEvent {
  projectId: string;
  orgId: string;
}
