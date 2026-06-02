export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  preferences: '/preferences',
  briefingNew: '/briefings/new',
  briefingLoading: (briefingId: number) => `/briefings/${briefingId}/loading`,
  briefingDetail: (briefingId: number) => `/briefings/${briefingId}`,
  briefingHistory: '/briefings',
  savedArticles: '/saved-articles',
} as const
