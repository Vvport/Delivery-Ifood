import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { OrdersService } from '../orders/orders.service';

describe('RouteController', () => {
  let app: INestApplication;
  let controller: RouteController;
  let routeService: Partial<Record<'optimize', jest.Mock>>;
  let ordersService: Partial<Record<'getPendingOrders', jest.Mock>>;

  beforeAll(async () => {
    routeService = { optimize: jest.fn() };
    ordersService = { getPendingOrders: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [
        { provide: RouteService, useValue: routeService },
        { provide: OrdersService, useValue: ordersService },
      ],
    }).compile();

    controller = module.get<RouteController>(RouteController);
    app = module.createNestApplication();
    await app.init();
  });

  it('should return the optimized route from the service', async () => {
    const expectedRoute = {
      stops: [],
      totalDistanceMeters: 0,
      path: [],
    };

    ordersService.getPendingOrders!.mockResolvedValue([]);
    routeService.optimize!.mockResolvedValue(expectedRoute);

    const result = await controller.getOptimizedRoute();

    expect(result).toEqual(expectedRoute);
    expect(ordersService.getPendingOrders).toHaveBeenCalled();
    expect(routeService.optimize).toHaveBeenCalledWith([]);
  });

  it('should expose GET /route/optimize with the optimized route', async () => {
    const expectedRoute = {
      stops: [],
      totalDistanceMeters: 0,
      path: [],
    };

    ordersService.getPendingOrders!.mockResolvedValue([]);
    routeService.optimize!.mockResolvedValue(expectedRoute);

    await request(app.getHttpServer())
      .get('/route/optimize')
      .expect(200)
      .expect(expectedRoute);
  });

  afterAll(async () => {
    await app.close();
  });
});
