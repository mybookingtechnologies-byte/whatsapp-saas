"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BillingService = class BillingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPayment(data, organizationId) {
        if (!data.amount)
            throw new common_1.BadRequestException('Amount required');
        return this.prisma.payment.create({ data: { ...data, organizationId, status: 'PENDING' } });
    }
    async uploadProof(paymentId, proofUrl, organizationId) {
        const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, organizationId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return this.prisma.payment.update({ where: { id: paymentId }, data: { proofUrl } });
    }
    async approveReject(paymentId, approve, organizationId) {
        const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, organizationId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return this.prisma.payment.update({ where: { id: paymentId }, data: { status: approve ? 'APPROVED' : 'REJECTED' } });
    }
    async activatePlan(paymentId, organizationId) {
        const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, organizationId, status: 'APPROVED' } });
        if (!payment)
            throw new common_1.NotFoundException('Approved payment not found');
        // Plan activation logic here
        return payment;
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
