
import { Controller, Post, Patch, Body, Param, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateCampaignDto, AttachContactsDto, ScheduleCampaignDto } from './dto/campaign.dto';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { apiSuccess } from '../../common/response/api-response';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() body: CreateCampaignDto, @Req() req: any) {
    const campaign = await this.campaignsService.createCampaign(body, req.user.organizationId);
    return apiSuccess(campaign, 'Campaign created');
  }

  @Patch(':id/contacts')
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async attachContacts(@Param('id') id: string, @Body() body: AttachContactsDto, @Req() req: any) {
    const campaign = await this.campaignsService.attachContacts(id, body.contactIds, req.user.organizationId);
    return apiSuccess(campaign, 'Contacts attached');
  }

  @Patch(':id/schedule')
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async schedule(@Param('id') id: string, @Body() body: ScheduleCampaignDto, @Req() req: any) {
    const campaign = await this.campaignsService.scheduleCampaign(id, new Date(body.scheduledAt), req.user.organizationId);
    return apiSuccess(campaign, 'Campaign scheduled');
  }
}
