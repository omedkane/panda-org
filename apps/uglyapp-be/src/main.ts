/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import fastifyCookie from '@fastify/cookie'
import { appConfig } from './app/config'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyCookie as any, { secret: appConfig.security.cookie.secret })

  const port = process.env.PORT || 3000
  await app.listen(port, process.env.ADDRESS ?? '127.0.0.1')

  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`)
}

bootstrap()
