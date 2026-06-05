import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBriefings } from '../api/briefings'
import type { BriefingStatus } from '../constants/briefing'
import { ROUTES } from '../constants/routes'
import type { PageResponse } from '../types/api'
import type { BriefingListItem } from '../types/briefing'
import { getSafeErrorMessage } from '../utils/errors'
import { cleanDisplayText, displayBriefingTitle } from '../utils/text'

const PAGE_SIZE = 20

export function BriefingHistoryPage() {
  const [page, setPage] = useState(0)
  const [briefingPage, setBriefingPage] =
    useState<PageResponse<BriefingListItem> | null>(null)
  const [loadingPage, setLoadingPage] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    getBriefings(page, PAGE_SIZE)
      .then((response) => {
        if (!active) {
          return
        }

        setBriefingPage(response)
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

  const items = briefingPage?.items ?? []
  const loading = briefingPage === null || loadingPage !== page
  const totalLabel = useMemo(() => {
    const total = briefingPage?.totalElements ?? 0
    return `${total}개 기록`
  }, [briefingPage?.totalElements])

  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <header className="board-header">
        <div>
          <p className="eyebrow">지난 브리핑</p>
          <h1 id="page-title">다시 보고 싶은 브리핑</h1>
          <p className="lede">
            이전에 만든 브리핑을 시간순으로 다시 열어볼 수 있습니다.
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
          브리핑 기록을 불러오는 중입니다.
        </section>
      ) : null}

      {!loading && items.length === 0 ? (
        <section className="reading-empty">
          <p className="note-label">비어 있음</p>
          <h2>아직 만든 브리핑이 없습니다</h2>
          <p>
            첫 브리핑을 만들면 이곳에 기록이 쌓이고, 나중에 다시 읽을 수
            있습니다.
          </p>
          <Link className="primary-action inline-action" to={ROUTES.briefingNew}>
            새 브리핑 만들기
          </Link>
        </section>
      ) : null}

      <div className="history-stack">
        {items.map((briefing) => (
          <article key={briefing.briefingId} className="history-row">
            <div className="history-index">
              <span>{formatDate(briefing.generatedAt)}</span>
              <strong>{briefing.briefingId}</strong>
            </div>

            <div className="history-main">
              <div className="article-meta">
                <span>{statusLabel(briefing.status)}</span>
                <span>{briefing.itemCount}개 글</span>
              </div>
              <h2>
                <Link to={ROUTES.briefingDetail(briefing.briefingId)}>
                  {displayBriefingTitle(briefing.title)}
                </Link>
              </h2>
              <p>{cleanDisplayText(briefing.summary)}</p>
            </div>

            <Link
              className="history-link"
              to={ROUTES.briefingDetail(briefing.briefingId)}
            >
              열어보기
            </Link>
          </article>
        ))}
      </div>

      {briefingPage !== null && briefingPage.totalPages > 1 ? (
        <nav className="pagination" aria-label="지난 브리핑 페이지">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            이전
          </button>
          <span>
            {briefingPage.page + 1} / {briefingPage.totalPages}
          </span>
          <button
            type="button"
            disabled={!briefingPage.hasNext}
            onClick={() => setPage((current) => current + 1)}
          >
            다음
          </button>
        </nav>
      ) : null}
    </section>
  )
}

function statusLabel(status: BriefingStatus) {
  if (status === 'COMPLETED') {
    return '완료'
  }

  if (status === 'PARTIAL') {
    return '일부 완료'
  }

  if (status === 'SUMMARY_FAILED') {
    return '요약 실패'
  }

  if (status === 'FAILED') {
    return '실패'
  }

  return '만드는 중'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
