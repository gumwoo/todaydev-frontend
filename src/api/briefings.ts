import { API_ENDPOINTS } from '../constants/api'
import type { PageResponse } from '../types/api'
import type {
  BriefingCreateResponse,
  BriefingDetail,
  BriefingListItem,
  StreamTokenResponse,
} from '../types/briefing'
import { apiRequest } from './client'

export function createBriefing() {
  return apiRequest<BriefingCreateResponse>(API_ENDPOINTS.briefings.collection, {
    method: 'POST',
  })
}

export function getBriefings(page = 0, size = 20) {
  return apiRequest<PageResponse<BriefingListItem>>(
    `${API_ENDPOINTS.briefings.collection}?page=${page}&size=${size}`,
  )
}

export function getBriefing(briefingId: number) {
  return apiRequest<BriefingDetail>(API_ENDPOINTS.briefings.detail(briefingId))
}

export function createBriefingStreamToken(briefingId: number) {
  return apiRequest<StreamTokenResponse>(
    API_ENDPOINTS.briefings.streamToken(briefingId),
    {
      method: 'POST',
    },
  )
}
