import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('issues/:issueId/attachments')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an attachment to an issue' })
  @ApiResponse({ status: 201, description: 'Attachment uploaded' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async upload(
    @Param('issueId') issueId: string,
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.attachmentsService.upload(issueId, user.userId, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });
  }

  @Get('issues/:issueId/attachments')
  @ApiOperation({ summary: 'List attachments on an issue' })
  @ApiResponse({ status: 200, description: 'List of attachments' })
  async findByIssue(@Param('issueId') issueId: string) {
    return this.attachmentsService.findByIssue(issueId);
  }

  @Delete('attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async delete(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.attachmentsService.delete(attachmentId, user.userId);
  }
}
