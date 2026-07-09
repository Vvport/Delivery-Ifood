import { validate } from 'class-validator';
import { UpdateSettingsDto } from './update-settings.dto';

describe('UpdateSettingsDto', () => {
  it('should validate a correct payload', async () => {
    const dto = new UpdateSettingsDto();
    dto.IFOOD_CLIENT_ID = 'client-id';
    dto.IFOOD_CLIENT_SECRET = 'secret';
    dto.IFOOD_MERCHANT_ID = 'merchant-id';
    dto.STORE_CEP = '12345-678';
    dto.STORE_NUMBER = '100';
    dto.OSRM_URL = 'https://router.project-osrm.org';
    dto.MOTOBOY_RATE_PER_KM = '2.50';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid motoboy rate formats', async () => {
    const dto = new UpdateSettingsDto();
    dto.MOTOBOY_RATE_PER_KM = 'abc';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('MOTOBOY_RATE_PER_KM');
  });
});
