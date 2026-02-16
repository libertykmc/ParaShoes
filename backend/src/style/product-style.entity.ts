import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Model } from '../products/product.entity'

@Entity('product_style')
export class ProductStyle {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'Классика' })
  @Column({ type: 'varchar', unique: true })
  name: string

  @OneToMany(() => Model, (model) => model.style)
  products: Model[]
}
