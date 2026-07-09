import { ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiKeyGuard } from './auth/api-key.guard';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVarsDto } from './common/dto/environment-vars.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const config = app.get(ConfigService);
  app.useGlobalGuards(new ApiKeyGuard(config));

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001',
    methods: ['GET', 'DELETE'],
  });

  const envConfig = plainToInstance(EnvironmentVarsDto, process.env, {
    enableImplicitConversion: false,
    exposeDefaultValues: true,
  });

  const envErrors = validateSync(envConfig, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (envErrors.length > 0) {
    console.error('Erros de validação das variáveis de ambiente:', envErrors);
    process.exit(1);
  }

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`Servidor rodando na porta ${port}`);
}

bootstrap();
