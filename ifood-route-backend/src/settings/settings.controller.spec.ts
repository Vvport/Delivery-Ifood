import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
  let app: INestApplication;
  let settingsService: Partial<Record<'validateIfoodCredentials' | 'setMany', jest.Mock>>;

  beforeAll(async () => {
    settingsService = {
      validateIfoodCredentials: jest.fn(),
      setMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  it('should call validateIfoodCredentials on the service', async () => {
    const payload = {
      IFOOD_CLIENT_ID: 'client-id',
      IFOOD_CLIENT_SECRET: 'client-secret',
      IFOOD_MERCHANT_ID: 'merchant-id',
    };

    settingsService.validateIfoodCredentials!.mockResolvedValue({
      ok: true,
      message: 'Credenciais válidas.',
    });

    const result = await request(app.getHttpServer())
      .post('/settings/validate')
      .send(payload)
      .expect(201);

    expect(result.body).toEqual({ ok: true, message: 'Credenciais válidas.' });
    expect(settingsService.validateIfoodCredentials).toHaveBeenCalledWith(payload);
  });

  afterAll(async () => {
    await app.close();
  });
});
