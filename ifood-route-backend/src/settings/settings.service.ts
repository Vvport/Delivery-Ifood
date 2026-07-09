import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AppSetting } from './app-setting.entity';

export const MANAGED_KEYS = [
  'IFOOD_CLIENT_ID',
  'IFOOD_CLIENT_SECRET',
  'IFOOD_MERCHANT_ID',
  'STORE_CEP',
  'STORE_NUMBER',
  'STORE_COMPLEMENT',
  'OSRM_URL',
  'MOTOBOY_RATE_PER_KM',
] as const;

interface ViaCepResponse {
  erro?: boolean;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  private readonly ifoodBaseUrl = 'https://merchant-api.ifood.com.br';

  constructor(
    @InjectRepository(AppSetting)
    private readonly repo: Repository<AppSetting>,
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  async get(key: string): Promise<string | undefined> {
    const row = await this.repo.findOne({ where: { key } });
    return row?.value ?? this.config.get<string>(key);
  }

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.repo.find();
    const dbMap = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    return Object.fromEntries(
      MANAGED_KEYS.map((key) => [
        key,
        dbMap[key] ?? this.config.get<string>(key) ?? '',
      ]),
    );
  }

  async setMany(entries: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      if ((MANAGED_KEYS as readonly string[]).includes(key)) {
        await this.repo.save({ key, value });
      }
    }
  }

  async saveCoordinates(latitude: string, longitude: string): Promise<void> {
    await this.repo.save({ key: 'STORE_LATITUDE', value: latitude });
    await this.repo.save({ key: 'STORE_LONGITUDE', value: longitude });
  }

  async validateIfoodCredentials(
    entries: Record<string, string>,
  ): Promise<{ ok: boolean; message: string; authenticated?: boolean; merchantIdValid?: boolean }> {
    const clientId = entries.IFOOD_CLIENT_ID ?? '';
    const clientSecret = entries.IFOOD_CLIENT_SECRET ?? '';
    const merchantId = entries.IFOOD_MERCHANT_ID ?? '';

    if (!clientId || !clientSecret || !merchantId) {
      return {
        ok: false,
        message: 'Preencha Client ID, Client Secret e Merchant ID para validar.',
      };
    }

    const token = await this.requestIfoodToken(clientId, clientSecret);
    if (!token) {
      return {
        ok: false,
        message: 'Autenticação no iFood falhou. Verifique Client ID e Client Secret.',
      };
    }

    const merchantIdValid = await this.verifyMerchantId(token, merchantId);
    if (!merchantIdValid) {
      return {
        ok: false,
        message: 'Merchant ID inválido ou não autorizado para essas credenciais.',
      };
    }

    return {
      ok: true,
      authenticated: true,
      merchantIdValid: true,
      message: 'Credenciais e Merchant ID validados com sucesso.',
    };
  }

  private async requestIfoodToken(
    clientId: string,
    clientSecret: string,
  ): Promise<string | null> {
    const params = new URLSearchParams({
      grantType: 'client_credentials',
      clientId,
      clientSecret,
    });

    try {
      const response = await firstValueFrom(
        this.http.post<{ accessToken: string; expiresIn: number; type: string }>(
          `${this.ifoodBaseUrl}/authentication/v1.0/oauth/token`,
          params.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );

      return response.data.accessToken;
    } catch (err: any) {
      this.logger.warn(
        'Falha ao requisitar token iFood durante validação de credenciais',
      );
      return null;
    }
  }

  private async verifyMerchantId(
    accessToken: string,
    merchantId: string,
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.ifoodBaseUrl}/events/v1.0/events:polling`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-polling-merchants': merchantId,
          },
        }),
      );

      return response.status === 200;
    } catch (err: any) {
      this.logger.warn(
        'Falha ao verificar Merchant ID durante validação de credenciais',
      );
      return false;
    }
  }

  async geocodeFromCep(
    cep: string,
    number: string,
  ): Promise<{ latitude: string; longitude: string; address: string } | null> {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;

    // 1. Busca endereço pelo CEP via ViaCEP
    let addr: ViaCepResponse;
    try {
      const { data } = await axios.get<ViaCepResponse>(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
        { timeout: 5000 },
      );
      if (data.erro) return null;
      addr = data;
    } catch {
      this.logger.warn(`ViaCEP falhou para CEP ${cleanCep}`);
      return null;
    }

    // 2. Geocodifica o endereço via Nominatim (OpenStreetMap)
    const query = `${addr.logradouro}, ${number}, ${addr.localidade}, ${addr.uf}, Brasil`;
    const parts = [
      `${addr.logradouro}, ${number}`,
      addr.bairro,
      `${addr.localidade} - ${addr.uf}`,
    ].filter(Boolean);
    const address = parts.join(' · ');

    try {
      const { data } = await axios.get<NominatimResult[]>(
        'https://nominatim.openstreetmap.org/search',
        {
          params: { q: query, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'ifood-route/1.0' },
          timeout: 8000,
        },
      );
      if (!data.length) return null;
      return { latitude: data[0].lat, longitude: data[0].lon, address };
    } catch {
      this.logger.warn(`Nominatim falhou para: ${query}`);
      return null;
    }
  }
}
