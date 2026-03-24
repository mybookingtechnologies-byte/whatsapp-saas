import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Campaign, Contact } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCampaign(data: Partial<Campaign>, organizationId: string): Promise<Campaign> {
    if (!data.name) throw new BadRequestException('Name is required');
    return this.prisma.campaign.create({
      data: { ...data, organizationId },
    });
  }

  async attachContacts(campaignId: string, contactIds: string[], organizationId: string): Promise<Campaign> {
    const campaign = await this.prisma.campaign.findFirst({ where: { id: campaignId, organizationId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        contacts: {
          set: contactIds.map(id => ({ id })),
        },
      },
    });
    return this.prisma.campaign.findUnique({ where: { id: campaignId } });
  }

  async scheduleCampaign(campaignId: string, scheduledAt: Date, organizationId: string): Promise<Campaign> {
    const campaign = await this.prisma.campaign.findFirst({ where: { id: campaignId, organizationId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return this.prisma.campaign.update({ where: { id: campaignId }, data: { scheduledAt } });
  }
}
