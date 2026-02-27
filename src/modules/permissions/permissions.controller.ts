import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service.js';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all available permissions' })
  @ApiResponse({ status: 200, description: 'List of permission definitions' })
  findAll() {
    return this.permissionsService.getAll();
  }
}
