import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { SOURCE, type Source } from '../constants/briefing'

type SourceStatus = {
  source: Source
  label: string
  state: 'ready' | 'waiting'
  count: number
}

const sourceStatus: SourceStatus[] = [
  { source: SOURCE.github, label: 'GitHub', state: 'ready', count: 0 },
  { source: SOURCE.hackerNews, label: 'Hacker News', state: 'ready', count: 0 },
  { source: SOURCE.devto, label: 'DEV.to', state: 'ready', count: 0 },
  { source: SOURCE.ai, label: 'AI 요약', state: 'waiting', count: 0 },
]

export function HomePage() {
  return (
    <>
      <section className="briefing-board" aria-labelledby="page-title">
        <header className="board-header">
          <div>
            <p className="eyebrow">프론트 2단계 라우팅과 인증</p>
            <h1 id="page-title">오늘의 개발 브리핑</h1>
            <p className="lede">
              로그인 세션을 확인한 뒤, 브리핑과 관심사 화면으로 진입하는
              라우팅 기반이 준비되었습니다.
            </p>
          </div>
          <Link className="primary-action" to={ROUTES.briefingNew}>
            새 브리핑 생성
          </Link>
        </header>

        <section className="editorial-note" aria-labelledby="summary-title">
          <p id="summary-title" className="note-label">
            현재 연결 상태
          </p>
          <p>
            인증은 중앙 context에서 관리하고, 보호 라우트는 세션 복구가 끝난
            뒤에만 브리핑 화면을 보여줍니다.
          </p>
        </section>

        <section className="implementation-list" aria-label="구현된 인증 기반">
          <article className="implementation-row">
            <span className="row-source">ROUTE</span>
            <div>
              <h2>보호 라우트</h2>
              <p>
                홈, 브리핑 생성, 관심사 설정, 저장한 글, 히스토리는 인증된
                사용자만 접근합니다.
              </p>
            </div>
          </article>

          <article className="implementation-row">
            <span className="row-source">AUTH</span>
            <div>
              <h2>세션 bootstrap</h2>
              <p>
                앱 진입 시 refresh cookie로 access token을 복구하고, 실패하면
                로그인 화면으로 조용히 이동합니다.
              </p>
            </div>
          </article>

          <article className="implementation-row">
            <span className="row-source">FORM</span>
            <div>
              <h2>로그인과 회원가입</h2>
              <p>
                email/password 검증은 화면에서 1차 처리하고, 실패 메시지는
                안전한 사용자 문구로만 보여줍니다.
              </p>
            </div>
          </article>
        </section>
      </section>

      <aside className="context-panel" aria-label="브리핑 보조 정보">
        <section className="panel-section" aria-labelledby="source-title">
          <div className="panel-heading">
            <h2 id="source-title">소스 수집 기반</h2>
            <span>계약 기준</span>
          </div>

          <ul className="source-list">
            {sourceStatus.map((item) => (
              <li key={item.source}>
                <span className={`source-dot ${item.source.toLowerCase()}`} />
                <span>{item.label}</span>
                <strong>{item.state === 'ready' ? '준비됨' : '대기'}</strong>
                <span className="source-count">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-section" aria-labelledby="rule-title">
          <div className="panel-heading">
            <h2 id="rule-title">지켜진 룰</h2>
            <span>5개 MD 기준</span>
          </div>
          <ul className="rule-list">
            <li>라우트 경로 상수 사용</li>
            <li>컴포넌트 직접 API 호출 금지</li>
            <li>access token은 메모리에서만 관리</li>
            <li>raw error response 화면 출력 금지</li>
            <li>의미 없는 상단 통계 카드 없음</li>
          </ul>
        </section>
      </aside>
    </>
  )
}
