import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}


  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } })
  }


async findById(id: string) {
  try {
    const user = await this.usersRepo.findOneBy({ id })
    if (!user) throw new NotFoundException(`Пользователь с id ${id} не найден`)
    return user
  } catch (e) {
    console.error('Ошибка при поиске пользователя:', e)
    throw e
  }
}


  async create(user: Partial<User>) {
    const newUser = this.usersRepo.create(user)
    return this.usersRepo.save(newUser)
  }


  async update(id: string, data: Partial<User>) {
    await this.usersRepo.update(id, data)
    return this.findById(id)
  }
}
