import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service.js';
import { AuditLogQueryDto } from './dto/audit-log-query.dto.js';
import { ApiPaginated } from '../../common/decorators/api-paginated.decorator.js';

@ApiTags('Audit Log')
@ApiBearerAuth()
@Controller('organizations/:orgId/audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiPaginated()
  @ApiOperation({ summary: 'Get organization audit log' })
  @ApiResponse({ status: 200, description: 'Paginated audit log entries' })
  async findAll(
    @Param('orgId') orgId: string,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.auditLogService.findByOrg(orgId, query);
  }
}
