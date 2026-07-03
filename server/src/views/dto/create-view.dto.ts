import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateViewDto {
  @IsString() key: string;
  @IsString() label: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() spec?: string;
  @IsOptional() @IsString() specCategory?: string;
  @IsNumber() posX: number; @IsNumber() posY: number; @IsNumber() posZ: number;
  @IsNumber() targetX: number; @IsNumber() targetY: number; @IsNumber() targetZ: number;
  @IsOptional() @IsObject() chartConfig?: any;
  @IsOptional() sortOrder?: number;
}
