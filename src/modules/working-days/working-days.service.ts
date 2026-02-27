import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateWorkingDaysDto } from './dto/update-working-days.dto.js';

// Maps day-of-week numbers (0=Sun, 1=Mon, ..., 6=Sat) to boolean fields
function workingDaysArrayToFields(workingDays?: number[]) {
  if (!workingDays) return {};
  const days = new Set(workingDays);
  return {
    sunday: days.has(0),
    monday: days.has(1),
    tuesday: days.has(2),
    wednesday: days.has(3),
    thursday: days.has(4),
    friday: days.has(5),
    saturday: days.has(6),
  };
}

function fieldsToWorkingDaysArray(record: {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}): number[] {
  const result: number[] = [];
  if (record.sunday) result.push(0);
  if (record.monday) result.push(1);
  if (record.tuesday) result.push(2);
  if (record.wednesday) result.push(3);
  if (record.thursday) result.push(4);
  if (record.friday) result.push(5);
  if (record.saturday) result.push(6);
  return result;
}

const DEFAULT_WORKING_DAYS_DATA = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
  workStartTime: '09:00',
  workEndTime: '17:00',
  holidays: null as any,
};

@Injectable()
export class WorkingDaysService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectWorkingDays(projectId: string) {
    const numProjectId = Number(projectId);

    const project = await this.prisma.project.findUnique({
      where: { id: numProjectId, deletedAt: null },
      include: { workingDays: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.workingDays) {
      return {
        workingDays: [1, 2, 3, 4, 5],
        holidays: [],
        startTime: '09:00',
        endTime: '17:00',
      };
    }

    return {
      workingDays: fieldsToWorkingDaysArray(project.workingDays),
      holidays: project.workingDays.holidays ?? [],
      startTime: project.workingDays.workStartTime,
      endTime: project.workingDays.workEndTime,
    };
  }

  async updateProjectWorkingDays(projectId: string, dto: UpdateWorkingDaysDto) {
    const numProjectId = Number(projectId);

    const project = await this.prisma.project.findUnique({
      where: { id: numProjectId, deletedAt: null },
      include: { workingDays: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updateData: Record<string, any> = {};
    if (dto.workingDays !== undefined) {
      Object.assign(updateData, workingDaysArrayToFields(dto.workingDays));
    }
    if (dto.startTime !== undefined) updateData.workStartTime = dto.startTime;
    if (dto.endTime !== undefined) updateData.workEndTime = dto.endTime;
    if (dto.holidays !== undefined) updateData.holidays = dto.holidays;
    if (dto.includeWeekends !== undefined && dto.workingDays === undefined) {
      updateData.saturday = dto.includeWeekends;
      updateData.sunday = dto.includeWeekends;
    }

    if (project.workingDays) {
      const updated = await this.prisma.projectWorkingDays.update({
        where: { projectId: numProjectId },
        data: updateData,
      });
      return {
        workingDays: fieldsToWorkingDaysArray(updated),
        holidays: updated.holidays ?? [],
        startTime: updated.workStartTime,
        endTime: updated.workEndTime,
      };
    }

    const created = await this.prisma.projectWorkingDays.create({
      data: {
        projectId: numProjectId,
        ...DEFAULT_WORKING_DAYS_DATA,
        ...updateData,
      },
    });
    return {
      workingDays: fieldsToWorkingDaysArray(created),
      holidays: created.holidays ?? [],
      startTime: created.workStartTime,
      endTime: created.workEndTime,
    };
  }

  async getSpaceWorkingDays(spaceId: string) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: { workingDays: true },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.workingDays && !space.workingDays.inheritsProject) {
      return {
        workingDays: fieldsToWorkingDaysArray(space.workingDays),
        holidays: space.workingDays.holidays ?? [],
        startTime: space.workingDays.workStartTime,
        endTime: space.workingDays.workEndTime,
      };
    }

    // Fall back to project working days
    return this.getProjectWorkingDays(String(space.projectId));
  }

  async updateSpaceWorkingDays(spaceId: string, dto: UpdateWorkingDaysDto) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: { workingDays: true },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const updateData: Record<string, any> = {
      inheritsProject: false,
    };
    if (dto.workingDays !== undefined) {
      Object.assign(updateData, workingDaysArrayToFields(dto.workingDays));
    }
    if (dto.startTime !== undefined) updateData.workStartTime = dto.startTime;
    if (dto.endTime !== undefined) updateData.workEndTime = dto.endTime;
    if (dto.holidays !== undefined) updateData.holidays = dto.holidays;
    if (dto.includeWeekends !== undefined && dto.workingDays === undefined) {
      updateData.saturday = dto.includeWeekends;
      updateData.sunday = dto.includeWeekends;
    }

    if (space.workingDays) {
      const updated = await this.prisma.spaceWorkingDays.update({
        where: { spaceId: numSpaceId },
        data: updateData,
      });
      return {
        workingDays: fieldsToWorkingDaysArray(updated),
        holidays: updated.holidays ?? [],
        startTime: updated.workStartTime,
        endTime: updated.workEndTime,
      };
    }

    const created = await this.prisma.spaceWorkingDays.create({
      data: {
        spaceId: numSpaceId,
        ...DEFAULT_WORKING_DAYS_DATA,
        ...updateData,
      },
    });
    return {
      workingDays: fieldsToWorkingDaysArray(created),
      holidays: created.holidays ?? [],
      startTime: created.workStartTime,
      endTime: created.workEndTime,
    };
  }
}
