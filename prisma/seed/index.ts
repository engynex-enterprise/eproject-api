import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Status Groups
// ─────────────────────────────────────────────────────────────
const STATUS_GROUPS = [
  { name: 'TO_DO', color: '#B3BAC5' },
  { name: 'IN_PROGRESS', color: '#4BADE8' },
  { name: 'DONE', color: '#63BA3C' },
] as const;

// ─────────────────────────────────────────────────────────────
// Statuses (references status group by name)
// ─────────────────────────────────────────────────────────────
const STATUSES = [
  { name: 'Por hacer', statusGroup: 'TO_DO', color: '#B3BAC5', isSystem: true },
  { name: 'En curso', statusGroup: 'IN_PROGRESS', color: '#4BADE8', isSystem: true },
  { name: 'Pruebas internas', statusGroup: 'IN_PROGRESS', color: '#F79232', isSystem: true },
  { name: 'Pruebas de usuario', statusGroup: 'IN_PROGRESS', color: '#D04437', isSystem: true },
  { name: 'Realizado', statusGroup: 'DONE', color: '#63BA3C', isSystem: true },
  { name: 'Cancelado', statusGroup: 'DONE', color: '#999999', isSystem: true },
] as const;

// ─────────────────────────────────────────────────────────────
// Issue Types
// ─────────────────────────────────────────────────────────────
const ISSUE_TYPES = [
  { name: 'Epic', iconName: 'bolt', color: '#904EE2', isSubtask: false, hierarchyLevel: 0, isSystem: true },
  { name: 'Historia de usuario', iconName: 'bookmark', color: '#63BA3C', isSubtask: false, hierarchyLevel: 1, isSystem: true },
  { name: 'Tarea', iconName: 'check-square', color: '#4BADE8', isSubtask: false, hierarchyLevel: 2, isSystem: true },
  { name: 'Bug', iconName: 'bug', color: '#E5493A', isSubtask: false, hierarchyLevel: 2, isSystem: true },
  { name: 'Subtarea', iconName: 'subtask', color: '#4BADE8', isSubtask: true, hierarchyLevel: 3, isSystem: true },
] as const;

// ─────────────────────────────────────────────────────────────
// Priorities
// ─────────────────────────────────────────────────────────────
const PRIORITIES = [
  { name: 'Mas alta', iconName: 'arrow-double-up', color: '#CE0000', value: 1, isSystem: true },
  { name: 'Alta', iconName: 'arrow-up', color: '#E5493A', value: 2, isSystem: true },
  { name: 'Media', iconName: 'arrow-right', color: '#F79232', value: 3, isSystem: true },
  { name: 'Baja', iconName: 'arrow-down', color: '#2A8735', value: 4, isSystem: true },
  { name: 'Mas baja', iconName: 'arrow-double-down', color: '#57A55A', value: 5, isSystem: true },
] as const;

// ─────────────────────────────────────────────────────────────
// Default Roles (system roles, orgId = null)
// ─────────────────────────────────────────────────────────────
const ROLES = [
  { name: 'Admin', scope: 'organization', description: 'Acceso completo a todas las funciones de la organizacion' },
  { name: 'Miembro', scope: 'organization', description: 'Miembro estandar con acceso a proyectos' },
  { name: 'Observador', scope: 'organization', description: 'Acceso de solo lectura' },
  { name: 'Administrador de proyecto', scope: 'project', description: 'Acceso completo a configuracion y gestion del proyecto' },
  { name: 'Miembro de proyecto', scope: 'project', description: 'Puede crear y gestionar incidencias' },
  { name: 'Observador de proyecto', scope: 'project', description: 'Puede ver incidencias solamente' },
] as const;

// ─────────────────────────────────────────────────────────────
// Permissions (resource x action)
// ─────────────────────────────────────────────────────────────
const PERMISSIONS: { resource: string; actions: string[] }[] = [
  { resource: 'organization', actions: ['read', 'update', 'delete', 'manage_members', 'manage_roles', 'manage_billing', 'manage_settings'] },
  { resource: 'project', actions: ['create', 'read', 'update', 'delete', 'manage_members', 'manage_settings'] },
  { resource: 'issue', actions: ['create', 'read', 'update', 'delete', 'assign', 'transition'] },
  { resource: 'sprint', actions: ['create', 'read', 'update', 'delete', 'manage'] },
  { resource: 'comment', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'attachment', actions: ['create', 'read', 'delete'] },
  { resource: 'workflow', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'automation', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'report', actions: ['read'] },
  { resource: 'space', actions: ['create', 'read', 'update', 'delete'] },
  { resource: 'version', actions: ['create', 'read', 'update', 'delete', 'release'] },
];

