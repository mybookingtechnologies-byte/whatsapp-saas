import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateContactDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class UpdateContactDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
