import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ProductCategory } from '../categories/category.entity'
import { ProductMaterial } from '../material/product-material.entity'
import { ProductSeason } from '../season/product-season.entity'
import { ProductStyle } from '../style/product-style.entity'
import { ModelSizeStock } from './model-size-stock.entity'

@Entity('model')
export class Model {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'Nike Air Max' })
  @Column()
  name: string

  @ApiProperty({ example: 'Comfortable sneakers for everyday use' })
  @Column({ type: 'text', nullable: true })
  description?: string

  @ApiProperty({ example: 12999 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @ApiProperty({ example: 10 })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number

  @ApiProperty({ example: 'https://cdn.parashoes.com/nike.jpg' })
  @Column({ nullable: true })
  image?: string

  @ApiProperty({ description: 'Category id', required: false })
  @Column({ name: 'category_id', nullable: true })
  categoryId?: string

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category?: ProductCategory

  @ApiProperty({ description: 'Material id', required: false })
  @Column({ name: 'material_id', nullable: true })
  materialId?: string

  @ManyToOne(() => ProductMaterial, (material) => material.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'material_id' })
  material?: ProductMaterial

  @ApiProperty({ description: 'Style id', required: false })
  @Column({ name: 'style_id', nullable: true })
  styleId?: string

  @ManyToOne(() => ProductStyle, (style) => style.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'style_id' })
  style?: ProductStyle

  @ApiProperty({ description: 'Season id', required: false })
  @Column({ name: 'season_id', nullable: true })
  seasonId?: string

  @ManyToOne(() => ProductSeason, (season) => season.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'season_id' })
  season?: ProductSeason

  @ApiProperty({ type: () => [ModelSizeStock] })
  @OneToMany(() => ModelSizeStock, (sizeStock) => sizeStock.model, {
    cascade: true,
  })
  sizes: ModelSizeStock[]

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date
}

