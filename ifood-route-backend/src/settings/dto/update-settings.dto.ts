import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  IFOOD_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  IFOOD_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  IFOOD_MERCHANT_ID?: string;

  @IsOptional()
  @IsString()
  STORE_CEP?: string;

  @IsOptional()
  @IsString()
  STORE_NUMBER?: string;

  @IsOptional()
  @IsString()
  OSRM_URL?: string;
}
