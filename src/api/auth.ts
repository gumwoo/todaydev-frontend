import { API_ENDPOINTS } from '../constants/api'
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  SignupRequest,
  SignupResponse,
} from '../types/auth'
import { apiRequest } from './client'
import { clearAccessToken, setAccessToken } from './tokenStore'

export async function signup(request: SignupRequest) {
  return apiRequest<SignupResponse>(API_ENDPOINTS.auth.signup, {
    method: 'POST',
    body: request,
    authenticated: false,
  })
}

export async function login(request: LoginRequest) {
  const response = await apiRequest<LoginResponse>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: request,
    authenticated: false,
    skipAuthRefresh: true,
  })

  setAccessToken(response.accessToken)
  return response
}

export async function refreshSession() {
  const response = await apiRequest<RefreshResponse>(API_ENDPOINTS.auth.refresh, {
    method: 'POST',
    authenticated: false,
    skipAuthRefresh: true,
  })

  setAccessToken(response.accessToken)
  return response
}

export async function logout() {
  try {
    return await apiRequest<LogoutResponse>(API_ENDPOINTS.auth.logout, {
      method: 'POST',
    })
  } finally {
    clearAccessToken()
  }
}
