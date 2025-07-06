import { Inject, Injectable } from '@nestjs/common'
import crypto, { KeyObject } from 'crypto'
import { readFileSync } from 'fs'
import { jwtVerify, SignJWT } from 'jose'
import { RedisClientType } from 'redis'
import { appConfig } from '../../../config'

@Injectable()
export class JWTService {
  private privateKey: KeyObject
  private publicKey: KeyObject

  constructor(@Inject('REDIS_CONNECTION') private db: RedisClientType) {
    const keys = appConfig.security.jwt.keys
    const privateKeyPEM = readFileSync(keys.private, { encoding: 'utf8' })
    const publicKeyPEM = readFileSync(keys.public, { encoding: 'utf8' })

    this.privateKey = crypto.createPrivateKey(privateKeyPEM)
    this.publicKey = crypto.createPublicKey(publicKeyPEM)
  }

  async sign(userID: string) {
    const jwt = new SignJWT({
      sub: userID,
      aud: 'uglyapp-fe',
      iss: 'uglyapp-be',
    })
      .setProtectedHeader({ alg: appConfig.security.jwt.alg })
      .setExpirationTime(appConfig.security.jwt.expiration)
      .setIssuedAt(Date.now())

    return await jwt.sign(this.privateKey)
  }

  async verify(token: string) {
    return await jwtVerify(token, this.publicKey)
  }

  async createRefreshToken(userID: string) {
    const expOptions = { EX: appConfig.security.refreshToken.exp }
    const refreshToken = crypto.randomBytes(16).toString('hex')

    await this.db.set(`refresh:${refreshToken}`, userID, expOptions)

    return refreshToken
  }

  async verifyRefreshToken(refreshToken: string, userID: string) {
    return userID === (await this.db.get(`refresh:${refreshToken}`))
  }

  async deleteRefreshToken(refreshToken: string) {
    return await this.db.del(`refresh:${refreshToken}`)
  }
}
