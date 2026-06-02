export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
)

export const API_ENDPOINTS = {
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
  preferences: {
    me: '/api/preferences/me',
    keywords: '/api/preferences/me/keywords',
    keyword: (keywordId: number) => `/api/preferences/me/keywords/${keywordId}`,
    repositories: '/api/preferences/me/repositories',
    repository: (repositoryId: number) =>
      `/api/preferences/me/repositories/${repositoryId}`,
  },
  briefings: {
    collection: '/api/briefings',
    detail: (briefingId: number) => `/api/briefings/${briefingId}`,
    streamToken: (briefingId: number) =>
      `/api/briefings/${briefingId}/stream-token`,
    stream: (briefingId: number, streamToken: string) =>
      `/api/briefings/${briefingId}/stream?streamToken=${encodeURIComponent(
        streamToken,
      )}`,
  },
  savedArticles: {
    collection: '/api/saved-articles',
    save: (itemId: number) => `/api/saved-articles/${itemId}`,
    item: (savedId: number) => `/api/saved-articles/${savedId}`,
  },
} as const

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}
