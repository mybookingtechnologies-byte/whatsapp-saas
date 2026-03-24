import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  name!: string;

  @IsString()
  content!: string;

  @IsArray()
  @IsOptional()
  contactIds?: string[];
}

export class AttachContactsDto {
  @IsArray()
  contactIds!: string[];
}

export class ScheduleCampaignDto {
  @IsDateString()
  scheduledAt!: string;
}
