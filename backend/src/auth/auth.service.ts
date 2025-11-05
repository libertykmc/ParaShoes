import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UsersService } from '../users/users.service'
  import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.usersService.findByEmail(email)
    if (exists) {
      throw new BadRequestException('Пользователь с таким email уже существует')
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await this.usersService.create({
      email,
      password: hash,
      role: 'user',
    })

    return this.buildToken(user)
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new UnauthorizedException('Неверный логин или пароль')
    }

    return this.buildToken(user)
  }

  private buildToken(user: { id: number; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
