import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

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

  @ApiProperty({ example: 'https://cdn.parashoes.com/nike.jpg' })
  @Column({ nullable: true })
  image?: string

  @ApiProperty({ example: 'sneakers' })
  @Column({ nullable: true })
  category?: string

  @ApiProperty({ example: false })
  @Column({ default: false })
  isPromo: boolean

  @ApiProperty({ example: true })
  @Column({ default: false })
  isSeasonal: boolean

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date
}
