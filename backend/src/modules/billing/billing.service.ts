import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payment } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(data: Partial<Payment>, organizationId: string): Promise<Payment> {
    if (typeof data.amount !== 'number') throw new BadRequestException('Amount required');
    return this.prisma.payment.create({
      data: {
        amount: data.amount,
        organizationId,
        status: 'PENDING',
        proofUrl: data.proofUrl ?? null,
        approvedById: data.approvedById ?? null,
      },
    });
  }

  async uploadProof(paymentId: string, proofUrl: string, organizationId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, organizationId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.prisma.payment.update({ where: { id: paymentId }, data: { proofUrl } });
  }

  async approveReject(paymentId: string, approve: boolean, organizationId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, organizationId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.prisma.payment.update({ where: { id: paymentId }, data: { status: approve ? 'APPROVED' : 'REJECTED' } });
  }

  async activatePlan(paymentId: string, organizationId: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, organizationId, status: 'APPROVED' } });
    if (!payment) throw new NotFoundException('Approved payment not found');
    // Plan activation logic here
    return payment;
  }
}
