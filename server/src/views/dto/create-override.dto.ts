import { IsString, IsNumber } from 'class-validator';

export class CreateOverrideDto {
  @IsString() viewKey: string;
  @IsNumber() posX: number; @IsNumber() posY: number; @IsNumber() posZ: number;
  @IsNumber() targetX: number; @IsNumber() targetY: number; @IsNumber() targetZ: number;
}
