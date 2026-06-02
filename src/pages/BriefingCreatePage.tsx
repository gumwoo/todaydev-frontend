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
          <p className="eyebrow">새 브리핑</p>
          <h1 id="page-title">오늘 읽을 소식을 모아볼게요</h1>
          <p className="lede">
            관심사에 맞는 글을 찾고, 중요한 내용부터 읽기 쉽게 정리합니다.
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
          <p className="note-label">시작하기</p>
          <h2 id="generation-title">브리핑 만들기</h2>
          <p>
            몇 분 정도 걸릴 수 있어요. 진행 상황은 화면에서 바로 확인할 수
            있습니다.
          </p>
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleCreateBriefing()}
        >
          {submitting ? '브리핑 만드는 중' : '브리핑 만들기'}
        </button>
      </section>

      <section className="generation-rules" aria-label="브리핑 생성 과정">
        <article>
          <span>01</span>
          <strong>관심사 확인</strong>
          <p>등록한 키워드와 저장소를 확인합니다.</p>
        </article>
        <article>
          <span>02</span>
          <strong>새 글 찾기</strong>
          <p>GitHub, Hacker News, DEV.to에서 읽을 만한 글을 모읍니다.</p>
        </article>
        <article>
          <span>03</span>
          <strong>요약 정리</strong>
          <p>중요한 글을 골라 핵심 내용을 정리합니다.</p>
        </article>
      </section>
    </section>
  )
}