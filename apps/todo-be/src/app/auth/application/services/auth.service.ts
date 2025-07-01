import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LoginRequest, RegisterRequest } from '@panda-org/shared-interfaces'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'
import { appConfig } from '../../../config'
import { HashMode } from '../../domain/entities/hash-mode.entity'
import { User } from '../../domain/entities/user.entity'
import { JWTService } from './jwt.service'
import crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    @InjectRepository(HashMode)
    private hashModeRepo: Repository<HashMode>,
    private jwtService: JWTService
  ) {}

  async hashPassword(p: { password: string; alg: string; rounds?: number; salt?: string }) {
    return await bcrypt.hash(p.password, p.salt ?? p.rounds ?? appConfig.security.hash.default.rounds)
  }

  async compareHashedPasswords(p1: string, p2: string) {
    return await bcrypt.compare(p1, p2)
  }

  async login(loginRequest: LoginRequest) {
    const { email, password } = loginRequest

    const user = await this.repo.findOne({
      where: { email },
      relations: ['hashMode'],
    })

    if (!user) return null

    const matchResults = await this.compareHashedPasswords(password, user.password)
    console.log('matchResults:', matchResults)

    if (!matchResults) return null

    return {
      accessToken: await this.jwtService.sign(user.id),
      refreshToken: await this.jwtService.createRefreshToken(user.id),
    }
  }

  async getDefaultHashMode() {
    return await this.hashModeRepo.findOneBy({ isDefault: true })
  }

  async register(registerRequest: RegisterRequest) {
    const { email, password, firstname, lastname } = registerRequest
    const defaultHashMode = await this.getDefaultHashMode()

    if (!defaultHashMode) throw Error('No default hash mode, please set one before running server')

    const { algo: alg, rounds, salt } = defaultHashMode
    const hashedPassword = await this.hashPassword({ alg, password, rounds, salt })

    const user = this.repo.create({
      id: crypto.randomBytes(16).toString('hex'),
      email,
      firstname,
      lastname,
      password: hashedPassword,
      hashMode: defaultHashMode,
    })

    const savedUser = await this.repo.save(user)

    if (!savedUser.id) return null

    return {
      accessToken: await this.jwtService.sign(savedUser.id),
      refreshToken: await this.jwtService.createRefreshToken(savedUser.id),
    }
  }

  async logout(refreshToken: string, userID: string) {
    const isVerified = await this.jwtService.verifyRefreshToken(refreshToken, userID)
    console.log('isVerified:', isVerified)

    if (isVerified) await this.jwtService.deleteRefreshToken(refreshToken)

    return isVerified
  }

  async refresh(refreshToken: string, userID: string) {
    const isVerified = await this.jwtService.verifyRefreshToken(refreshToken, userID)

    if (isVerified) {
      const newAccessToken = await this.jwtService.sign(userID)
      await this.jwtService.deleteRefreshToken(refreshToken)
      const newRefreshToken = await this.jwtService.createRefreshToken(userID)

      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    }
    return null
  }
}
