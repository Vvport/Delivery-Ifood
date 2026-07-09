import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SettingsService } from '../settings/settings.service';

interface IfoodTokenResponse {
  accessToken: string;
  expiresIn: number;
  type: string;
}

@Injectable()
export class IfoodAuthService {
  private readonly logger = new Logger(IfoodAuthService.name);
  private readonly authUrl =
    'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';

  private accessToken: string | null = null;
  private expiresAt = 0;

  constructor(
    private readonly http: HttpService,
    private readonly settings: SettingsService,
  ) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    const margemSeguranca = 30_000;

    if (this.accessToken && now < this.expiresAt - margemSeguranca) {
      return this.accessToken;
    }

    return this.requestNewToken();
  }

  private async requestNewToken(): Promise<string> {
    const clientId = (await this.settings.get('IFOOD_CLIENT_ID')) ?? '';
    const clientSecret = (await this.settings.get('IFOOD_CLIENT_SECRET')) ?? '';

    const params = new URLSearchParams({
      grantType: 'client_credentials',
      clientId,
      clientSecret,
    });

    const response = await firstValueFrom(
      this.http.post<IfoodTokenResponse>(this.authUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    this.accessToken = response.data.accessToken;
    this.expiresAt = Date.now() + response.data.expiresIn * 1000;

    this.logger.log('Token de acesso do iFood renovado com sucesso');
    return this.accessToken;
  }
}
