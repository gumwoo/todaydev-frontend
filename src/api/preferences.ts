import { API_ENDPOINTS } from '../constants/api'
import type { DeleteResult } from '../types/api'
import type {
  CreateKeywordRequest,
  CreateRepositoryRequest,
  PreferenceKeyword,
  PreferenceRepository,
  PreferencesResponse,
} from '../types/preferences'
import { apiRequest } from './client'

export function getPreferences() {
  return apiRequest<PreferencesResponse>(API_ENDPOINTS.preferences.me)
}

export function createKeyword(request: CreateKeywordRequest) {
  return apiRequest<PreferenceKeyword>(API_ENDPOINTS.preferences.keywords, {
    method: 'POST',
    body: request,
  })
}

export function deleteKeyword(keywordId: number) {
  return apiRequest<DeleteResult>(API_ENDPOINTS.preferences.keyword(keywordId), {
    method: 'DELETE',
  })
}

export function createRepository(request: CreateRepositoryRequest) {
  return apiRequest<PreferenceRepository>(
    API_ENDPOINTS.preferences.repositories,
    {
      method: 'POST',
      body: request,
    },
  )
}

export function deleteRepository(repositoryId: number) {
  return apiRequest<DeleteResult>(
    API_ENDPOINTS.preferences.repository(repositoryId),
    {
      method: 'DELETE',
    },
  )
}
