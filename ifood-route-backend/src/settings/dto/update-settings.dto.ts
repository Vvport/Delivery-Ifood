import { IsOptional, IsString, Matches } from 'class-validator';

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
  STORE_COMPLEMENT?: string;

  @IsOptional()
  @IsString()
  OSRM_URL?: string;

  @IsOptional()
  @Matches(/^[0-9]+(?:[.,][0-9]{1,2})?$/)
  MOTOBOY_RATE_PER_KM?: string;
}
