import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteSavedArticle,
  getSavedArticles,
  updateSavedArticle,
} from '../api/savedArticles'
import { SOURCE, type Source } from '../constants/briefing'
import { ROUTES } from '../constants/routes'
import type { PageResponse } from '../types/api'
import type { SavedArticle } from '../types/savedArticle'
import { getSafeErrorMessage } from '../utils/errors'
import { INPUT_LIMITS, isValidMemo } from '../utils/validation'

const PAGE_SIZE = 20

export function SavedArticlesPage() {
  const [page, setPage] = useState(0)
  const [savedPage, setSavedPage] =
    useState<PageResponse<SavedArticle> | null>(null)
  const [loadingPage, setLoadingPage] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [editingSavedId, setEditingSavedId] = useState<number | null>(null)
  const [memoInput, setMemoInput] = useState('')
  const [busySavedId, setBusySavedId] = useState<number | null>(null)

  useEffect(() => {
    let active = true

    getSavedArticles(page, PAGE_SIZE)
      .then((response) => {
        if (!active) {
          return
        }

        setSavedPage(response)
        setErrorMessage('')
      })
      .catch((error) => {
        if (!active) {
          return
        }

        setErrorMessage(getSafeErrorMessage(error))
      })
      .finally(() => {
        if (!active) {
          return
        }

        setLoadingPage(page)
      })

    return () => {
      active = false
    }
  }, [page])

  const items = savedPage?.items ?? []
  const loading = savedPage === null || loadingPage !== page
  const totalLabel = useMemo(() => {
    const total = savedPage?.totalElements ?? 0
    return `${total}개 저장됨`
  }, [savedPage?.totalElements])

  function startEdit(article: SavedArticle) {
    setEditingSavedId(article.savedId)
    setMemoInput(article.memo)
    setErrorMessage('')
  }

  function cancelEdit() {
    setEditingSavedId(null)
    setMemoInput('')
  }

  async function handleMemoSubmit(
    event: FormEvent<HTMLFormElement>,
    article: SavedArticle,
  ) {
    event.preventDefault()
    setErrorMessage('')

    if (!isValidMemo(memoInput)) {
      setErrorMessage('메모는 1000자 이하로 입력해 주세요.')
      return
    }

    setBusySavedId(article.savedId)

    try {
      const updated = await updateSavedArticle(article.savedId, {
        memo: memoInput,
      })
      setSavedPage((current) => replaceSavedArticle(current, updated))
      cancelEdit()
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setBusySavedId(null)
    }
  }

  async function handleDelete(article: SavedArticle) {
    setErrorMessage('')
    setBusySavedId(article.savedId)

    try {
      await deleteSavedArticle(article.savedId)
      setSavedPage((current) => removeSavedArticle(current, article.savedId))
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setBusySavedId(null)
    }
  }

  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <header className="board-header">
        <div>
          <p className="eyebrow">저장한 글</p>
          <h1 id="page-title">나중에 읽을 글</h1>
          <p className="lede">
            마음에 드는 글을 저장해두고, 다시 읽을 때 필요한 메모를 남길 수
            있습니다.
          </p>
        </div>
        <span className="detail-status">{totalLabel}</span>
      </header>

      {errorMessage.length > 0 ? (
        <p className="form-error preference-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {loading ? (
        <section className="reading-empty" aria-live="polite">
          저장한 글을 불러오는 중입니다.
        </section>
      ) : null}

      {!loading && items.length === 0 ? (
        <section className="reading-empty">
          <p className="note-label">비어 있음</p>
          <h2>아직 저장한 글이 없습니다</h2>
          <p>
            브리핑 상세에서 나중에 읽고 싶은 글을 저장하면 이곳에 모입니다.
          </p>
          <Link className="primary-action inline-action" to={ROUTES.home}>
            홈으로 이동
          </Link>
        </section>
      ) : null}

      <div className="reading-list">
        {items.map((article) => (
          <article key={article.savedId} className="reading-row">
            <div className="article-source-block">
              <span>{sourceLabel(article.source)}</span>
              <strong>{article.savedId}</strong>
            </div>

            <div className="article-main">
              <div className="article-meta">
                <span>{formatDate(article.savedAt)}</span>
                <span>{sourceLabel(article.source)}</span>
              </div>
              <h2>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h2>

              {editingSavedId === article.savedId ? (
                <form
                  className="memo-form"
                  onSubmit={(event) => void handleMemoSubmit(event, article)}
                >
                  <label>
                    메모
                    <textarea
                      value={memoInput}
                      onChange={(event) => setMemoInput(event.target.value)}
                      maxLength={INPUT_LIMITS.memoMaxLength}
                      rows={4}
                    />
                  </label>
                  <div>
                    <button
                      type="submit"
                      disabled={busySavedId === article.savedId}
                    >
                      저장
                    </button>
                    <button type="button" onClick={cancelEdit}>
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <p className="memo-text">
                  {article.memo.length > 0
                    ? article.memo
                    : '아직 메모가 없습니다. 읽어야 하는 이유나 기억할 내용을 남겨둘 수 있습니다.'}
                </p>
              )}
            </div>

            <div className="reading-actions">
              <button type="button" onClick={() => startEdit(article)}>
                메모 수정
              </button>
              <button
                type="button"
                disabled={busySavedId === article.savedId}
                onClick={() => void handleDelete(article)}
              >
                삭제
              </button>
            </div>
          </article>
        ))}
      </div>

      {savedPage !== null && savedPage.totalPages > 1 ? (
        <nav className="pagination" aria-label="저장한 글 페이지">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            이전
          </button>
          <span>
            {savedPage.page + 1} / {savedPage.totalPages}
          </span>
          <button
            type="button"
            disabled={!savedPage.hasNext}
            onClick={() => setPage((current) => current + 1)}
          >
            다음
          </button>
        </nav>
      ) : null}
    </section>
  )
}

function replaceSavedArticle(
  page: PageResponse<SavedArticle> | null,
  article: SavedArticle,
) {
  if (page === null) {
    return page
  }

  return {
    ...page,
    items: page.items.map((item) =>
      item.savedId === article.savedId ? article : item,
    ),
  }
}

function removeSavedArticle(
  page: PageResponse<SavedArticle> | null,
  savedId: number,
) {
  if (page === null) {
    return page
  }

  return {
    ...page,
    items: page.items.filter((item) => item.savedId !== savedId),
    totalElements: Math.max(0, page.totalElements - 1),
  }
}

function sourceLabel(source: Source) {
  if (source === SOURCE.github) {
    return 'GitHub'
  }

  if (source === SOURCE.hackerNews) {
    return 'Hacker News'
  }

  if (source === SOURCE.devto) {
    return 'DEV.to'
  }

  return 'AI'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}