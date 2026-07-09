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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = exports.MANAGED_KEYS = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const app_setting_entity_1 = require("./app-setting.entity");
exports.MANAGED_KEYS = [
    'IFOOD_CLIENT_ID',
    'IFOOD_CLIENT_SECRET',
    'IFOOD_MERCHANT_ID',
    'STORE_CEP',
    'STORE_NUMBER',
    'OSRM_URL',
];
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(repo, config) {
        this.repo = repo;
        this.config = config;
        this.logger = new common_1.Logger(SettingsService_1.name);
    }
    async get(key) {
        const row = await this.repo.findOne({ where: { key } });
        return row?.value ?? this.config.get(key);
    }
    async getAll() {
        const rows = await this.repo.find();
        const dbMap = Object.fromEntries(rows.map((r) => [r.key, r.value]));
        return Object.fromEntries(exports.MANAGED_KEYS.map((key) => [
            key,
            dbMap[key] ?? this.config.get(key) ?? '',
        ]));
    }
    async setMany(entries) {
        for (const [key, value] of Object.entries(entries)) {
            if (exports.MANAGED_KEYS.includes(key)) {
                await this.repo.save({ key, value });
            }
        }
    }
    async saveCoordinates(latitude, longitude) {
        await this.repo.save({ key: 'STORE_LATITUDE', value: latitude });
        await this.repo.save({ key: 'STORE_LONGITUDE', value: longitude });
    }
    async geocodeFromCep(cep, number) {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8)
            return null;
        let addr;
        try {
            const { data } = await axios_1.default.get(`https://viacep.com.br/ws/${cleanCep}/json/`, { timeout: 5000 });
            if (data.erro)
                return null;
            addr = data;
        }
        catch {
            this.logger.warn(`ViaCEP falhou para CEP ${cleanCep}`);
            return null;
        }
        const query = `${addr.logradouro}, ${number}, ${addr.localidade}, ${addr.uf}, Brasil`;
        const parts = [
            `${addr.logradouro}, ${number}`,
            addr.bairro,
            `${addr.localidade} - ${addr.uf}`,
        ].filter(Boolean);
        const address = parts.join(' · ');
        try {
            const { data } = await axios_1.default.get('https://nominatim.openstreetmap.org/search', {
                params: { q: query, format: 'json', limit: 1 },
                headers: { 'User-Agent': 'ifood-route/1.0' },
                timeout: 8000,
            });
            if (!data.length)
                return null;
            return { latitude: data[0].lat, longitude: data[0].lon, address };
        }
        catch {
            this.logger.warn(`Nominatim falhou para: ${query}`);
            return null;
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(app_setting_entity_1.AppSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map