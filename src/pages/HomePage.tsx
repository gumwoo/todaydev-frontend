import { Link } from 'react-router-dom'
import { SOURCE, type Source } from '../constants/briefing'
import { ROUTES } from '../constants/routes'

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
            <h2 id="source-title">수집하는 곳</h2>
            <span>준비됨</span>
          </div>

          <ul className="source-list">
            {sourceStatus.map((item) => (
              <li key={item.source}>
                <span className={`source-dot ${item.source.toLowerCase()}`} />
                <span>{item.label}</span>
                <strong>{item.state === 'ready' ? '사용 가능' : '대기 중'}</strong>
                <span className="source-count">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-section" aria-labelledby="rule-title">
          <div className="panel-heading">
            <h2 id="rule-title">이렇게 도와드려요</h2>
            <span>간단 안내</span>
          </div>
          <ul className="rule-list">
            <li>관심 키워드로 관련 글을 고릅니다.</li>
            <li>중요도가 높은 글을 먼저 보여줍니다.</li>
            <li>읽기 전에 핵심 내용을 요약합니다.</li>
            <li>마음에 드는 글은 저장할 수 있습니다.</li>
            <li>오류가 나도 안전한 안내 문구만 보여줍니다.</li>
          </ul>
        </section>
      </aside>
    </>
  )
}