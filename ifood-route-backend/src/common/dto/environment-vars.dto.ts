import { IsNotEmpty, IsString } from 'class-validator';

export class EnvironmentVarsDto {
  @IsNotEmpty()
  @IsString()
  API_KEY!: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL!: string;

  @IsNotEmpty()
  @IsString()
  IFOOD_CLIENT_ID!: string;

  @IsNotEmpty()
  @IsString()
  IFOOD_CLIENT_SECRET!: string;

  @IsNotEmpty()
  @IsString()
  IFOOD_MERCHANT_ID!: string;

  @IsNotEmpty()
  @IsString()
  STORE_CEP!: string;

  @IsNotEmpty()
  @IsString()
  STORE_NUMBER!: string;

  @IsNotEmpty()
  @IsString()
  STORE_LATITUDE!: string;

  @IsNotEmpty()
  @IsString()
  STORE_LONGITUDE!: string;
}
