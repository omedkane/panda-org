import { createParamDecorator } from '@nestjs/common'

export const AuthState = createParamDecorator((_, context): IAuthState => {
  const { userID, accessToken } = context.switchToHttp().getRequest<IAuthState>()
  return { userID, accessToken }
})

export interface IAuthState {
  userID: string
  accessToken: string
}
