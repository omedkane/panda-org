import { BadRequestException, createParamDecorator } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { decodeJwt, JWTPayload } from 'jose'

export const TokenPayload = createParamDecorator((_, context): JWTPayload => {
  const request = context.switchToHttp().getRequest<FastifyRequest>()
  const accessToken = request.headers.authorization?.match(/(?<=Bearer\s)[\S]*$/)?.[0]
  if (!accessToken) throw new BadRequestException()
  try {
    const payload = decodeJwt(accessToken)
    return payload
  } catch (err) {
    console.log('err:', err)
    throw new BadRequestException()
  }
})


