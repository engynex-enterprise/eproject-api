import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateAppearanceDto } from './dto/update-appearance.dto.js';

@Injectable()
export class AppearanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getByOrg(orgId: string) {
    const numericOrgId = Number(orgId);

    let appearance = await this.prisma.organizationAppearance.findUnique({
      where: { orgId: numericOrgId },
    });

    if (!appearance) {
      // Return defaults
      return {
        orgId: numericOrgId,
        primaryColor: '#3B82F6',
        secondaryColor: null,
        accentColor: null,
        fontFamily: null,
        logoUrl: null,
        logoDarkUrl: null,
        faviconUrl: null,
        customCss: null,
        darkMode: false,
      };
    }

    return appearance;
  }

  async update(orgId: string, dto: UpdateAppearanceDto) {
    const numericOrgId = Number(orgId);

    // Validate the organization exists before creating/updating appearance
    const org = await this.prisma.organization.findUnique({
      where: { id: numericOrgId },
    });

    if (!org) {
      throw new NotFoundException(`Organization with id ${numericOrgId} not found`);
    }

    const existing = await this.prisma.organizationAppearance.findUnique({
      where: { orgId: numericOrgId },
    });

    if (!existing) {
      return this.prisma.organizationAppearance.create({
        data: {
          orgId: numericOrgId,
          primaryColor: dto.primaryColor ?? null,
          secondaryColor: dto.secondaryColor ?? null,
          accentColor: dto.accentColor ?? null,
          fontFamily: dto.fontFamily ?? null,
          logoUrl: dto.logoUrl ?? null,
          logoDarkUrl: dto.logoDarkUrl ?? null,
          faviconUrl: dto.faviconUrl ?? null,
          customCss: dto.customCss ?? null,
          darkMode: dto.darkMode ?? false,
        },
      });
    }

    return this.prisma.organizationAppearance.update({
      where: { orgId: numericOrgId },
      data: {
        ...(dto.primaryColor !== undefined && { primaryColor: dto.primaryColor }),
        ...(dto.secondaryColor !== undefined && { secondaryColor: dto.secondaryColor }),
        ...(dto.accentColor !== undefined && { accentColor: dto.accentColor }),
        ...(dto.fontFamily !== undefined && { fontFamily: dto.fontFamily }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.logoDarkUrl !== undefined && { logoDarkUrl: dto.logoDarkUrl }),
        ...(dto.faviconUrl !== undefined && { faviconUrl: dto.faviconUrl }),
        ...(dto.customCss !== undefined && { customCss: dto.customCss }),
        ...(dto.darkMode !== undefined && { darkMode: dto.darkMode }),
      },
    });
  }
}
