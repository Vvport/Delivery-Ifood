import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('delivery_orders')
export class OrderEntity {
  @PrimaryColumn()
  orderId: string;

  @Column()
  displayId: string;

  @Column()
  customerName: string;

  @Column()
  addressFormatted: string;

  @Column({ nullable: true })
  addressNeighborhood: string;

  @Column({ nullable: true })
  addressCity: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;
}
