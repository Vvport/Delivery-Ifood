"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const api_key_guard_1 = require("./auth/api-key.guard");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    app.useGlobalGuards(new api_key_guard_1.ApiKeyGuard(config));
    app.enableCors({
        origin: config.get('FRONTEND_URL') ?? 'http://localhost:3001',
        methods: ['GET', 'DELETE'],
    });
    const port = config.get('PORT') ?? 3000;
    await app.listen(port);
    console.log(`Servidor rodando na porta ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map