import { HttpService } from '@nestjs/axios';
import { SettingsService } from '../settings/settings.service';
export declare class IfoodAuthService {
    private readonly http;
    private readonly settings;
    private readonly logger;
    private readonly authUrl;
    private accessToken;
    private expiresAt;
    constructor(http: HttpService, settings: SettingsService);
    getAccessToken(): Promise<string>;
    private requestNewToken;
}
