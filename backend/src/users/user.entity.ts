import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

export type UserRole = 'user' | 'admin'

@Entity('users')
export class User {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 'user@example.com' })
  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @ApiProperty({ example: 'user' })
  @Column({ type: 'varchar', default: 'user' })
  role: UserRole

  @ApiProperty({ example: 'https://cdn.parashoes.com/avatar.png', required: false })
  @Column({ nullable: true })
  avatar?: string
}
