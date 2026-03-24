
import { Controller, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { apiSuccess } from '../../common/response/api-response';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() body: any, @Req() req: any) {
    const payment = await this.billingService.createPayment(body, req.user.organizationId);
    return apiSuccess(payment, 'Payment created');
  }

  @Patch(':id/proof')
  @Roles(Role.ADMIN)
  async uploadProof(@Param('id') id: string, @Body('proofUrl') proofUrl: string, @Req() req: any) {
    const payment = await this.billingService.uploadProof(id, proofUrl, req.user.organizationId);
    return apiSuccess(payment, 'Proof uploaded');
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  async approve(@Param('id') id: string, @Req() req: any) {
    const payment = await this.billingService.approveReject(id, true, req.user.organizationId);
    return apiSuccess(payment, 'Payment approved');
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  async reject(@Param('id') id: string, @Req() req: any) {
    const payment = await this.billingService.approveReject(id, false, req.user.organizationId);
    return apiSuccess(payment, 'Payment rejected');
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  async activate(@Param('id') id: string, @Req() req: any) {
    const payment = await this.billingService.activatePlan(id, req.user.organizationId);
    return apiSuccess(payment, 'Plan activated');
  }
}
