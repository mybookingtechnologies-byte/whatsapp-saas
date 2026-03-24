import { IsString, IsEnum } from 'class-validator';

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export class SendMessageDto {
  @IsString()
  content!: string;

  @IsString()
  contactId!: string;

  @IsString()
  @IsEnum(MessageDirection)
  direction!: MessageDirection;
}
