import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBriefing } from '../api/briefings'
import { ROUTES } from '../constants/routes'
import { getSafeErrorMessage } from '../utils/errors'

export function BriefingCreatePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleCreateBriefing() {
    setErrorMessage('')
    setSubmitting(true)

    try {
      const response = await createBriefing()
      navigate(ROUTES.briefingLoading(response.briefingId), {
        replace: true,
      })
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <header className="board-header">
        <div>
          <p className="eyebrow">briefing generation</p>
          <h1 id="page-title">새 브리핑을 생성합니다</h1>
          <p className="lede">
            GitHub, Hacker News, DEV.to를 수집하고 관심사 기준으로 점수화한
            뒤 AI 요약까지 이어집니다.
          </p>
        </div>
      </header>

      {errorMessage.length > 0 ? (
        <p className="form-error preference-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="generation-panel" aria-labelledby="generation-title">
        <div>
          <p className="note-label">request</p>
          <h2 id="generation-title">오늘 읽을 흐름을 수집합니다</h2>
          <p>
            생성 요청은 빠르게 접수되고, 이후 진행률은 별도 stream token으로
            연결한 SSE timeline에서 확인합니다.
          </p>
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleCreateBriefing()}
        >
          {submitting ? '생성 요청 중' : '브리핑 생성 시작'}
        </button>
      </section>

      <section className="generation-rules" aria-label="생성 흐름 기준">
        <article>
          <span>01</span>
          <strong>요청 접수</strong>
          <p>백엔드는 `GENERATING` 상태를 즉시 반환합니다.</p>
        </article>
        <article>
          <span>02</span>
          <strong>출처 수집</strong>
          <p>GitHub, Hacker News, DEV.to 진행 상태를 단계별로 받습니다.</p>
        </article>
        <article>
          <span>03</span>
          <strong>AI 요약과 저장</strong>
          <p>완료, 일부 완료, 실패를 종료 이벤트로 구분합니다.</p>
        </article>
      </section>
    </section>
  )
}
