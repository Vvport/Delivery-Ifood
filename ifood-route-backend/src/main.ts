import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiKeyGuard } from './auth/api-key.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.useGlobalGuards(new ApiKeyGuard(config));

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001',
    methods: ['GET', 'DELETE'],
  });

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`Servidor rodando na porta ${port}`);
}

bootstrap();
