export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  firstname: string
  lastname: string
}

export interface LogoutRequest {
  refreshToken: string
}

export type RefreshRequest = LogoutRequest

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}
