import { StatusGroup } from '../enums/status-group.enum.js';

export interface StatusGroupDefinition {
  group: StatusGroup;
  label: string;
  description: string;
  defaultStatuses: string[];
  color: string;
}

/**
 * Default status group definitions used when creating a new project.
 * These map to the three standard Kanban columns.
 */
export const DEFAULT_STATUS_GROUPS: StatusGroupDefinition[] = [
  {
    group: StatusGroup.TO_DO,
    label: 'To Do',
    description: 'Work that has not been started yet',
    defaultStatuses: ['Backlog', 'To Do', 'Open'],
    color: '#94a3b8', // slate-400
  },
  {
    group: StatusGroup.IN_PROGRESS,
    label: 'In Progress',
    description: 'Work that is actively being worked on',
    defaultStatuses: ['In Progress', 'In Review', 'In QA'],
    color: '#3b82f6', // blue-500
  },
  {
    group: StatusGroup.DONE,
    label: 'Done',
    description: 'Work that has been completed',
    defaultStatuses: ['Done', 'Closed', 'Released'],
    color: '#22c55e', // green-500
  },
];

/**
 * Maps a status group enum value to its default definition.
 */
export function getStatusGroupDefinition(
  group: StatusGroup,
): StatusGroupDefinition | undefined {
  return DEFAULT_STATUS_GROUPS.find((def) => def.group === group);
}
