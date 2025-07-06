import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { IAuthState } from '../decorators/auth-state.decorator'
import { JWTService } from '../../auth/application/services/jwt.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JWTService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const authHeader = request.headers.authorization
    const token = authHeader?.match(/(?<=Bearer\s)[\S]*$/)?.[0]

    if (!token) return false

    const res = await this.jwtService.verify(token).catch(() => null)

    if (!res || !res.payload.sub) return false
    const state: IAuthState = { userID: res.payload.sub, accessToken: token }

    for (const key in state) request[key] = state[key]

    return true
  }
}
