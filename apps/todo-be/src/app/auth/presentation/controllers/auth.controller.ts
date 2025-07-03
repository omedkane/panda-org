import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthResponse, LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest } from '@panda-org/interfaces'
import { JWTPayload } from 'jose'
import { AuthState, IAuthState } from '../../../shared/decorators/auth-state.decorator'
import { TokenPayload } from '../../../shared/decorators/token.decorator'
import { AuthGuard } from '../../../shared/guards/auth.guard'
import { AuthService } from '../../application/services/auth.service'

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('login')
  async login(@Body() loginRequest: LoginRequest): Promise<AuthResponse> {
    const tokens = await this.service.login(loginRequest)

    if (!tokens) throw new UnauthorizedException('Wrong credentials')

    return tokens
  }

  @Post('register')
  async register(@Body() request: RegisterRequest): Promise<AuthResponse> {
    const userExists = await this.service.userExists(request.email)
    if (userExists) throw new ForbiddenException('User already exists')
    const tokens = await this.service.register(request)

    if (!tokens) throw new InternalServerErrorException()

    return tokens
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@AuthState() authState: IAuthState, @Body() logoutRequest: LogoutRequest) {
    const success = await this.service.logout(logoutRequest.refreshToken, authState.userID)
    if (!success) throw new BadRequestException()

    return { success: true }
  }

  @Post('refresh')
  async refresh(@Body() refreshRequest: RefreshRequest, @TokenPayload() token: JWTPayload): Promise<AuthResponse> {
    if (!token.sub) throw new BadRequestException('Token not associated with user')
    const expirationMs = (token.exp ?? 0) * 1000

    if (expirationMs > Date.now()) throw new BadRequestException('Token has not expired yet')

    const tokens = await this.service.refresh(refreshRequest.refreshToken, token.sub)

    if (!tokens) throw new ForbiddenException()

    return tokens
  }
}
