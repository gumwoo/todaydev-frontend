import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './auth/AuthProvider'
import { ROUTES } from './constants/routes'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { PreferencesPage } from './pages/PreferencesPage'
import { SignupPage } from './pages/SignupPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.login} element={<LoginPage />} />
              <Route path={ROUTES.signup} element={<SignupPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.home} element={<HomePage />} />
              <Route
                path={ROUTES.briefingNew}
                element={
                  <PlaceholderPage
                    eyebrow="briefing generation"
                    title="브리핑 생성 화면"
                    description="다음 단계에서 생성 요청과 SSE 진행률 timeline을 연결합니다."
                  />
                }
              />
              <Route
                path={ROUTES.preferences}
                element={<PreferencesPage />}
              />
              <Route
                path={ROUTES.savedArticles}
                element={
                  <PlaceholderPage
                    eyebrow="reading list"
                    title="저장한 글"
                    description="저장한 브리핑 항목과 메모를 읽기 흐름 안에서 관리합니다."
                  />
                }
              />
              <Route
                path={ROUTES.briefingHistory}
                element={
                  <PlaceholderPage
                    eyebrow="archive"
                    title="브리핑 히스토리"
                    description="날짜별 브리핑을 archive처럼 탐색하는 화면을 준비합니다."
                  />
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
