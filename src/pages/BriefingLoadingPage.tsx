import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BRIEFING_STATUS,
  PROGRESS_STEP,
  SOURCE,
  type ProgressStep,
  type Source,
} from '../constants/briefing'
import { ROUTES } from '../constants/routes'
import { useBriefingStream } from '../hooks/useBriefingStream'
import type {
  BriefingProgressEvent,
  BriefingTerminalEvent,
} from '../types/briefing'
import { getSafeErrorMessage } from '../utils/errors'

type TimelineItem = {
  step: ProgressStep
  label: string
  source?: Source
}

const TIMELINE: TimelineItem[] = [
  { step: PROGRESS_STEP.briefingRequested, label: '브리핑 요청 접수' },
  {
    step: PROGRESS_STEP.githubCollecting,
    label: 'GitHub 릴리즈와 저장소 흐름 수집',
    source: SOURCE.github,
  },
  {
    step: PROGRESS_STEP.githubCollected,
    label: 'GitHub 수집 완료',
    source: SOURCE.github,
  },
  {
    step: PROGRESS_STEP.hackerNewsCollecting,
    label: 'Hacker News 토론 흐름 수집',
    source: SOURCE.hackerNews,
  },
  {
    step: PROGRESS_STEP.hackerNewsCollected,
    label: 'Hacker News 수집 완료',
    source: SOURCE.hackerNews,
  },
  {
    step: PROGRESS_STEP.devtoCollecting,
    label: 'DEV.to 글 수집',
    source: SOURCE.devto,
  },
  {
    step: PROGRESS_STEP.devtoCollected,
    label: 'DEV.to 수집 완료',
    source: SOURCE.devto,
  },
  { step: PROGRESS_STEP.filtering, label: '관심사 기준 필터링' },
  { step: PROGRESS_STEP.scoring, label: '읽을 가치 점수화' },
  { step: PROGRESS_STEP.aiSummarizing, label: 'AI 요약 생성' },
  { step: PROGRESS_STEP.saving, label: '브리핑 저장' },
  { step: PROGRESS_STEP.done, label: '브리핑 완료' },
]

export function BriefingLoadingPage() {
  const navigate = useNavigate()
  const params = useParams()
  const briefingId = Number(params.briefingId)
  const invalidBriefingId =
    !Number.isInteger(briefingId) || briefingId <= 0
  const [events, setEvents] = useState<BriefingProgressEvent[]>([])
  const [terminalEvent, setTerminalEvent] =
    useState<BriefingTerminalEvent | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleProgress = useCallback((event: BriefingProgressEvent) => {
    setEvents((current) => {
      if (current.some((item) => item.step === event.step)) {
        return current.map((item) => (item.step === event.step ? event : item))
      }

      return [...current, event]
    })
  }, [])

  const handleDone = useCallback((event: BriefingTerminalEvent) => {
    setTerminalEvent(event)
  }, [])

  const { connect, state } = useBriefingStream({
    briefingId,
    onProgress: handleProgress,
    onDone: handleDone,
  })

  useEffect(() => {
    if (invalidBriefingId) {
      return
    }

    connect().catch((error) => {
      setErrorMessage(getSafeErrorMessage(error))
    })
  }, [briefingId, connect, invalidBriefingId])

  useEffect(() => {
    if (terminalEvent?.status === BRIEFING_STATUS.completed) {
      const timeoutId = window.setTimeout(() => {
        navigate(ROUTES.briefingDetail(briefingId), { replace: true })
      }, 1200)

      return () => window.clearTimeout(timeoutId)
    }

    return undefined
  }, [briefingId, navigate, terminalEvent])

  const eventByStep = useMemo(() => {
    return new Map(events.map((event) => [event.step, event]))
  }, [events])

  const completedCount = events.length + (terminalEvent === null ? 0 : 1)

  if (invalidBriefingId) {
    return (
      <section className="briefing-board single-column" aria-labelledby="page-title">
        <p className="eyebrow">not found</p>
        <h1 id="page-title">브리핑 정보를 찾을 수 없습니다</h1>
        <p className="lede">
          주소의 브리핑 번호가 올바르지 않습니다. 새 브리핑 생성을 다시
          시작해 주세요.
        </p>
        <Link className="primary-action inline-action" to={ROUTES.briefingNew}>
          새 브리핑 생성
        </Link>
      </section>
    )
  }

  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <header className="board-header">
        <div>
          <p className="eyebrow">live generation</p>
          <h1 id="page-title">브리핑을 만들고 있습니다</h1>
          <p className="lede">
            단순 spinner 대신 각 출처 수집과 AI 요약 단계를 timeline으로
            확인합니다.
          </p>
        </div>
        <span className={`stream-state ${state}`}>{streamStateLabel(state)}</span>
      </header>

      {errorMessage.length > 0 ? (
        <p className="form-error preference-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="progress-summary" aria-live="polite">
        <strong>{completedCount}</strong>
        <span>수신한 진행 이벤트</span>
        {terminalEvent !== null ? <p>{terminalEvent.message}</p> : null}
      </section>

      <ol className="progress-timeline">
        {TIMELINE.map((item) => {
          const event = eventByStep.get(item.step)
          const active = event !== undefined

          return (
            <li
              key={item.step}
              className={active ? 'timeline-item active' : 'timeline-item'}
            >
              <span className="timeline-marker" />
              <div>
                <div className="timeline-heading">
                  <strong>{item.label}</strong>
                  {item.source !== undefined ? (
                    <span>{sourceLabel(item.source)}</span>
                  ) : null}
                </div>
                <p>
                  {event?.message ??
                    '아직 이 단계의 진행 이벤트를 기다리고 있습니다.'}
                </p>
                {event !== undefined ? (
                  <span className="timeline-count">
                    {formatProgressCount(event.processed, event.total)}
                  </span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>

      {terminalEvent !== null ? (
        <section className={`terminal-panel ${terminalEvent.status}`}>
          <p className="note-label">result</p>
          <h2>{terminalTitle(terminalEvent)}</h2>
          <p>{terminalEvent.message}</p>
          {terminalEvent.status === BRIEFING_STATUS.completed ? (
            <Link to={ROUTES.briefingDetail(briefingId)}>브리핑 상세 보기</Link>
          ) : null}
        </section>
      ) : null}
    </section>
  )
}

function formatProgressCount(processed: number | null, total: number | null) {
  if (processed === null || total === null) {
    return '진행 중'
  }

  return `${processed}/${total}`
}

function streamStateLabel(state: string) {
  if (state === 'connecting') {
    return '연결 중'
  }

  if (state === 'open') {
    return '수신 중'
  }

  if (state === 'failed') {
    return '연결 실패'
  }

  if (state === 'closed') {
    return '연결 종료'
  }

  return '대기'
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

function terminalTitle(event: BriefingTerminalEvent) {
  if (event.status === BRIEFING_STATUS.completed) {
    return '브리핑 생성이 완료되었습니다'
  }

  if (event.status === BRIEFING_STATUS.partial) {
    return '일부 출처를 제외하고 생성되었습니다'
  }

  return '브리핑 생성에 실패했습니다'
}
