
import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { apiSuccess } from '../../common/response/api-response';

@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() body: CreateContactDto, @Req() req: any) {
    const contact = await this.contactsService.createContact(body, req.user.organizationId);
    return apiSuccess(contact, 'Contact created');
  }

  @Get()
  async list(@Req() req: any) {
    const contacts = await this.contactsService.listContacts(req.user.organizationId);
    return apiSuccess(contacts, 'Contacts list');
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() body: UpdateContactDto, @Req() req: any) {
    const contact = await this.contactsService.updateContact(id, body, req.user.organizationId);
    return apiSuccess(contact, 'Contact updated');
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.contactsService.deleteContact(id, req.user.organizationId);
    return apiSuccess(null, 'Contact deleted');
  }
}
