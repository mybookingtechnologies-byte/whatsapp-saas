import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Message } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(data: Partial<Message>, organizationId: string): Promise<Message> {
    if (!data.content || !data.contactId) throw new BadRequestException('Content and contactId required');
    if (!data.direction) throw new BadRequestException('Direction required');
    return this.prisma.message.create({
      data: {
        content: data.content,
        contactId: data.contactId,
        direction: data.direction,
        status: 'SENT',
        userId: data.userId ?? null,
        campaignId: data.campaignId ?? null,
      },
    });
  }

  async trackStatus(messageId: string, organizationId: string): Promise<Message> {
    const message = await this.prisma.message.findFirst({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async inboundOutboundLogic(messageId: string, direction: 'INBOUND' | 'OUTBOUND', organizationId: string): Promise<Message> {
    const message = await this.prisma.message.findFirst({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    return this.prisma.message.update({ where: { id: messageId }, data: { direction } });
  }
}
