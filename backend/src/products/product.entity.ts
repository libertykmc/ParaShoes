import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { ProductCategory } from '../categories/category.entity'

@Entity('products')
export class Product {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'Кроссовки Nike Air Max' })
  @Column()
  name: string

  @ApiProperty({ example: 'Удобные и стильные кроссовки для повседневной носки' })
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

  @ApiProperty({ example: 50 })
  @Column({ type: 'int', default: 0 })
  quantityInStock: number

  @ApiProperty({ example: true })
  @Column({ default: true })
  productStatus: boolean

  @ApiProperty()
  @Column({ name: 'category_id', nullable: true })
  categoryId?: string

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category?: ProductCategory

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date
}
