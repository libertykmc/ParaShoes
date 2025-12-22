import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Order } from './order.entity'
import { Product } from '../products/product.entity'

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
  @Column({ name: 'product_id' })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product
}

