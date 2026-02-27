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
import { SpacesService } from './spaces.service.js';
import { CreateSpaceDto } from './dto/create-space.dto.js';
import { UpdateSpaceDto } from './dto/update-space.dto.js';
import { UpdateSpaceSettingsDto } from './dto/update-space-settings.dto.js';
import { UpdateBoardConfigDto } from './dto/update-board-config.dto.js';

@ApiTags('Spaces')
@ApiBearerAuth()
@Controller()
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post('projects/:projectId/spaces')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new space in a project' })
  @ApiResponse({ status: 201, description: 'Space created' })
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSpaceDto,
  ) {
    return this.spacesService.create(projectId, dto);
  }

  @Get('projects/:projectId/spaces')
  @ApiOperation({ summary: 'List spaces in a project' })
  @ApiResponse({ status: 200, description: 'List of spaces' })
  async findAll(@Param('projectId') projectId: string) {
    return this.spacesService.findAllByProject(projectId);
  }

  @Get('spaces/:spaceId')
  @ApiOperation({ summary: 'Get space by ID' })
  @ApiResponse({ status: 200, description: 'Space details' })
  @ApiResponse({ status: 404, description: 'Space not found' })
  async findById(@Param('spaceId') spaceId: string) {
    return this.spacesService.findById(spaceId);
  }

  @Patch('spaces/:spaceId')
  @ApiOperation({ summary: 'Update a space' })
  @ApiResponse({ status: 200, description: 'Space updated' })
  @ApiResponse({ status: 404, description: 'Space not found' })
  async update(
    @Param('spaceId') spaceId: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    return this.spacesService.update(spaceId, dto);
  }

  @Delete('spaces/:spaceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a space' })
  @ApiResponse({ status: 200, description: 'Space deleted' })
  @ApiResponse({ status: 404, description: 'Space not found' })
  async delete(@Param('spaceId') spaceId: string) {
    return this.spacesService.delete(spaceId);
  }

  @Get('spaces/:spaceId/settings')
  @ApiOperation({ summary: 'Get space settings' })
  @ApiResponse({ status: 200, description: 'Space settings' })
  async getSettings(@Param('spaceId') spaceId: string) {
    return this.spacesService.getSettings(spaceId);
  }

  @Patch('spaces/:spaceId/settings')
  @ApiOperation({ summary: 'Update space settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(
    @Param('spaceId') spaceId: string,
    @Body() dto: UpdateSpaceSettingsDto,
  ) {
    return this.spacesService.updateSettings(spaceId, dto);
  }

  @Get('spaces/:spaceId/board-config')
  @ApiOperation({ summary: 'Get space board configuration' })
  @ApiResponse({ status: 200, description: 'Board configuration' })
  async getBoardConfig(@Param('spaceId') spaceId: string) {
    return this.spacesService.getBoardConfig(spaceId);
  }

  @Patch('spaces/:spaceId/board-config')
  @ApiOperation({ summary: 'Update space board configuration' })
  @ApiResponse({ status: 200, description: 'Board config updated' })
  async updateBoardConfig(
    @Param('spaceId') spaceId: string,
    @Body() dto: UpdateBoardConfigDto,
  ) {
    return this.spacesService.updateBoardConfig(spaceId, dto);
  }
}
