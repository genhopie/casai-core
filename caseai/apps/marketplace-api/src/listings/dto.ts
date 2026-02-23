import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min
} from 'class-validator';

export enum GeoScopeLevelDto {
  LOCAL = 'LOCAL',
  REGIONAL = 'REGIONAL',
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL'
}

export enum ListingStatusDto {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED'
}

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  jurisdiction!: string;

  @IsString()
  @IsNotEmpty()
  case_type!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages!: string[];

  @IsEnum(GeoScopeLevelDto)
  geo_scope_level!: GeoScopeLevelDto;

  @IsDateString()
  deadline_date!: string;

  @Type(() => Number)
  @IsNumber()
  budget_min!: number;

  @Type(() => Number)
  @IsNumber()
  budget_max!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  doc_volume_count!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  doc_volume_pages_est!: number;

  @IsString()
  @IsNotEmpty()
  anonym_summary!: string;
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  case_type?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsEnum(GeoScopeLevelDto)
  geo_scope_level?: GeoScopeLevelDto;

  @IsOptional()
  @IsDateString()
  deadline_date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget_max?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  doc_volume_count?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  doc_volume_pages_est?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  anonym_summary?: string;
}

export class ListingFiltersDto {
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  case_type?: string;

  @IsOptional()
  @IsEnum(ListingStatusDto)
  status?: ListingStatusDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit = 20;
}
