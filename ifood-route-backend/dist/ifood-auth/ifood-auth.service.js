"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IfoodAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfoodAuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const settings_service_1 = require("../settings/settings.service");
let IfoodAuthService = IfoodAuthService_1 = class IfoodAuthService {
    constructor(http, settings) {
        this.http = http;
        this.settings = settings;
        this.logger = new common_1.Logger(IfoodAuthService_1.name);
        this.authUrl = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';
        this.accessToken = null;
        this.expiresAt = 0;
    }
    async getAccessToken() {
        const now = Date.now();
        const margemSeguranca = 30_000;
        if (this.accessToken && now < this.expiresAt - margemSeguranca) {
            return this.accessToken;
        }
        return this.requestNewToken();
    }
    async requestNewToken() {
        const clientId = (await this.settings.get('IFOOD_CLIENT_ID')) ?? '';
        const clientSecret = (await this.settings.get('IFOOD_CLIENT_SECRET')) ?? '';
        const params = new URLSearchParams({
            grantType: 'client_credentials',
            clientId,
            clientSecret,
        });
        const response = await (0, rxjs_1.firstValueFrom)(this.http.post(this.authUrl, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }));
        this.accessToken = response.data.accessToken;
        this.expiresAt = Date.now() + response.data.expiresIn * 1000;
        this.logger.log('Token de acesso do iFood renovado com sucesso');
        return this.accessToken;
    }
};
exports.IfoodAuthService = IfoodAuthService;
exports.IfoodAuthService = IfoodAuthService = IfoodAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        settings_service_1.SettingsService])
], IfoodAuthService);
//# sourceMappingURL=ifood-auth.service.js.map