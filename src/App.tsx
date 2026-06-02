import './App.css'
import { ROUTES } from './constants/routes'
import { SOURCE, type Source } from './constants/briefing'

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

function App() {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="서비스 탐색">
        <a className="brand" href={ROUTES.home} aria-label="오늘의 개발 홈">
          <span className="brand-mark" aria-hidden="true">
            &gt;_
          </span>
          <span>오늘의 개발</span>
        </a>

        <nav className="nav-list">
          <a className="nav-item active" href={ROUTES.home}>
            홈
          </a>
          <a className="nav-item" href={ROUTES.briefingNew}>
            브리핑 생성
          </a>
          <a className="nav-item" href={ROUTES.preferences}>
            관심사 설정
          </a>
          <a className="nav-item" href={ROUTES.savedArticles}>
            저장한 글
          </a>
          <a className="nav-item" href={ROUTES.briefingHistory}>
            브리핑 히스토리
          </a>
        </nav>

        <section className="briefing-time" aria-labelledby="briefing-time-title">
          <p id="briefing-time-title">내 브리핑 시간</p>
          <strong>08:00</strong>
          <span>매일 아침 자동 생성 기준</span>
        </section>
      </aside>

      <section className="briefing-board" aria-labelledby="page-title">
        <header className="board-header">
          <div>
            <p className="eyebrow">프론트 1단계 공통 기반</p>
            <h1 id="page-title">오늘의 개발 브리핑</h1>
            <p className="lede">
              API 계약, 타입, 토큰 처리, SSE 연결 규칙을 화면 밖으로
              분리했습니다.
            </p>
          </div>
          <a className="primary-action" href={ROUTES.briefingNew}>
            새 브리핑 생성
          </a>
        </header>

        <section className="editorial-note" aria-labelledby="summary-title">
          <p id="summary-title" className="note-label">
            AI 한 줄 요약
          </p>
          <p>
            이제 화면은 백엔드 계약을 추측하지 않고, 중앙 API 계층과
            타입으로만 데이터를 받도록 준비되었습니다.
          </p>
        </section>

        <section className="implementation-list" aria-label="구현된 공통 기반">
          <article className="implementation-row">
            <span className="row-source">API</span>
            <div>
              <h2>공통 API client</h2>
              <p>
                base URL, Authorization header, HttpOnly refresh cookie 흐름,
                안전한 에러 메시지 변환을 한 곳에서 처리합니다.
              </p>
            </div>
          </article>

          <article className="implementation-row">
            <span className="row-source">TYPE</span>
            <div>
              <h2>계약 기반 DTO 타입</h2>
              <p>
                Auth, Preferences, Briefings, Saved Articles 응답을
                `API_CONTRACT.md` 기준으로 분리했습니다.
              </p>
            </div>
          </article>

          <article className="implementation-row">
            <span className="row-source">SSE</span>
            <div>
              <h2>브리핑 진행 스트림 hook</h2>
              <p>
                access token을 URL에 넣지 않고, 일회성 stream token으로만
                EventSource를 생성합니다.
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
            <li>TypeScript 전용 구조</li>
            <li>컴포넌트 직접 API 호출 금지</li>
            <li>토큰과 stream token 로그 노출 금지</li>
            <li>endpoint, route, event name 상수화</li>
            <li>보라색 템플릿과 장식용 이모티콘 제거</li>
          </ul>
        </section>
      </aside>
    </main>
  )
}

export default App
