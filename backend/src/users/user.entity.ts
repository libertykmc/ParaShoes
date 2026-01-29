import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Order } from '../orders/order.entity'
import { Cart } from '../cart/cart.entity'
import { Favorite } from '../favorites/favorite.entity'

export enum UserRole {
  ADMIN = 'Администратор',
  USER = 'Пользователь',
}

@Entity('users')
export class User {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'john_doe' })
  @Column({ unique: true })
  username: string

  @ApiProperty({ example: 'Иван' })
  @Column({ nullable: true })
  firstName?: string

  @ApiProperty({ example: 'Иванов' })
  @Column({ nullable: true })
  lastName?: string

  @ApiProperty({ example: 'user@example.com' })
  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @ApiProperty({ example: '+7 (999) 123-45-67' })
  @Column({ nullable: true })
  phone?: string

  @ApiProperty({ example: 'г. Москва, ул. Ленина, д. 10, кв. 5' })
  @Column({ nullable: true })
  address?: string

  @ApiProperty({ example: UserRole.USER, enum: UserRole })
  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole

  @ApiProperty({ example: 0 })
  @Column({ type: 'int', default: 0 })
  bonusPoints: number

  @ApiProperty({ example: 'https://cdn.parashoes.com/avatar.png', required: false })
  @Column({ nullable: true })
  avatar?: string

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[]

  @OneToMany(() => Cart, (cart) => cart.user)
  cartItems: Cart[]

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[]
}
