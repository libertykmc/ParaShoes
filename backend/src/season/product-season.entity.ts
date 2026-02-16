import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Model } from '../products/product.entity'

@Entity('product_season')
export class ProductSeason {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'Лето' })
  @Column({ type: 'varchar', unique: true })
  name: string

  @OneToMany(() => Model, (model) => model.season)
  products: Model[]
}
