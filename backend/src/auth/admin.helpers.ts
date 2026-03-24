import { ForbiddenException } from '@nestjs/common'
import { UserRole } from '../users/user.entity'

export function assertAdmin(requestUser?: { role?: string }) {
  if (requestUser?.role !== UserRole.ADMIN) {
    throw new ForbiddenException('Доступно только администратору')
  }
}
