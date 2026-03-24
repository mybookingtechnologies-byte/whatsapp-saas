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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CampaignsService = class CampaignsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCampaign(data, organizationId) {
        if (!data.name)
            throw new common_1.BadRequestException('Name is required');
        return this.prisma.campaign.create({
            data: { ...data, organizationId },
        });
    }
    async attachContacts(campaignId, contactIds, organizationId) {
        const campaign = await this.prisma.campaign.findFirst({ where: { id: campaignId, organizationId } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
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
    async scheduleCampaign(campaignId, scheduledAt, organizationId) {
        const campaign = await this.prisma.campaign.findFirst({ where: { id: campaignId, organizationId } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return this.prisma.campaign.update({ where: { id: campaignId }, data: { scheduledAt } });
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsService);
