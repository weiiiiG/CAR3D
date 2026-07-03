import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class UpdateViewDto {
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() spec?: string;
  @IsOptional() @IsString() specCategory?: string;
  @IsOptional() @IsNumber() posX?: number; @IsOptional() @IsNumber() posY?: number; @IsOptional() @IsNumber() posZ?: number;
  @IsOptional() @IsNumber() targetX?: number; @IsOptional() @IsNumber() targetY?: number; @IsOptional() @IsNumber() targetZ?: number;
  @IsOptional() @IsObject() chartConfig?: any;
  @IsOptional() sortOrder?: number;
  @IsOptional() isActive?: boolean;
}
