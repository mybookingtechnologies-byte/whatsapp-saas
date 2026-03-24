import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { apiSuccess } from '../../common/response/api-response';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Roles(Role.USER, Role.ADMIN)
  async me(@Req() req: any) {
    const user = await this.userService.findMe(req.user.userId);
    return apiSuccess(user, 'User profile fetched');
  }
}
