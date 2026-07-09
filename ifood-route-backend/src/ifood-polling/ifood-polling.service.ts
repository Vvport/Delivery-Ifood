import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { IfoodAuthService } from '../ifood-auth/ifood-auth.service';
import { OrdersService } from '../orders/orders.service';
import { SettingsService } from '../settings/settings.service';

interface IfoodEvent {
  id: string;
  orderId: string;
  code: string;
  fullCode: string;
  merchantId: string;
  createdAt: string;
}

@Injectable()
export class IfoodPollingService {
  private readonly logger = new Logger(IfoodPollingService.name);
  private readonly baseUrl = 'https://merchant-api.ifood.com.br';
  private isPolling = false;

  constructor(
    private readonly http: HttpService,
    private readonly auth: IfoodAuthService,
    private readonly settings: SettingsService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Cronjob ativado a cada 30 segundos para buscar novos eventos no iFood.
   * Utiliza um lock (isPolling) para evitar "Race Conditions" em caso de
   * lentidão da rede que faça a execução demorar mais que o intervalo do Cron.
   */
  @Cron('*/30 * * * * *')
  async pollEvents(): Promise<void> {
    if (this.isPolling) {
      this.logger.debug('Polling anterior ainda em andamento. Ignorando este ciclo.');
      return;
    }
    
    this.isPolling = true;
    try {
      const token = await this.auth.getAccessToken();
      const merchantId = (await this.settings.get('IFOOD_MERCHANT_ID')) ?? '';

      const response = await firstValueFrom(
        this.http.get<IfoodEvent[]>(
          `${this.baseUrl}/events/v1.0/events:polling`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-polling-merchants': merchantId,
            },
          },
        ),
      );

      const events = response.data ?? [];
      if (events.length === 0) return;

      this.logger.log(`Recebidos ${events.length} evento(s)`);

      for (const event of events) {
        await this.handleEvent(event);
      }

      await this.acknowledgeEvents(events.map((e) => e.id), token);
    } catch (err: any) {
      this.logger.error('Erro durante o polling de eventos', err?.message ?? err);
    } finally {
      this.isPolling = false;
    }
  }

  private async handleEvent(event: IfoodEvent): Promise<void> {
    switch (event.fullCode) {
      case 'PLACED':
        await this.ordersService.fetchAndStoreOrder(event.orderId);
        break;
      case 'CONCLUDED':
      case 'CANCELLED':
        await this.ordersService.removeOrder(event.orderId);
        break;
    }
  }

  private async acknowledgeEvents(eventIds: string[], token: string): Promise<void> {
    if (eventIds.length === 0) return;

    await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/events/v1.0/events/acknowledgment`,
        eventIds.map((id) => ({ id })),
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
  }
}
