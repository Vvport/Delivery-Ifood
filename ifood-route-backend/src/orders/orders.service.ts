import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { IfoodAuthService } from '../ifood-auth/ifood-auth.service';
import { OrderEntity } from './order.entity';

export interface DeliveryOrder {
  orderId: string;
  displayId: string;
  customerName: string;
  address: {
    formatted: string;
    neighborhood?: string;
    city?: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly baseUrl = 'https://merchant-api.ifood.com.br';

  constructor(
    private readonly http: HttpService,
    private readonly auth: IfoodAuthService,
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
  ) {}

  async fetchAndStoreOrder(orderId: string): Promise<void> {
    try {
      const token = await this.auth.getAccessToken();

      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/order/v1.0/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      const data = response.data;
      const deliveryAddress = data?.delivery?.deliveryAddress;

      if (!deliveryAddress?.coordinates) {
        this.logger.warn(
          `Pedido ${orderId} não possui coordenadas de entrega, ignorando`,
        );
        return;
      }

      await this.repo.save({
        orderId: data.id,
        displayId: data.displayId,
        customerName: data.customer?.name ?? 'Cliente',
        addressFormatted:
          deliveryAddress.formattedAddress ??
          `${deliveryAddress.streetName}, ${deliveryAddress.streetNumber}`,
        addressNeighborhood: deliveryAddress.neighborhood ?? null,
        addressCity: deliveryAddress.city ?? null,
        latitude: deliveryAddress.coordinates.latitude,
        longitude: deliveryAddress.coordinates.longitude,
      });

      const total = await this.repo.count();
      this.logger.log(
        `Pedido ${data.displayId} salvo no banco (${total} pendentes)`,
      );
    } catch (err: any) {
      this.logger.error(
        `Erro ao buscar detalhes do pedido ${orderId}`,
        err?.message ?? err,
      );
    }
  }

  async getPendingOrders(): Promise<DeliveryOrder[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((row) => ({
      orderId: row.orderId,
      displayId: row.displayId,
      customerName: row.customerName,
      address: {
        formatted: row.addressFormatted,
        neighborhood: row.addressNeighborhood ?? undefined,
        city: row.addressCity ?? undefined,
      },
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async removeOrder(orderId: string): Promise<void> {
    await this.repo.delete(orderId);
  }
}
