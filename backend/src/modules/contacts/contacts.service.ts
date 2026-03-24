import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Contact } from '@prisma/client';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async createContact(data: Partial<Contact>, organizationId: string): Promise<Contact> {
    if (!data.phone) throw new BadRequestException('Phone is required');
    return this.prisma.contact.create({
      data: { ...data, organizationId },
    });
  }

  async listContacts(organizationId: string): Promise<Contact[]> {
    return this.prisma.contact.findMany({ where: { organizationId } });
  }

  async updateContact(id: string, data: Partial<Contact>, organizationId: string): Promise<Contact> {
    const contact = await this.prisma.contact.findFirst({ where: { id, organizationId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.contact.update({ where: { id }, data });
  }

  async deleteContact(id: string, organizationId: string): Promise<void> {
    const contact = await this.prisma.contact.findFirst({ where: { id, organizationId } });
    if (!contact) throw new NotFoundException('Contact not found');
    await this.prisma.contact.delete({ where: { id } });
  }
}
