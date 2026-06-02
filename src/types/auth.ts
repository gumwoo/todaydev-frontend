export type User = {
  userId: number
  email: string
}

export type SignupRequest = {
  email: string
  password: string
}

export type SignupResponse = User

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: User
}

export type RefreshResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export type LogoutResponse = {
  loggedOut: true
}
