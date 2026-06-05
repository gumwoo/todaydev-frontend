import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBriefing, getBriefings } from '../api/briefings'
import { getPreferences } from '../api/preferences'
import {
  BRIEFING_STATUS,
  SOURCE,
  type BriefingStatus,
  type Source,
} from '../constants/briefing'
import { ROUTES } from '../constants/routes'
import type { PageResponse } from '../types/api'
import type { BriefingDetail, BriefingListItem } from '../types/briefing'
import type { PreferencesResponse } from '../types/preferences'

type SourceStatus = {
  source: Source
  label: string
  state: 'ready' | 'waiting'
  count: number
}

export function HomePage() {
  const [preferences, setPreferences] = useState<PreferencesResponse | null>(null)
  const [briefingPage, setBriefingPage] =
    useState<PageResponse<BriefingListItem> | null>(null)
  const [latestBriefing, setLatestBriefing] = useState<BriefingDetail | null>(
    null,
  )
  const [panelLoading, setPanelLoading] = useState(true)
  const [panelFailed, setPanelFailed] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([getPreferences(), getBriefings(0, 5)])
      .then(async ([nextPreferences, nextBriefingPage]) => {
        if (!active) {
          return
        }

        setPreferences(nextPreferences)
        setBriefingPage(nextBriefingPage)

        const latest = nextBriefingPage.items[0]
        if (latest === undefined) {
          setLatestBriefing(null)
          return
        }

        const detail = await getBriefing(latest.briefingId)
        if (active) {
          setLatestBriefing(detail)
        }
      })
      .catch(() => {
        if (active) {
          setPanelFailed(true)
        }
      })
      .finally(() => {
        if (active) {
          setPanelLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const sourceStatus = useMemo(
    () => buildSourceStatus(latestBriefing),
    [latestBriefing],
  )
  const topInterests = useMemo(
    () =>
      [...(preferences?.keywords ?? [])]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 6),
    [preferences],
  )
  const recentBriefings = briefingPage?.items ?? []
  const maxInterestWeight = Math.max(
    ...topInterests.map((item) => item.weight),
    1,
  )

  return (
    <>
      <section className="briefing-board" aria-labelledby="page-title">
        <header className="board-header">
          <div>
            <p className="eyebrow">오늘의 브리핑</p>
            <h1 id="page-title">오늘의 개발 브리핑</h1>
            <p className="lede">
              관심 있는 기술 소식을 한곳에 모아 빠르게 훑어볼 수 있습니다.
            </p>
          </div>
          <Link className="primary-action" to={ROUTES.briefingNew}>
            새 브리핑 만들기
          </Link>
        </header>

        <section className="editorial-note" aria-labelledby="summary-title">
          <p id="summary-title" className="note-label">
            오늘 준비된 것
          </p>
          <p>
            키워드와 저장소를 설정하면 GitHub, Hacker News, DEV.to에서 읽을 만한
            글을 모아 요약합니다.
          </p>
        </section>

        <section className="implementation-list" aria-label="서비스 사용 안내">
          <article className="implementation-row">
            <span className="row-source">관심사</span>
            <div>
              <h2>관심사 기반 추천</h2>
              <p>
                내가 등록한 키워드와 저장소를 기준으로 관련 글을 우선
                보여줍니다.
              </p>
            </div>
          </article>

          <article className="implementation-row">
            <span className="row-source">요약</span>
            <div>
              <h2>한 번에 훑는 요약</h2>
              <p>
                긴 글을 모두 열어보지 않아도 핵심 내용을 먼저 확인할 수
                있습니다.
              </p>
            </div>
          </article>

          <article className="implementation-row">
            <span className="row-source">저장</span>
            <div>
              <h2>다시 볼 글 저장</h2>
              <p>
                나중에 읽고 싶은 글은 저장해두고 필요한 메모를 남길 수
                있습니다.
              </p>
            </div>
          </article>
        </section>
      </section>

      <aside className="context-panel" aria-label="브리핑 보조 정보">
        <section className="panel-section" aria-labelledby="source-title">
          <div className="panel-heading">
            <h2 id="source-title">소스 수집 현황</h2>
            <span>
              {panelLoading
                ? '불러오는 중'
                : latestBriefing === null
                  ? '기록 없음'
                  : '최근 브리핑 기준'}
            </span>
          </div>

          <ul className="source-list">
            {sourceStatus.map((item) => (
              <li key={item.source}>
                <span className={`source-dot ${item.source.toLowerCase()}`} />
                <span>{item.label}</span>
                <strong>{item.state === 'ready' ? '완료' : '대기 중'}</strong>
                <span className="source-count">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-section" aria-labelledby="interest-title">
          <div className="panel-heading">
            <h2 id="interest-title">관심사 TOP 6</h2>
            <Link to={ROUTES.preferences}>관리</Link>
          </div>
          {topInterests.length > 0 ? (
            <ul className="interest-list">
              {topInterests.map((item) => (
                <li key={item.keywordId}>
                  <span>{item.keyword}</span>
                  <span className="interest-meter" aria-hidden="true">
                    <span
                      className="interest-meter-fill"
                      style={{
                        width: `${Math.max((item.weight / maxInterestWeight) * 100, 8)}%`,
                      }}
                    />
                  </span>
                  <strong>{item.weight}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel-empty">
              {panelLoading
                ? '관심사를 불러오는 중입니다.'
                : '등록한 관심사가 아직 없습니다.'}
            </p>
          )}
        </section>

        <section className="panel-section" aria-labelledby="recent-title">
          <div className="panel-heading">
            <h2 id="recent-title">최근 브리핑</h2>
            <Link to={ROUTES.briefingHistory}>모두 보기</Link>
          </div>
          {recentBriefings.length > 0 ? (
            <ul className="recent-list">
              {recentBriefings.map((briefing) => (
                <li key={briefing.briefingId}>
                  <span className="recent-dot" aria-hidden="true" />
                  <Link to={ROUTES.briefingDetail(briefing.briefingId)}>
                    {formatBriefingDate(briefing.generatedAt)} 브리핑
                  </Link>
                  <time>{relativeDate(briefing.generatedAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel-empty">
              {panelLoading
                ? '최근 브리핑을 불러오는 중입니다.'
                : panelFailed
                ? '브리핑 정보를 불러오지 못했습니다.'
                : '받은 브리핑이 아직 없습니다.'}
            </p>
          )}
        </section>
      </aside>
    </>
  )
}

function buildSourceStatus(briefing: BriefingDetail | null): SourceStatus[] {
  const sectionOf = (source: Source) =>
    briefing?.sections.find((section) => section.source === source)
  const count = (source: Source) => sectionOf(source)?.items.length ?? 0
  const sourceReady = (source: Source) => isSummaryReady(sectionOf(source)?.status)

  return [
    {
      source: SOURCE.github,
      label: 'GitHub',
      state: sourceReady(SOURCE.github) ? 'ready' : 'waiting',
      count: count(SOURCE.github),
    },
    {
      source: SOURCE.hackerNews,
      label: 'Hacker News',
      state: sourceReady(SOURCE.hackerNews) ? 'ready' : 'waiting',
      count: count(SOURCE.hackerNews),
    },
    {
      source: SOURCE.devto,
      label: 'DEV.to',
      state: sourceReady(SOURCE.devto) ? 'ready' : 'waiting',
      count: count(SOURCE.devto),
    },
    {
      source: SOURCE.ai,
      label: 'AI 요약',
      state: isSummaryReady(briefing?.status) ? 'ready' : 'waiting',
      count:
        briefing?.sections.reduce(
          (total, section) => total + section.items.length,
          0,
        ) ?? 0,
    },
  ]
}

function isSummaryReady(status: BriefingStatus | undefined) {
  return (
    status === BRIEFING_STATUS.completed || status === BRIEFING_STATUS.partial
  )
}

function formatBriefingDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

function relativeDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffDays = Math.max(Math.floor(diffMs / 86_400_000), 0)

  if (diffDays === 0) {
    return '오늘'
  }

  if (diffDays === 1) {
    return '어제'
  }

  return `${diffDays}일 전`
}