// ─────────────────────────────────────────────────────────────
// Seed Functions
// ─────────────────────────────────────────────────────────────

async function seedStatusGroups() {
  console.log('Seeding status groups...');
  for (const sg of STATUS_GROUPS) {
    await prisma.statusGroup.upsert({
      where: { name: sg.name },
      update: { color: sg.color },
      create: { name: sg.name, color: sg.color },
    });
  }
}

async function seedStatuses() {
  console.log('Seeding statuses...');
  for (const s of STATUSES) {
    const statusGroup = await prisma.statusGroup.findUniqueOrThrow({
      where: { name: s.statusGroup },
    });

    // Use a combination query since Status doesn't have a unique constraint on name alone
    const existing = await prisma.status.findFirst({
      where: { name: s.name, statusGroupId: statusGroup.id },
    });

    if (existing) {
      await prisma.status.update({
        where: { id: existing.id },
        data: {
          color: s.color,
          isSystem: s.isSystem,
          statusGroupId: statusGroup.id,
        },
      });
    } else {
      await prisma.status.create({
        data: {
          name: s.name,
          statusGroupId: statusGroup.id,
          color: s.color,
          isSystem: s.isSystem,
        },
      });
    }
  }
}

async function seedIssueTypes() {
  console.log('Seeding issue types...');
  for (const it of ISSUE_TYPES) {
    // IssueType has no unique constraint on name, so find-first + upsert pattern
    const existing = await prisma.issueType.findFirst({
      where: { name: it.name, isSystem: true },
    });

    if (existing) {
      await prisma.issueType.update({
        where: { id: existing.id },
        data: {
          iconName: it.iconName,
          color: it.color,
          isSubtask: it.isSubtask,
          hierarchyLevel: it.hierarchyLevel,
          isSystem: it.isSystem,
        },
      });
    } else {
      await prisma.issueType.create({
        data: {
          name: it.name,
          iconName: it.iconName,
          color: it.color,
          isSubtask: it.isSubtask,
          hierarchyLevel: it.hierarchyLevel,
          isSystem: it.isSystem,
        },
      });
    }
  }
}

async function seedPriorities() {
  console.log('Seeding priorities...');
  for (const p of PRIORITIES) {
    // Priority has no unique constraint on name, so find-first + upsert pattern
    const existing = await prisma.priority.findFirst({
      where: { name: p.name, isSystem: true },
    });

    if (existing) {
      await prisma.priority.update({
        where: { id: existing.id },
        data: {
          iconName: p.iconName,
          color: p.color,
          value: p.value,
          isSystem: p.isSystem,
        },
      });
    } else {
      await prisma.priority.create({
        data: {
          name: p.name,
          iconName: p.iconName,
          color: p.color,
          value: p.value,
          isSystem: p.isSystem,
        },
      });
    }
  }
}

async function seedRoles() {
  console.log('Seeding default roles...');
  for (const r of ROLES) {
    // System roles have orgId=null, so we can't use the compound unique for upsert.
    // Instead, find by name+scope+isSystem and create if not found.
    const existing = await prisma.role.findFirst({
      where: {
        name: r.name,
        scope: r.scope,
        isSystem: true,
        orgId: null,
      },
    });

    if (existing) {
      await prisma.role.update({
        where: { id: existing.id },
        data: { description: r.description },
      });
    } else {
      await prisma.role.create({
        data: {
          name: r.name,
          scope: r.scope,
          description: r.description,
          isSystem: true,
        },
      });
    }
  }
}

async function seedPermissions() {
  console.log('Seeding permissions...');
  for (const group of PERMISSIONS) {
    for (const action of group.actions) {
      await prisma.permission.upsert({
        where: {
          resource_action: {
            resource: group.resource,
            action,
          },
        },
        update: {},
        create: {
          resource: group.resource,
          action,
          description: `${action} on ${group.resource}`,
        },
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting seed...\n');

  await seedStatusGroups();
  await seedStatuses();
  await seedIssueTypes();
  await seedPriorities();
  await seedRoles();
  await seedPermissions();

  console.log('\nSeed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
