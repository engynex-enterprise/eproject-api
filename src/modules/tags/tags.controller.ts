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
import { TagsService } from './tags.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { AssignTagDto } from './dto/assign-tag.dto.js';

@ApiTags('Tags')
@ApiBearerAuth()
@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post('organizations/:orgId/tags')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a tag' })
  @ApiResponse({ status: 201, description: 'Tag created' })
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateTagDto,
  ) {
    return this.tagsService.create(orgId, dto);
  }

  @Get('organizations/:orgId/tags')
  @ApiOperation({ summary: 'List tags in an organization' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  async findAll(@Param('orgId') orgId: string) {
    return this.tagsService.findAllByOrg(orgId);
  }

  @Patch('tags/:tagId')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiResponse({ status: 200, description: 'Tag updated' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async update(
    @Param('tagId') tagId: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(tagId, dto);
  }

  @Delete('tags/:tagId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiResponse({ status: 200, description: 'Tag deleted' })
  async delete(@Param('tagId') tagId: string) {
    return this.tagsService.delete(tagId);
  }

  @Post('issues/:issueId/tags/:tagId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a tag to an issue' })
  @ApiResponse({ status: 201, description: 'Tag assigned' })
  @ApiResponse({ status: 409, description: 'Tag already assigned' })
  async assignToIssue(
    @Param('tagId') tagId: string,
    @Param('issueId') issueId: string,
  ) {
    return this.tagsService.assignToIssue(tagId, issueId);
  }

  @Delete('issues/:issueId/tags/:tagId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a tag from an issue' })
  @ApiResponse({ status: 200, description: 'Tag removed' })
  async removeFromIssue(
    @Param('tagId') tagId: string,
    @Param('issueId') issueId: string,
  ) {
    return this.tagsService.removeFromIssue(tagId, issueId);
  }
}
