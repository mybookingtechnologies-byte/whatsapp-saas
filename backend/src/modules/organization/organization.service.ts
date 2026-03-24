import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getMyOrganization(orgId: string) {
    return this.prisma.organization.findUnique({ where: { id: orgId } });
  }
}
