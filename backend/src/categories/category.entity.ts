import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Product } from '../products/product.entity'

export enum MaterialType {
  NATURAL_LEATHER = 'Натуральная кожа',
  ARTIFICIAL_LEATHER = 'Искусственная кожа',
  SUEDE = 'Замша',
  NUBUCK = 'Нубук',
}

export enum Style {
  CLASSIC = 'Классика',
  SPORT = 'Спорт',
}

@Entity('product_categories')
export class ProductCategory {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: MaterialType.NATURAL_LEATHER, enum: MaterialType })
  @Column({ type: 'varchar' })
  material: MaterialType

  @ApiProperty({ example: 42 })
  @Column({ type: 'int' })
  size: number

  @ApiProperty({ example: 'Лето' })
  @Column({ type: 'varchar' })
  season: string

  @ApiProperty({ example: Style.CLASSIC, enum: Style })
  @Column({ type: 'varchar' })
  style: Style

  @OneToMany(() => Product, (product) => product.category)
  products: Product[]
}

