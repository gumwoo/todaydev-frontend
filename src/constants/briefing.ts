export const BRIEFING_STATUS = {
  generating: 'GENERATING',
  completed: 'COMPLETED',
  partial: 'PARTIAL',
  summaryFailed: 'SUMMARY_FAILED',
  failed: 'FAILED',
} as const

export type BriefingStatus =
  (typeof BRIEFING_STATUS)[keyof typeof BRIEFING_STATUS]

export const SOURCE = {
  github: 'GITHUB',
  hackerNews: 'HACKER_NEWS',
  devto: 'DEVTO',
  ai: 'AI',
} as const

export type Source = (typeof SOURCE)[keyof typeof SOURCE]

export const PROGRESS_STEP = {
  briefingRequested: 'BRIEFING_REQUESTED',
  githubCollecting: 'GITHUB_COLLECTING',
  githubCollected: 'GITHUB_COLLECTED',
  hackerNewsCollecting: 'HACKER_NEWS_COLLECTING',
  hackerNewsCollected: 'HACKER_NEWS_COLLECTED',
  devtoCollecting: 'DEVTO_COLLECTING',
  devtoCollected: 'DEVTO_COLLECTED',
  filtering: 'FILTERING',
  scoring: 'SCORING',
  aiSummarizing: 'AI_SUMMARIZING',
  saving: 'SAVING',
  done: 'DONE',
  partialDone: 'PARTIAL_DONE',
  failed: 'FAILED',
} as const

export type ProgressStep = (typeof PROGRESS_STEP)[keyof typeof PROGRESS_STEP]

export const SSE_EVENT = {
  progress: 'BRIEFING_PROGRESS',
  done: 'BRIEFING_DONE',
  partialDone: 'BRIEFING_PARTIAL_DONE',
  failed: 'BRIEFING_FAILED',
} as const

export type SseEventName = (typeof SSE_EVENT)[keyof typeof SSE_EVENT]
