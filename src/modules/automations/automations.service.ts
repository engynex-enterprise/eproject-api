import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateAutomationDto } from './dto/create-automation.dto.js';
import { UpdateAutomationDto } from './dto/update-automation.dto.js';

@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateAutomationDto) {
    const numProjectId = Number(projectId);

    return this.prisma.automation.create({
      data: {
        projectId: numProjectId,
        name: dto.name,
        description: dto.description,
        trigger: dto.trigger,
        actions: dto.actions ?? dto.action ?? {},
        isActive: dto.isActive ?? dto.isEnabled ?? true,
      },
    });
  }

  async findAllByProject(projectId: string) {
    const numProjectId = Number(projectId);

    return this.prisma.automation.findMany({
      where: { projectId: numProjectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(automationId: string) {
    const numAutomationId = Number(automationId);

    const automation = await this.prisma.automation.findUnique({
      where: { id: numAutomationId },
    });

    if (!automation) {
      throw new NotFoundException('Automation not found');
    }

    return automation;
  }

  async update(automationId: string, dto: UpdateAutomationDto) {
    const numAutomationId = Number(automationId);

    const automation = await this.prisma.automation.findUnique({
      where: { id: numAutomationId },
    });

    if (!automation) {
      throw new NotFoundException('Automation not found');
    }

    return this.prisma.automation.update({
      where: { id: numAutomationId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.trigger !== undefined && { trigger: dto.trigger }),
        ...(dto.actions !== undefined && { actions: dto.actions }),
        ...(dto.action !== undefined && { actions: dto.action }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isEnabled !== undefined && { isActive: dto.isEnabled }),
      },
    });
  }

  async delete(automationId: string) {
    const numAutomationId = Number(automationId);

    const automation = await this.prisma.automation.findUnique({
      where: { id: numAutomationId },
    });

    if (!automation) {
      throw new NotFoundException('Automation not found');
    }

    await this.prisma.automation.delete({
      where: { id: numAutomationId },
    });

    return { message: 'Automation deleted successfully' };
  }
}
