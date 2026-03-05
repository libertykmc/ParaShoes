import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Model } from '../products/product.entity'
import { Order } from './order.entity'

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 2 })
  @Column({ type: 'int' })
  quantity: number

  @ApiProperty({ example: 12999.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @ApiProperty()
  @Column({ name: 'order_id' })
  orderId: string

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order

  @ApiProperty()
  @Column({ name: 'model_id' })
  modelId: string

  @ManyToOne(() => Model)
  @JoinColumn({ name: 'model_id' })
  model: Model

  @ApiProperty({ example: 42 })
  @Column({ type: 'int' })
  size: number
}

