import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './auth/AuthProvider'
import { ROUTES } from './constants/routes'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { BriefingCreatePage } from './pages/BriefingCreatePage'
import { BriefingDetailPage } from './pages/BriefingDetailPage'
import { BriefingHistoryPage } from './pages/BriefingHistoryPage'
import { BriefingLoadingPage } from './pages/BriefingLoadingPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PreferencesPage } from './pages/PreferencesPage'
import { SavedArticlesPage } from './pages/SavedArticlesPage'
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
                element={<BriefingCreatePage />}
              />
              <Route
                path="/briefings/:briefingId/loading"
                element={<BriefingLoadingPage />}
              />
              <Route
                path="/briefings/:briefingId"
                element={<BriefingDetailPage />}
              />
              <Route
                path={ROUTES.preferences}
                element={<PreferencesPage />}
              />
              <Route
                path={ROUTES.savedArticles}
                element={<SavedArticlesPage />}
              />
              <Route
                path={ROUTES.briefingHistory}
                element={<BriefingHistoryPage />}
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
