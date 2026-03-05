import { ApiProperty } from '@nestjs/swagger'
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Model } from '../products/product.entity'
import { User } from '../users/user.entity'

@Entity('cart')
@Index(['userId', 'modelId', 'size'], { unique: true })
@Check(`"size" BETWEEN 35 AND 45`)
@Check(`"quantity" > 0`)
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
  @Column({ name: 'model_id' })
  modelId: string

  @ManyToOne(() => Model, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model: Model

  @ApiProperty({ example: 42 })
  @Column({ type: 'int' })
  size: number

  @ApiProperty({ example: 2 })
  @Column({ type: 'int', default: 1 })
  quantity: number
}

