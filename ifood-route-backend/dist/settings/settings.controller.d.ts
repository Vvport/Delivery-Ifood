import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getAll(): Promise<Record<string, string>>;
    setMany(body: Record<string, string>): Promise<{
        ok: boolean;
        geocoded: boolean;
        address: string;
        latitude: string;
        longitude: string;
        geocodeWarning?: undefined;
    } | {
        ok: boolean;
        geocoded: boolean;
        geocodeWarning: string;
        address?: undefined;
        latitude?: undefined;
        longitude?: undefined;
    } | {
        ok: boolean;
        geocoded?: undefined;
        address?: undefined;
        latitude?: undefined;
        longitude?: undefined;
        geocodeWarning?: undefined;
    }>;
}
