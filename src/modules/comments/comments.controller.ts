import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('issues/:issueId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to an issue' })
  @ApiResponse({ status: 201, description: 'Comment created' })
  @ApiResponse({ status: 404, description: 'Issue not found' })
  async create(
    @Param('issueId') issueId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(issueId, user.userId, dto);
  }

  @Get('issues/:issueId/comments')
  @ApiOperation({ summary: 'List comments on an issue' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async findByIssue(@Param('issueId') issueId: string) {
    return this.commentsService.findByIssue(issueId);
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated' })
  @ApiResponse({ status: 403, description: 'Can only edit own comments' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('commentId') commentId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(commentId, user.userId, dto);
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  @ApiResponse({ status: 403, description: 'Can only delete own comments' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async delete(
    @Param('commentId') commentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commentsService.delete(commentId, user.userId);
  }
}
