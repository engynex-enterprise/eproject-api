import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { EventEmitterService } from '../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../shared/events/event-types.js';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async upload(
    issueId: string,
    userId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  ) {
    const numericIssueId = Number(issueId);
    const numericUserId = Number(userId);

    const issue = await this.prisma.issue.findUnique({
      where: { id: numericIssueId, deletedAt: null },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // In a production environment, the file would be uploaded to Supabase Storage
    // For now, we store the metadata in the database
    const storagePath = `attachments/${issue.projectId}/${numericIssueId}/${Date.now()}-${file.originalname}`;

    const attachment = await this.prisma.attachment.create({
      data: {
        issueId: numericIssueId,
        uploadedById: numericUserId,
        fileName: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSizeBytes: BigInt(file.size),
        storagePath,
      },
    });

    this.eventEmitter.emit(EventTypes.ATTACHMENT_UPLOADED, {
      userId: numericUserId,
      projectId: issue.projectId,
      issueId: numericIssueId,
      attachmentId: attachment.id,
      timestamp: new Date(),
    });

    return attachment;
  }

  async findByIssue(issueId: string) {
    const numericIssueId = Number(issueId);

    return this.prisma.attachment.findMany({
      where: { issueId: numericIssueId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(attachmentId: string, userId: string) {
    const numericAttachmentId = Number(attachmentId);
    const numericUserId = Number(userId);

    const attachment = await this.prisma.attachment.findUnique({
      where: { id: numericAttachmentId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // TODO: Delete from Supabase storage as well
    await this.prisma.attachment.delete({
      where: { id: numericAttachmentId },
    });

    this.eventEmitter.emit(EventTypes.ATTACHMENT_DELETED, {
      userId: numericUserId,
      issueId: attachment.issueId,
      attachmentId: numericAttachmentId,
      timestamp: new Date(),
    });

    return { message: 'Attachment deleted successfully' };
  }
}
