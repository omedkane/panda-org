import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { HashMode } from './auth/domain/entities/hash-mode.entity'
import { User } from './auth/domain/entities/user.entity'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST ?? 'localhost',
      port: 3306,
      username: 'root',
      database: 'uglyapp',
      synchronize: true,
      entities: [User, HashMode],
    }),
  ],
})
export class AppModule {}
