import { API_ENDPOINTS } from '../constants/api'
import type { DeleteResult, PageResponse } from '../types/api'
import type {
  NotificationChannel,
  NotificationDelivery,
  NotificationPreference,
  TestNotificationRequest,
  UpdateNotificationPreferenceRequest,
} from '../types/notifications'
import { apiRequest } from './client'

export function getNotificationPreferences() {
  return apiRequest<NotificationPreference[]>(
    API_ENDPOINTS.notifications.preferences,
  )
}

export function updateNotificationPreference(
  channel: NotificationChannel,
  request: UpdateNotificationPreferenceRequest,
) {
  return apiRequest<NotificationPreference>(
    API_ENDPOINTS.notifications.preference(channel),
    {
      method: 'PUT',
      body: request,
    },
  )
}

export function deleteNotificationPreference(channel: NotificationChannel) {
  return apiRequest<DeleteResult>(
    API_ENDPOINTS.notifications.preference(channel),
    {
      method: 'DELETE',
    },
  )
}

export function getNotificationDeliveries(page = 0, size = 20) {
  return apiRequest<PageResponse<NotificationDelivery>>(
    `${API_ENDPOINTS.notifications.deliveries}?page=${page}&size=${size}`,
  )
}

export function sendTestNotification(request: TestNotificationRequest) {
  return apiRequest<NotificationPreference>(API_ENDPOINTS.notifications.test, {
    method: 'POST',
    body: request,
  })
}
