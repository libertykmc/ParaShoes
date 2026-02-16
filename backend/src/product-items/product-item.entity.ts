import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Model } from '../products/product.entity'

@Entity('product')
export class ProductItem {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @Column({ name: 'model_id' })
  modelId: string

  @ManyToOne(() => Model, (model) => model.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model: Model

  @ApiProperty({ example: 42 })
  @Column({ type: 'int' })
  size: number

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date
}
