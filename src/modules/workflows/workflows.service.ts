import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateWorkflowDto } from './dto/create-workflow.dto.js';
import { UpdateWorkflowDto } from './dto/update-workflow.dto.js';
import { CreateTransitionDto } from './dto/create-transition.dto.js';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateWorkflowDto) {
    const numProjectId = Number(projectId);

    return this.prisma.workflow.create({
      data: {
        projectId: numProjectId,
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault || false,
      },
    });
  }

  async findAllByProject(projectId: string) {
    const numProjectId = Number(projectId);

    return this.prisma.workflow.findMany({
      where: { projectId: numProjectId },
      include: {
        transitions: true,
        _count: {
          select: { transitions: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(workflowId: string) {
    const numWorkflowId = Number(workflowId);

    const workflow = await this.prisma.workflow.findUnique({
      where: { id: numWorkflowId },
      include: {
        transitions: {
          include: {
            fromStatus: true,
            toStatus: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async update(workflowId: string, dto: UpdateWorkflowDto) {
    const numWorkflowId = Number(workflowId);

    const workflow = await this.prisma.workflow.findUnique({
      where: { id: numWorkflowId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.prisma.workflow.update({
      where: { id: numWorkflowId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
  }

  async delete(workflowId: string) {
    const numWorkflowId = Number(workflowId);

    const workflow = await this.prisma.workflow.findUnique({
      where: { id: numWorkflowId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    await this.prisma.workflow.delete({
      where: { id: numWorkflowId },
    });

    return { message: 'Workflow deleted successfully' };
  }

  async addTransition(workflowId: string, dto: CreateTransitionDto) {
    const numWorkflowId = Number(workflowId);

    const workflow = await this.prisma.workflow.findUnique({
      where: { id: numWorkflowId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return this.prisma.workflowTransition.create({
      data: {
        workflowId: numWorkflowId,
        fromStatusId: Number(dto.fromStatusId),
        toStatusId: Number(dto.toStatusId),
        name: dto.name,
      },
      include: {
        fromStatus: true,
        toStatus: true,
      },
    });
  }

  async removeTransition(transitionId: string) {
    const numTransitionId = Number(transitionId);

    const transition = await this.prisma.workflowTransition.findUnique({
      where: { id: numTransitionId },
    });

    if (!transition) {
      throw new NotFoundException('Transition not found');
    }

    await this.prisma.workflowTransition.delete({
      where: { id: numTransitionId },
    });

    return { message: 'Transition removed successfully' };
  }
}
