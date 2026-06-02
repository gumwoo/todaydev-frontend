export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  preferences: {
    me: ['preferences', 'me'] as const,
  },
  briefings: {
    collection: (page: number, size: number) =>
      ['briefings', page, size] as const,
    detail: (briefingId: number) => ['briefings', briefingId] as const,
  },
  savedArticles: {
    collection: (page: number, size: number) =>
      ['savedArticles', page, size] as const,
  },
} as const
