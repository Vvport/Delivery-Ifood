import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AppSetting } from './app-setting.entity';

export const MANAGED_KEYS = [
  'IFOOD_CLIENT_ID',
  'IFOOD_CLIENT_SECRET',
  'IFOOD_MERCHANT_ID',
  'STORE_CEP',
  'STORE_NUMBER',
  'OSRM_URL',
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

  constructor(
    @InjectRepository(AppSetting)
    private readonly repo: Repository<AppSetting>,
    private readonly config: ConfigService,
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
