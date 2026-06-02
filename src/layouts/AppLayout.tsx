import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../auth/useAuth'

const navItems = [
  { label: '홈', to: ROUTES.home },
  { label: '브리핑 생성', to: ROUTES.briefingNew },
  { label: '관심사 설정', to: ROUTES.preferences },
  { label: '저장한 글', to: ROUTES.savedArticles },
  { label: '브리핑 히스토리', to: ROUTES.briefingHistory },
] as const

export function AppLayout() {
  const { logout, user } = useAuth()

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="서비스 탐색">
        <NavLink className="brand" to={ROUTES.home} aria-label="오늘의 개발 홈">
          <span className="brand-mark" aria-hidden="true">
            &gt;_
          </span>
          <span>오늘의 개발</span>
        </NavLink>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
              to={item.to}
              end={item.to === ROUTES.home}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <section className="briefing-time" aria-labelledby="briefing-time-title">
          <p id="briefing-time-title">내 브리핑 시간</p>
          <strong>08:00</strong>
          <span>매일 아침 자동 생성 기준</span>
        </section>

        <section className="profile-block" aria-label="현재 로그인 정보">
          <div>
            <strong>{user?.email ?? '세션 복구됨'}</strong>
            <span>Todaydev reader</span>
          </div>
          <button type="button" onClick={() => void logout()}>
            로그아웃
          </button>
        </section>
      </aside>

      <Outlet />
    </main>
  )
}
