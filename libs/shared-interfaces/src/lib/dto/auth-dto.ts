import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class LoginRequest {
  @IsEmail(undefined, { message: 'Please enter a valid email' })
  email!: string
  @MinLength(8)
  password!: string
}

export class RegisterRequest extends LoginRequest {
  @IsNotEmpty()
  firstname!: string
  @IsNotEmpty()
  lastname!: string
}

export interface LogoutRequest {
  refreshToken: string
}

export type RefreshRequest = LogoutRequest

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}
