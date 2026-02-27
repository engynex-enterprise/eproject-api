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
import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('organizations/:orgId/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a custom role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  async create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateRoleDto,
  ) {
    return this.rolesService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List roles in an organization' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async findAll(@Param('orgId') orgId: string) {
    return this.rolesService.findAllByOrg(orgId);
  }

  @Get(':roleId')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role details' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findById(@Param('roleId') roleId: string) {
    return this.rolesService.findById(roleId);
  }

  @Patch(':roleId')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(roleId, dto);
  }

  @Delete(':roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async delete(@Param('roleId') roleId: string) {
    return this.rolesService.delete(roleId);
  }
}
