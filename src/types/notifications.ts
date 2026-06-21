export type NotificationChannel = 'EMAIL' | 'SLACK' | 'DISCORD'

export type NotificationDeliveryStatus =
  | 'PENDING'
  | 'PUBLISHED'
  | 'SENDING'
  | 'SENT'
  | 'RETRYING'
  | 'FAILED'
  | 'DLQ'
  | 'SKIPPED'

export type NotificationPreference = {
  channel: NotificationChannel
  enabled: boolean
  configured: boolean
  updatedAt: string
}

export type UpdateNotificationPreferenceRequest = {
  destination: string
  enabled: boolean
}

export type TestNotificationRequest = {
  channel: NotificationChannel
}

export type NotificationDelivery = {
  deliveryId: number
  briefingId: number
  channel: NotificationChannel
  status: NotificationDeliveryStatus
  attemptCount: number
  queuedAt: string | null
  sentAt: string | null
  updatedAt: string
}
