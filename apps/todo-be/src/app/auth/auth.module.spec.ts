import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthResponse, LogoutRequest, RegisterRequest } from '@panda-org/interfaces'
import request, { Response } from 'supertest'
import { DataSource, Repository } from 'typeorm'
import { AuthModule } from './auth.module'
import { HashMode } from './domain/entities/hash-mode.entity'
import { User } from './domain/entities/user.entity'
import { RedisClientType } from 'redis'
import { wait } from '@panda-org/helpers'

describe('AuthController', () => {
  let app: NestFastifyApplication
  let conn: DataSource
  let redis: RedisClientType
  let hashModeRepo: Repository<HashMode>

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [User, HashMode],
          dropSchema: true,
        }),
      ],
    }).compile()
    app = moduleRef.createNestApplication()
    await app.init()

    conn = app.get(DataSource)
    redis = app.get('REDIS_CONNECTION')
    hashModeRepo = conn.getRepository(HashMode)
    await hashModeRepo.save({ id: 1, algo: 'bcrypt', rounds: 10, isDefault: true })
  })

  describe('Auth', () => {
    const body: RegisterRequest = {
      email: 'omedkane4@gmail.com',
      firstname: 'Oumar',
      lastname: 'Kane',
      password: 'megaman',
    }

    let accessToken: string
    let refreshToken: string
    const getServer = () => request(app.getHttpServer())
    const testAuthResponse = (res: Response) => {
      const body: AuthResponse = res.body
      expect(body.accessToken).toBeTruthy()
      expect(body.refreshToken).toBeTruthy()
      accessToken = body.accessToken
      refreshToken = body.refreshToken
    }

    const verifyTokenStored = async () => {
      const token = await redis.get(`refresh:${refreshToken}`)
      expect(typeof token).toBe('string')
    }
    it('/POST register', () => {
      return getServer().post('/auth/register').send(body).expect(201).expect(testAuthResponse)
    })
    it('saves the refresh token after registers', verifyTokenStored)
    it('/POST login', () => {
      return getServer().post('/auth/login').send(body).expect(201).expect(testAuthResponse)
    })

    it('saves the refresh token after login', verifyTokenStored)
    it('/POST refresh - it rejects when token not expired', async () => {
      const body: LogoutRequest = { refreshToken }
      return getServer().post('/auth/refresh').auth(accessToken, { type: 'bearer' }).send(body).expect(400)
    })
    it('/POST refresh - it accepts when token expired', async () => {
      const body: LogoutRequest = { refreshToken }
      await wait(1200)
      return getServer()
        .post('/auth/refresh')
        .auth(accessToken, { type: 'bearer' })
        .send(body)
        .expect(201)
        .expect(testAuthResponse)
    })
    it('/POST logout', () => {
      const logoutRequest: LogoutRequest = { refreshToken }
      return getServer()
        .post('/auth/logout')
        .auth(accessToken, { type: 'bearer' })
        .send(logoutRequest)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toMatchObject({ success: true })
        })
    })
    it('deletes token after logout', async () => {
      const res = await redis.get(`refresh:${refreshToken}`)
      expect(res).toBeNull()
    })
  })
})
