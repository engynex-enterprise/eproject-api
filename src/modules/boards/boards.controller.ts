import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { BoardsService } from './boards.service.js';
import { CreateBoardDto } from './dto/create-board.dto.js';
import { UpdateBoardDto } from './dto/update-board.dto.js';

@ApiTags('Boards')
@ApiBearerAuth()
@Controller()
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get('projects/key/:projectKey/board')
  @ApiOperation({ summary: 'Get board data (columns with issues) by project key' })
  @ApiResponse({ status: 200, description: 'Board data with columns and issues' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiQuery({ name: 'assigneeId', required: false, type: Number })
  @ApiQuery({ name: 'issueTypeId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sprintId', required: false, type: Number })
  async getBoardData(
    @Param('projectKey') projectKey: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('issueTypeId') issueTypeId?: string,
    @Query('search') search?: string,
    @Query('sprintId') sprintId?: string,
  ) {
    const filters = {
      ...(assigneeId && { assigneeId: Number(assigneeId) }),
      ...(issueTypeId && { issueTypeId: Number(issueTypeId) }),
      ...(search && { search }),
      ...(sprintId && { sprintId: Number(sprintId) }),
    };
    return this.boardsService.getBoardDataByProjectKey(projectKey, filters);
  }

  @Get('projects/key/:projectKey/backlog')
  @ApiOperation({ summary: 'Get backlog data (sprints with issues + unassigned issues)' })
  @ApiResponse({ status: 200, description: 'Backlog data' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getBacklogData(@Param('projectKey') projectKey: string) {
    return this.boardsService.getBacklogByProjectKey(projectKey);
  }

  @Post('projects/:projectId/boards')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new board' })
  @ApiResponse({ status: 201, description: 'Board created' })
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardsService.create(projectId, dto);
  }

  @Get('projects/:projectId/boards')
  @ApiOperation({ summary: 'List boards in a project' })
  @ApiResponse({ status: 200, description: 'List of boards' })
  async findAll(@Param('projectId') projectId: string) {
    return this.boardsService.findAllByProject(projectId);
  }

  @Get('boards/:boardId')
  @ApiOperation({ summary: 'Get board by ID' })
  @ApiResponse({ status: 200, description: 'Board details' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async findById(@Param('boardId') boardId: string) {
    return this.boardsService.findById(boardId);
  }

  @Patch('boards/:boardId')
  @ApiOperation({ summary: 'Update a board' })
  @ApiResponse({ status: 200, description: 'Board updated' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async update(
    @Param('boardId') boardId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(boardId, dto);
  }

  @Delete('boards/:boardId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a board' })
  @ApiResponse({ status: 200, description: 'Board deleted' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async delete(@Param('boardId') boardId: string) {
    return this.boardsService.delete(boardId);
  }
}
