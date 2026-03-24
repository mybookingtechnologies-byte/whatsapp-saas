
import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from '../../common/dto/login.dto';
import { RegisterDto } from '../../common/dto/register.dto';
import { RefreshTokenDto } from '../../common/dto/refresh-token.dto';
import { $Enums } from '@prisma/client';
type Role = $Enums.Role;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;

  private validatePasswordStrength(password: string): void {
    if (!AuthService.PASSWORD_REGEX.test(password)) {
      throw new BadRequestException('Password must be at least 10 characters, include upper and lower case letters, a number, and a special character.');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }


  private buildJwtPayload(user: { id: string; role: Role; organizationId: string }) {
    return {
      sub: user.id,
      role: user.role,
      organizationId: user.organizationId,
    };
  }

  private async generateTokens(user: { id: string; role: Role; organizationId: string }) {
    const payload = this.buildJwtPayload(user);
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    // Remove sensitive fields
    const { password, ...rest } = user;
    return rest;
  }


  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await this.comparePassword(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.generateTokens({ id: user.id, role: user.role as Role, organizationId: (user as any).organizationId });
    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.sanitizeUser({ ...user, organizationId: (user as any).organizationId }),
      },
    };
  }


  async register(dto: RegisterDto) {
    this.validatePasswordStrength(dto.password);
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already registered');
    const hashedPassword = await this.hashPassword(dto.password);
    const organization = await (this.prisma as any).organization.create({
      data: {
        name: dto.organizationName,
        users: {
          create: [{
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
            role: $Enums.Role.ADMIN,
          }],
        },
      },
      include: { users: true },
    });
    const user = organization.users[0];
    const tokens = await this.generateTokens({ id: user.id, role: user.role as Role, organizationId: organization.id });
    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.sanitizeUser({ ...user, organizationId: organization.id }),
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('Invalid refresh token');
      // Optionally: check if user is active, not banned, etc.
      const tokens = await this.generateTokens({ id: user.id, role: user.role as Role, organizationId: (user as any).organizationId });
      return {
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: this.sanitizeUser({ ...user, organizationId: (user as any).organizationId }),
        },
      };
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
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
}
