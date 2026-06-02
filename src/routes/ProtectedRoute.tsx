import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../auth/useAuth'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <section className="route-state" aria-live="polite">
        <p className="eyebrow">session</p>
        <h1>로그인 상태를 확인하고 있습니다</h1>
        <p>브리핑 화면에 들어가기 전에 세션을 조용히 복구합니다.</p>
      </section>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
