"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    validatePasswordStrength(password) {
        if (!AuthService_1.PASSWORD_REGEX.test(password)) {
            throw new common_1.BadRequestException('Password must be at least 10 characters, include upper and lower case letters, a number, and a special character.');
        }
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }
    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    buildJwtPayload(user) {
        return {
            sub: user.id,
            role: user.role,
            organizationId: user.organizationId,
        };
    }
    async generateTokens(user) {
        const payload = this.buildJwtPayload(user);
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        // Remove sensitive fields
        const { password, ...rest } = user;
        return rest;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await this.comparePassword(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const tokens = await this.generateTokens({ id: user.id, role: user.role, organizationId: user.organizationId });
        return {
            success: true,
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: this.sanitizeUser({ ...user, organizationId: user.organizationId }),
            },
        };
    }
    async register(dto) {
        this.validatePasswordStrength(dto.password);
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists)
            throw new common_1.BadRequestException('Email already registered');
        const hashedPassword = await this.hashPassword(dto.password);
        const organization = await this.prisma.organization.create({
            data: {
                name: dto.organizationName,
                users: {
                    create: [{
                            email: dto.email,
                            password: hashedPassword,
                            name: dto.name,
                            role: client_1.$Enums.Role.ADMIN,
                        }],
                },
            },
            include: { users: true },
        });
        const user = organization.users[0];
        const tokens = await this.generateTokens({ id: user.id, role: user.role, organizationId: organization.id });
        return {
            success: true,
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: this.sanitizeUser({ ...user, organizationId: organization.id }),
            },
        };
    }
    async refreshToken(dto) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken);
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user)
                throw new common_1.UnauthorizedException('Invalid refresh token');
            // Optionally: check if user is active, not banned, etc.
            const tokens = await this.generateTokens({ id: user.id, role: user.role, organizationId: user.organizationId });
            return {
                success: true,
                data: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    user: this.sanitizeUser({ ...user, organizationId: user.organizationId }),
                },
            };
        }
        catch {
            throw new common_1.ForbiddenException('Invalid or expired refresh token');
        }
    }
    async logout() {
        // For stateless JWT, logout is handled client-side by deleting tokens.
        // Optionally, implement token blacklist here if needed.
        return {
            success: true,
            data: null,
        };
    }
};
exports.AuthService = AuthService;
AuthService.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
