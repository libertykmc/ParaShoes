import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../users/user.entity'
import { Product } from '../products/product.entity'

@Entity('cart')
export class Cart {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty()
  @Column({ name: 'user_id' })
  userId: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ApiProperty()
  @Column({ name: 'product_id' })
  productId: string

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product

  @ApiProperty({ example: 2 })
  @Column({ type: 'int', default: 1 })
  quantity: number
}

