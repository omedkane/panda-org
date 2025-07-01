import { Module } from '@nestjs/common'
import { AuthService } from './application/services/auth.service'
import { AuthController } from './presentation/controllers/auth.controller'
import { JWTService } from './application/services/jwt.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './domain/entities/user.entity'
import { HashMode } from './domain/entities/hash-mode.entity'
import { createClient } from 'redis'

@Module({
  imports: [TypeOrmModule.forFeature([User, HashMode])],
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTService,
    {
      provide: 'REDIS_CONNECTION',
      useFactory: async () => {
        return await createClient()
          .on('error', (err) => console.log('err:', err))
          .connect()
      },
    },
  ],
})
export class AuthModule {}
