
import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { SendMessageDto, MessageDirection } from './dto/message.dto';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { apiSuccess } from '../../common/response/api-response';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async send(@Body() body: SendMessageDto, @Req() req: any) {
    const message = await this.messagesService.sendMessage(body, req.user.organizationId);
    return apiSuccess(message, 'Message sent');
  }

  @Get(':id/status')
  async status(@Param('id') id: string, @Req() req: any) {
    const message = await this.messagesService.trackStatus(id, req.user.organizationId);
    return apiSuccess(message, 'Message status');
  }

  @Patch(':id/direction')
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async direction(@Param('id') id: string, @Body('direction') direction: MessageDirection, @Req() req: any) {
    const message = await this.messagesService.inboundOutboundLogic(id, direction, req.user.organizationId);
    return apiSuccess(message, 'Direction updated');
  }
}
