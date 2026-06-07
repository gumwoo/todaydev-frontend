import { API_ENDPOINTS } from '../constants/api'
import type {
  BriefingSchedule,
  UpdateBriefingScheduleRequest,
} from '../types/schedule'
import { apiRequest } from './client'

export function getBriefingSchedule() {
  return apiRequest<BriefingSchedule>(API_ENDPOINTS.schedule.briefing)
}

export function updateBriefingSchedule(request: UpdateBriefingScheduleRequest) {
  return apiRequest<BriefingSchedule>(API_ENDPOINTS.schedule.briefing, {
    method: 'PUT',
    body: request,
  })
}
