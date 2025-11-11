import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type UserRole = 'user' | 'admin';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty({ example: 'user' })
  @Column({ type: 'varchar', default: 'user' })
  role: UserRole;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;
}
