import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBriefing } from '../api/briefings'
import { saveArticle } from '../api/savedArticles'
import {
  SOURCE,
  type BriefingStatus,
  type Source,
} from '../constants/briefing'
import { ROUTES } from '../constants/routes'
import type {
  BriefingDetail,
  BriefingItem,
  BriefingMetadata,
  BriefingSection,
} from '../types/briefing'
import { getSafeErrorMessage } from '../utils/errors'

type SourceFilter = 'ALL' | Source

const SOURCE_FILTERS: SourceFilter[] = [
  'ALL',
  SOURCE.github,
  SOURCE.hackerNews,
  SOURCE.devto,
  SOURCE.ai,
]

export function BriefingDetailPage() {
  const params = useParams()
  const briefingId = Number(params.briefingId)
  const invalidBriefingId =
    !Number.isInteger(briefingId) || briefingId <= 0
  const [briefing, setBriefing] = useState<BriefingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedSource, setSelectedSource] = useState<SourceFilter>('ALL')
  const [savingItemId, setSavingItemId] = useState<number | null>(null)
  const [savedItemIds, setSavedItemIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (invalidBriefingId) {
      return
    }

    let active = true

    getBriefing(briefingId)
      .then((response) => {
        if (!active) {
          return
        }

        setBriefing(response)
        setSavedItemIds(
          new Set(
            response.sections
              .flatMap((section) => section.items)
              .filter((item) => item.saved)
              .map((item) => item.itemId),
          ),
        )
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

        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [briefingId, invalidBriefingId])

  const visibleSections = useMemo(() => {
    if (briefing === null) {
      return []
    }

    if (selectedSource === 'ALL') {
      return briefing.sections
    }

    return briefing.sections.filter((section) => section.source === selectedSource)
  }, [briefing, selectedSource])

  const totalItemCount = useMemo(() => {
    return briefing?.sections.reduce(
      (total, section) => total + section.items.length,
      0,
    ) ?? 0
  }, [briefing])

  async function handleSave(item: BriefingItem) {
    setErrorMessage('')
    setSavingItemId(item.itemId)

    try {
      await saveArticle(item.itemId, { memo: '' })
      setSavedItemIds((current) => new Set(current).add(item.itemId))
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setSavingItemId(null)
    }
  }

  if (invalidBriefingId) {
    return (
      <section className="briefing-board single-column" aria-labelledby="page-title">
        <p className="eyebrow">not found</p>
        <h1 id="page-title">브리핑 정보를 찾을 수 없습니다</h1>
        <p className="lede">주소의 브리핑 번호가 올바르지 않습니다.</p>
        <Link className="primary-action inline-action" to={ROUTES.briefingNew}>
          새 브리핑 생성
        </Link>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="briefing-board single-column" aria-live="polite">
        <p className="eyebrow">briefing detail</p>
        <h1>브리핑을 불러오고 있습니다</h1>
        <p className="lede">
          source별 항목과 AI 요약을 읽기 화면으로 정리하고 있습니다.
        </p>
      </section>
    )
  }

  if (briefing === null) {
    return (
      <section className="briefing-board single-column" aria-labelledby="page-title">
        <p className="eyebrow">error</p>
        <h1 id="page-title">브리핑을 불러오지 못했습니다</h1>
        {errorMessage.length > 0 ? (
          <p className="form-error preference-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <Link className="primary-action inline-action" to={ROUTES.home}>
          홈으로 돌아가기
        </Link>
      </section>
    )
  }

  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <header className="board-header">
        <div>
          <p className="eyebrow">{formatDate(briefing.generatedAt)}</p>
          <h1 id="page-title">{briefing.title}</h1>
          <p className="lede">
            총 {totalItemCount}개의 항목을 source별로 정리했습니다.
          </p>
        </div>
        <span className={`detail-status ${briefing.status}`}>
          {statusLabel(briefing.status)}
        </span>
      </header>

      {errorMessage.length > 0 ? (
        <p className="form-error preference-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="editorial-note detail-summary" aria-labelledby="summary-title">
        <p id="summary-title" className="note-label">
          AI editorial note
        </p>
        <p>{briefing.summary}</p>
      </section>

      <nav className="source-tabs" aria-label="브리핑 source 필터">
        {SOURCE_FILTERS.map((source) => (
          <button
            key={source}
            type="button"
            className={selectedSource === source ? 'active' : ''}
            onClick={() => setSelectedSource(source)}
          >
            {sourceFilterLabel(source)}
            <span>{countBySource(briefing.sections, source)}</span>
          </button>
        ))}
      </nav>

      <div className="article-stream">
        {visibleSections.flatMap((section) =>
          section.items.map((item) => (
            <ArticleRow
              key={item.itemId}
              item={item}
              saved={savedItemIds.has(item.itemId)}
              saving={savingItemId === item.itemId}
              onSave={() => void handleSave(item)}
            />
          )),
        )}
      </div>
    </section>
  )
}

type ArticleRowProps = {
  item: BriefingItem
  saved: boolean
  saving: boolean
  onSave: () => void
}

function ArticleRow({ item, saved, saving, onSave }: ArticleRowProps) {
  return (
    <article className={`article-row ${item.source.toLowerCase()}`}>
      <div className="article-source-block">
        <span>{sourceFilterLabel(item.source)}</span>
        <strong>{formatScore(item.score)}</strong>
      </div>

      <div className="article-main">
        <div className="article-meta">
          <span>{formatDate(item.publishedAt)}</span>
          <MetadataLine source={item.source} metadata={item.metadata} />
        </div>
        <h2>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </h2>
        <p>{item.summary}</p>
      </div>

      <button
        type="button"
        className="save-button"
        disabled={saved || saving}
        onClick={onSave}
        aria-label={`${item.title} 저장`}
      >
        {saved ? '저장됨' : saving ? '저장 중' : '저장'}
      </button>
    </article>
  )
}

type MetadataLineProps = {
  source: Source
  metadata: BriefingMetadata
}

function MetadataLine({ source, metadata }: MetadataLineProps) {
  const parts = metadataParts(source, metadata)

  if (parts.length === 0) {
    return null
  }

  return <span>{parts.join(' · ')}</span>
}

function metadataParts(source: Source, metadata: BriefingMetadata) {
  if (source === SOURCE.github) {
    return compactMetadata([
      formatMetadataNumber('stars', metadata.stars),
      formatMetadataNumber('comments', metadata.comments),
      formatTags(metadata.tags),
    ])
  }

  if (source === SOURCE.hackerNews) {
    return compactMetadata([
      formatMetadataNumber('score', metadata.score),
      formatMetadataNumber('comments', metadata.comments),
    ])
  }

  if (source === SOURCE.devto) {
    return compactMetadata([
      formatMetadataNumber('reactions', metadata.reactions),
      formatMetadataNumber('comments', metadata.comments),
      formatTags(metadata.tags),
    ])
  }

  return compactMetadata([formatTags(metadata.tags)])
}

function compactMetadata(values: Array<string | null>) {
  return values.filter((value): value is string => value !== null)
}

function formatMetadataNumber(label: string, value: BriefingMetadata[string]) {
  if (typeof value !== 'number') {
    return null
  }

  return `${label} ${value}`
}

function formatTags(value: BriefingMetadata[string]) {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  return value.slice(0, 3).join(', ')
}

function countBySource(sections: BriefingSection[], source: SourceFilter) {
  if (source === 'ALL') {
    return sections.reduce((total, section) => total + section.items.length, 0)
  }

  return (
    sections.find((section) => section.source === source)?.items.length ?? 0
  )
}

function sourceFilterLabel(source: SourceFilter) {
  if (source === 'ALL') {
    return '전체'
  }

  if (source === SOURCE.github) {
    return 'GitHub'
  }

  if (source === SOURCE.hackerNews) {
    return 'Hacker News'
  }

  if (source === SOURCE.devto) {
    return 'DEV.to'
  }

  return 'AI 요약'
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

  return '생성 중'
}

function formatScore(score: number) {
  return Math.round(score).toString().padStart(2, '0')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
