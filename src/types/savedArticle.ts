import type { Source } from '../constants/briefing'

export type SaveArticleRequest = {
  memo: string
}

export type UpdateSavedArticleRequest = {
  memo: string
}

export type SavedArticle = {
  savedId: number
  itemId: number
  title: string
  url: string
  source: Source
  memo: string
  savedAt: string
}
