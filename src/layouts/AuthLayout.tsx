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
        <div className="auth-intro-copy">
          <p className="eyebrow">매일 아침, 필요한 개발 소식만</p>
          <h1 id="auth-title">오늘 읽을 개발 소식을 한눈에 모아드려요</h1>
          <p>
            관심 있는 기술과 저장소를 기준으로 중요한 글을 골라 보기 쉽게
            정리합니다.
          </p>
        </div>
      </section>

      <Outlet />
    </main>
  )
}