import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AppearanceService } from './appearance.service.js';
import { UpdateAppearanceDto } from './dto/update-appearance.dto.js';

@ApiTags('Appearance')
@ApiBearerAuth()
@Controller('organizations/:orgId/appearance')
export class AppearanceController {
  constructor(private readonly appearanceService: AppearanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get organization appearance settings' })
  @ApiResponse({ status: 200, description: 'Appearance settings' })
  async get(@Param('orgId') orgId: string) {
    return this.appearanceService.getByOrg(orgId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update organization appearance settings' })
  @ApiResponse({ status: 200, description: 'Appearance updated' })
  async update(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateAppearanceDto,
  ) {
    return this.appearanceService.update(orgId, dto);
  }
}
