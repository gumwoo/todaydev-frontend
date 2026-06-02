import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-intro" aria-labelledby="auth-title">
        <Link className="brand" to={ROUTES.home} aria-label="오늘의 개발 홈">
          <span className="brand-mark" aria-hidden="true">
            &gt;_
          </span>
          <span>오늘의 개발</span>
        </Link>
        <div>
          <p className="eyebrow">developer briefing reader</p>
          <h1 id="auth-title">매일 읽을 개발 흐름을 한 곳에 모읍니다</h1>
          <p>
            GitHub, Hacker News, DEV.to, AI 요약을 조합해 아침에 바로 읽을
            수 있는 개인 브리핑으로 정리합니다.
          </p>
        </div>
      </section>

      <Outlet />
    </main>
  )
}
