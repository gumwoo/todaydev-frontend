import { API_BASE_URL, API_ENDPOINTS } from '../constants/api'
import { ERROR_CODE, SAFE_ERROR_MESSAGE } from '../constants/errors'
import type { ApiErrorBody, ApiResponse } from '../types/api'
import type { RefreshResponse } from '../types/auth'
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type ApiRequestOptions = {
  method?: HttpMethod
  body?: unknown
  authenticated?: boolean
  skipAuthRefresh?: boolean
  headers?: HeadersInit
}

export class ApiClientError extends Error {
  status: number
  code: ApiErrorBody['code']
  details: ApiErrorBody['details']
  traceId: string
  userMessage: string

  constructor(status: number, error: ApiErrorBody) {
    super(SAFE_ERROR_MESSAGE[error.code] ?? '요청을 처리하지 못했습니다.')
    this.name = 'ApiClientError'
    this.status = status
    this.code = error.code
    this.details = error.details
    this.traceId = error.traceId
    this.userMessage = this.message
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return requestWithRefresh<T>(path, options, false)
}

async function requestWithRefresh<T>(
  path: string,
  options: ApiRequestOptions,
  refreshed: boolean,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: createHeaders(options),
    body: serializeBody(options.body),
  })

  const payload = await parseApiResponse<T>(response)

  if (payload.success) {
    return payload.data
  }

  if (shouldRefresh(response.status, payload.error.code, options, refreshed)) {
    await refreshAccessToken()
    return requestWithRefresh<T>(path, options, true)
  }

  throw new ApiClientError(response.status, payload.error)
}

function createHeaders(options: ApiRequestOptions) {
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.authenticated !== false) {
    const token = getAccessToken()

    if (token !== null) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  return headers
}

function serializeBody(body: unknown) {
  if (body === undefined) {
    return undefined
  }

  return JSON.stringify(body)
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text()

  if (text.trim().length === 0) {
    return {
      success: true,
      data: null as T,
      timestamp: new Date().toISOString(),
    }
  }

  return JSON.parse(text) as ApiResponse<T>
}

function shouldRefresh(
  status: number,
  code: ApiErrorBody['code'],
  options: ApiRequestOptions,
  refreshed: boolean,
) {
  return (
    status === 401 &&
    !refreshed &&
    !options.skipAuthRefresh &&
    code !== ERROR_CODE.authRefreshTokenInvalid
  )
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {
    method: 'POST',
    credentials: 'include',
  })
  const payload = await parseApiResponse<RefreshResponse>(response)

  if (!payload.success) {
    clearAccessToken()
    throw new ApiClientError(response.status, payload.error)
  }

  setAccessToken(payload.data.accessToken)
  return payload.data
}

