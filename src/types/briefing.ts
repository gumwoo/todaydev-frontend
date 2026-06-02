import type { BriefingStatus, ProgressStep, Source } from '../constants/briefing'

export type BriefingMetadata = Record<
  string,
  string | number | boolean | string[] | number[] | null
>

export type BriefingCreateResponse = {
  briefingId: number
  status: Extract<BriefingStatus, 'GENERATING'>
  createdAt: string
}

export type BriefingListItem = {
  briefingId: number
  title: string
  summary: string
  status: BriefingStatus
  generatedAt: string
  itemCount: number
}

export type BriefingItem = {
  itemId: number
  source: Source
  externalId: string
  title: string
  url: string
  summary: string
  score: number
  publishedAt: string
  metadata: BriefingMetadata
  saved: boolean
}

export type BriefingSection = {
  source: Source
  status: BriefingStatus
  items: BriefingItem[]
}

export type BriefingDetail = {
  briefingId: number
  title: string
  summary: string
  status: BriefingStatus
  generatedAt: string
  sections: BriefingSection[]
}

export type StreamTokenResponse = {
  streamToken: string
  expiresIn: number
}

export type BriefingProgressEvent = {
  briefingId: number
  step: ProgressStep
  source: Source | null
  processed: number | null
  total: number | null
  message: string
}

export type BriefingDoneEvent = {
  briefingId: number
  status: Extract<BriefingStatus, 'COMPLETED'>
  message: string
}

export type BriefingPartialDoneEvent = {
  briefingId: number
  status: Extract<BriefingStatus, 'PARTIAL'>
  message: string
  failedSources: Source[]
}

export type BriefingFailedEvent = {
  briefingId: number
  status: Extract<BriefingStatus, 'FAILED'>
  message: string
}

export type BriefingTerminalEvent =
  | BriefingDoneEvent
  | BriefingPartialDoneEvent
  | BriefingFailedEvent
