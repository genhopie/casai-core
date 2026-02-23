import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum PricingTypeDto {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY'
}

export class CreateBidDto {
  @IsEnum(PricingTypeDto)
  pricing_type!: PricingTypeDto;

  @Type(() => Number)
  @IsNumber()
  price_amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsString()
  @IsNotEmpty()
  estimate_text!: string;

  @IsString()
  @IsNotEmpty()
  conditions_text!: string;
}
