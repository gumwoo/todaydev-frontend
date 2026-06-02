import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../auth/useAuth'

export function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'checking') {
    return (
      <section className="auth-card" aria-live="polite">
        <p className="eyebrow">session</p>
        <h1>세션 확인 중</h1>
        <p>이미 로그인되어 있다면 브리핑 화면으로 이동합니다.</p>
      </section>
    )
  }

  if (status === 'authenticated') {
    return <Navigate to={ROUTES.home} replace />
  }

  return <Outlet />
}
