import { Body, Controller, Get, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  @Put()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async setMany(@Body() body: UpdateSettingsDto) {
    await this.settingsService.setMany(body as Record<string, string>);

    const cep = body.STORE_CEP;
    const number = body.STORE_NUMBER;

    if (cep && number) {
      const coords = await this.settingsService.geocodeFromCep(cep, number);
      if (coords) {
        await this.settingsService.saveCoordinates(coords.latitude, coords.longitude);
        return { ok: true, geocoded: true, address: coords.address, latitude: coords.latitude, longitude: coords.longitude };
      }
      return { ok: true, geocoded: false, geocodeWarning: 'CEP ou número não encontrado. Verifique e salve novamente.' };
    }

    return { ok: true };
  }
}
