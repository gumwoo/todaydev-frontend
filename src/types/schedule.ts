export type BriefingSchedule = {
  briefingTime: string
  timezone: string
  enabled: boolean
  updatedAt: string
}

export type UpdateBriefingScheduleRequest = {
  briefingTime: string
  timezone: string
  enabled: boolean
}
