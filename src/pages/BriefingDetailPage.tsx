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
import { cleanDisplayText, displayBriefingTitle } from '../utils/text'

type SourceFilter = 'ALL' | Source

type MetadataChip = {
  label: string
  value: string
}

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
        <p className="eyebrow">찾을 수 없음</p>
        <h1 id="page-title">브리핑 정보를 찾을 수 없습니다</h1>
        <p className="lede">주소가 올바르지 않습니다.</p>
        <Link className="primary-action inline-action" to={ROUTES.briefingNew}>
          새 브리핑 만들기
        </Link>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="briefing-board single-column" aria-live="polite">
        <p className="eyebrow">불러오는 중</p>
        <h1>브리핑을 불러오고 있습니다</h1>
        <p className="lede">
          읽기 좋은 화면으로 정리하고 있으니 잠시만 기다려 주세요.
        </p>
      </section>
    )
  }

  if (briefing === null) {
    return (
      <section className="briefing-board single-column" aria-labelledby="page-title">
        <p className="eyebrow">문제 발생</p>
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
          <h1 id="page-title">{displayBriefingTitle(briefing.title)}</h1>
          <p className="lede">
            총 {totalItemCount}개의 글을 읽기 쉽게 정리했습니다. 출처별로
            골라보거나 마음에 드는 글을 저장할 수 있습니다.
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
          한눈에 보기
        </p>
        <p>{cleanDisplayText(briefing.summary)}</p>
      </section>

      <nav className="source-tabs" aria-label="브리핑 출처 필터">
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
        </div>
        <h2>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </h2>
        <p>{cleanDisplayText(item.summary)}</p>
        <MetadataChips source={item.source} metadata={item.metadata} />
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

type MetadataChipsProps = {
  source: Source
  metadata: BriefingMetadata
}

function MetadataChips({ source, metadata }: MetadataChipsProps) {
  const chips = metadataChips(source, metadata)

  if (chips.length === 0) {
    return null
  }

  return (
    <dl className="metadata-chips" aria-label="글 정보">
      {chips.map((chip) => (
        <div key={`${chip.label}-${chip.value}`} className="metadata-chip">
          <dt>{chip.label}</dt>
          <dd>{chip.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function metadataChips(source: Source, metadata: BriefingMetadata) {
  if (source === SOURCE.github) {
    return compactMetadata([
      stringChip('저장소', repositoryName(metadata)),
      stringChip('태그', metadata.tagName),
    ])
  }

  if (source === SOURCE.hackerNews) {
    return compactMetadata([
      stringChip('작성자', metadata.author),
      numberChip('점수', metadata.score),
      stringChip('종류', metadata.type),
    ])
  }

  if (source === SOURCE.devto) {
    return compactMetadata([
      numberChip('반응', metadata.reactions),
      numberChip('댓글', metadata.comments),
      stringChip('태그', formatTags(metadata.tags)),
    ])
  }

  return compactMetadata([stringChip('태그', formatTags(metadata.tags))])
}

function repositoryName(metadata: BriefingMetadata) {
  const owner = stringValue(metadata.owner)
  const repoName = stringValue(metadata.repoName)

  if (owner === null || repoName === null) {
    return null
  }

  return `${owner}/${repoName}`
}

function compactMetadata(values: Array<MetadataChip | null>) {
  return values.filter((value): value is MetadataChip => value !== null)
}

function stringChip(label: string, value: BriefingMetadata[string] | string | null) {
  const safeValue = stringValue(value)

  if (safeValue === null) {
    return null
  }

  return { label, value: safeValue }
}

function numberChip(label: string, value: BriefingMetadata[string]) {
  if (typeof value !== 'number') {
    return null
  }

  return { label, value: new Intl.NumberFormat('ko-KR').format(value) }
}

function stringValue(value: BriefingMetadata[string] | string | null) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

function formatTags(value: BriefingMetadata[string]) {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const tags = value
    .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    .slice(0, 4)

  if (tags.length === 0) {
    return null
  }

  return tags.join(', ')
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

  return '만드는 중'
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
