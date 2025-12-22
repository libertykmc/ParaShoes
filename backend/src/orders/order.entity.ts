import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../users/user.entity'
import { OrderItem } from './order-item.entity'

export enum OrderStatus {
  ACCEPTED = 'Принят',
  PREPARING = 'Готовится',
  DELIVERING = 'Доставляется',
  COMPLETED = 'Выполнен',
  CANCELLED = 'Отменен',
}

@Entity('orders')
export class Order {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn()
  orderDate: Date

  @ApiProperty({ example: OrderStatus.ACCEPTED, enum: OrderStatus })
  @Column({ type: 'varchar', default: OrderStatus.ACCEPTED })
  status: OrderStatus

  @ApiProperty({ example: 'г. Москва, ул. Ленина, д. 10, кв. 5' })
  @Column({ type: 'varchar' })
  deliveryAddress: string

  @ApiProperty({ example: 25999.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number

  @ApiProperty()
  @Column({ name: 'user_id' })
  userId: string

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[]
}

