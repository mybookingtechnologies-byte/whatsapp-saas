import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Role } from '../../common/constants/roles.enum';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { apiSuccess } from '../../common/response/api-response';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('organization')
export class OrganizationController {
  constructor(private orgService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Roles(Role.USER, Role.ADMIN)
  async me(@Req() req: any) {
    const org = await this.orgService.getMyOrganization(req.user.organizationId);
    return apiSuccess(org, 'Organization profile fetched');
  }
}
