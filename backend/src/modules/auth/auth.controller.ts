

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../../common/dto/login.dto';
import { RegisterDto } from '../../common/dto/register.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { apiSuccess } from '../../common/response/api-response';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.auth.login(body);
    return result;
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const result = await this.auth.register(body);
    return result;
  }
}
