import { API_ENDPOINTS } from '../constants/api'
import type { DeleteResult, PageResponse } from '../types/api'
import type {
  SaveArticleRequest,
  SavedArticle,
  UpdateSavedArticleRequest,
} from '../types/savedArticle'
import { apiRequest } from './client'

export function saveArticle(itemId: number, request: SaveArticleRequest) {
  return apiRequest<SavedArticle>(API_ENDPOINTS.savedArticles.save(itemId), {
    method: 'POST',
    body: request,
  })
}

export function getSavedArticles(page = 0, size = 20) {
  return apiRequest<PageResponse<SavedArticle>>(
    `${API_ENDPOINTS.savedArticles.collection}?page=${page}&size=${size}`,
  )
}

export function updateSavedArticle(
  savedId: number,
  request: UpdateSavedArticleRequest,
) {
  return apiRequest<SavedArticle>(API_ENDPOINTS.savedArticles.item(savedId), {
    method: 'PATCH',
    body: request,
  })
}

export function deleteSavedArticle(savedId: number) {
  return apiRequest<DeleteResult>(API_ENDPOINTS.savedArticles.item(savedId), {
    method: 'DELETE',
  })
}
