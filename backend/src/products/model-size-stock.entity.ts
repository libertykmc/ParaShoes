import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Model } from './product.entity'

@Entity('model_size_stock')
@Index(['modelId', 'size'], { unique: true })
@Check(`"size" BETWEEN 35 AND 45`)
@Check(`"stock" >= 0`)
export class ModelSizeStock {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @Column({ name: 'model_id', type: 'uuid' })
  modelId: string

  @ManyToOne(() => Model, (model) => model.sizes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id' })
  model: Model

  @ApiProperty({ example: 42 })
  @Column({ type: 'int' })
  size: number

  @ApiProperty({ example: 3 })
  @Column({ type: 'int', default: 0 })
  stock: number
}

