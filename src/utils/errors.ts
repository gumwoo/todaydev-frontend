import { ApiClientError } from '../api/client'
import { SAFE_ERROR_MESSAGE, type ErrorCode } from '../constants/errors'

const DEFAULT_ERROR_MESSAGE =
  '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'

export function getSafeErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.userMessage
  }

  return DEFAULT_ERROR_MESSAGE
}

export function getSafeErrorMessageByCode(code: ErrorCode) {
  return SAFE_ERROR_MESSAGE[code] ?? DEFAULT_ERROR_MESSAGE
}
