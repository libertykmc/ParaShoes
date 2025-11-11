import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(user: Partial<User>) {
    const newUser = this.usersRepo.create(user);
    return this.usersRepo.save(newUser);
  }

  async update(id: number, data: Partial<User>) {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }
}
