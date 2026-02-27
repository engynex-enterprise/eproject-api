import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { EventEmitterService } from '../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../shared/events/event-types.js';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async create(issueId: string, userId: string, dto: CreateCommentDto) {
    const numericIssueId = Number(issueId);
    const numericUserId = Number(userId);

    const issue = await this.prisma.issue.findUnique({
      where: { id: numericIssueId, deletedAt: null },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        issueId: numericIssueId,
        userId: numericUserId,
        body: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.eventEmitter.emit(EventTypes.COMMENT_CREATED, {
      userId: numericUserId,
      projectId: issue.projectId,
      issueId: numericIssueId,
      commentId: comment.id,
      timestamp: new Date(),
    });

    return comment;
  }

  async findByIssue(issueId: string) {
    const numericIssueId = Number(issueId);

    return this.prisma.comment.findMany({
      where: { issueId: numericIssueId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(commentId: string, userId: string, dto: UpdateCommentDto) {
    const numericCommentId = Number(commentId);
    const numericUserId = Number(userId);

    const comment = await this.prisma.comment.findUnique({
      where: { id: numericCommentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== numericUserId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id: numericCommentId },
      data: {
        body: dto.content,
        isEdited: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async delete(commentId: string, userId: string) {
    const numericCommentId = Number(commentId);
    const numericUserId = Number(userId);

    const comment = await this.prisma.comment.findUnique({
      where: { id: numericCommentId, deletedAt: null },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Allow comment owner to delete
    if (comment.userId !== numericUserId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.update({
      where: { id: numericCommentId },
      data: { deletedAt: new Date() },
    });

    this.eventEmitter.emit(EventTypes.COMMENT_DELETED, {
      userId: numericUserId,
      issueId: comment.issueId,
      commentId: numericCommentId,
      timestamp: new Date(),
    });

    return { message: 'Comment deleted successfully' };
  }
}
