import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { UserRole } from '../users/user.entity'
import { AuthService } from './auth.service'

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

describe('AuthService', () => {
  let service: AuthService
  let usersService: Pick<
    UsersService,
    'findByEmail' | 'findByUsername' | 'create'
  >
  let jwtService: Pick<JwtService, 'sign'>
  let bcryptMock: jest.Mocked<typeof bcrypt>

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
    }
    jwtService = {
      sign: jest.fn(),
    }
    bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>

    service = new AuthService(usersService as UsersService, jwtService as JwtService)
  })

  it('rejects registration when email is already taken', async () => {
    ;(usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 'user-1' })

    await expect(
      service.register('runner', 'Ivan', 'Ivanov', 'mail@example.com', 'secret'),
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(usersService.findByUsername).not.toHaveBeenCalled()
  })

  it('registers a new user and returns a signed access token', async () => {
    ;(usersService.findByEmail as jest.Mock).mockResolvedValue(null)
    ;(usersService.findByUsername as jest.Mock).mockResolvedValue(null)
    bcryptMock.hash.mockResolvedValue('hashed-password' as never)
    ;(usersService.create as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'mail@example.com',
      role: UserRole.USER,
    })
    ;(jwtService.sign as jest.Mock).mockReturnValue('jwt-token')

    const result = await service.register(
      'runner',
      'Ivan',
      'Ivanov',
      'mail@example.com',
      'secret',
    )

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'runner',
        firstName: 'Ivan',
        lastName: 'Ivanov',
        email: 'mail@example.com',
        password: 'hashed-password',
        role: UserRole.USER,
        bonusPoints: 0,
      }),
    )
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'mail@example.com',
      role: UserRole.USER,
    })
    expect(result).toEqual({ access_token: 'jwt-token' })
  })

  it('rejects login when password does not match', async () => {
    ;(usersService.findByEmail as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'mail@example.com',
      password: 'hashed-password',
      role: UserRole.USER,
    })
    bcryptMock.compare.mockResolvedValue(false as never)

    await expect(service.login('mail@example.com', 'wrong-password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })
})
