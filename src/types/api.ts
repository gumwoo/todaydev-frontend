import type { ErrorCode } from '../constants/errors'

export type ApiSuccess<T> = {
  success: true
  data: T
  timestamp: string
}

export type ApiErrorDetail = {
  field?: string
  reason: string
}

export type ApiErrorBody = {
  code: ErrorCode
  message: string
  details: ApiErrorDetail[]
  traceId: string
}

export type ApiError = {
  success: false
  error: ApiErrorBody
  timestamp: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type PageResponse<T> = {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export type DeleteResult = {
  deleted: true
}
