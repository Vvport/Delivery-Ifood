import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AppSetting } from './app-setting.entity';
export declare const MANAGED_KEYS: readonly ["IFOOD_CLIENT_ID", "IFOOD_CLIENT_SECRET", "IFOOD_MERCHANT_ID", "STORE_CEP", "STORE_NUMBER", "OSRM_URL"];
export declare class SettingsService {
    private readonly repo;
    private readonly config;
    private readonly logger;
    constructor(repo: Repository<AppSetting>, config: ConfigService);
    get(key: string): Promise<string | undefined>;
    getAll(): Promise<Record<string, string>>;
    setMany(entries: Record<string, string>): Promise<void>;
    saveCoordinates(latitude: string, longitude: string): Promise<void>;
    geocodeFromCep(cep: string, number: string): Promise<{
        latitude: string;
        longitude: string;
        address: string;
    } | null>;
}
