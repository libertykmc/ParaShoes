import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UpdateProfileDto } from './dto/update-profile.dto'
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

  findByUsername(username: string) {
    return this.usersRepo.findOne({ where: { username } })
  }

  async findById(id: string) {
    try {
      const user = await this.usersRepo.findOneBy({ id })
      if (!user) {
        throw new NotFoundException(`Пользователь с id ${id} не найден`)
      }

      return user
    } catch (error) {
      console.error('Ошибка при поиске пользователя:', error)
      throw error
    }
  }

  async create(user: Partial<User>) {
    const newUser = this.usersRepo.create(user)
    return this.usersRepo.save(newUser)
  }

  async updateProfile(id: string, data: UpdateProfileDto) {
    const updateData: Partial<User> = {}

    if (data.fullName !== undefined) {
      const fullName = data.fullName.trim()
      const nameParts = fullName ? fullName.split(/\s+/) : []
      updateData.firstName = nameParts[0] || ''
      updateData.lastName = nameParts.slice(1).join(' ')
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone.trim()
    }

    if (data.address !== undefined) {
      updateData.address = data.address.trim()
    }

    return this.update(id, updateData)
  }

  async update(id: string, data: Partial<User>) {
    await this.usersRepo.update(id, data)
    return this.findById(id)
  }
}
