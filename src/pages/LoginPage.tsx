import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ROUTES } from '../constants/routes'
import { getSafeErrorMessage } from '../utils/errors'
import { isValidEmail, isValidPassword } from '../utils/validation'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? ROUTES.home

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!isValidEmail(email) || !isValidPassword(password)) {
      setErrorMessage('이메일과 비밀번호를 다시 확인해 주세요.')
      return
    }

    setSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="login-title">
      <p className="eyebrow">sign in</p>
      <h1 id="login-title">브리핑을 열기 전에 로그인합니다</h1>
      <p className="auth-copy">
        토큰 처리는 화면 밖에서만 이루어지고, refresh token은 백엔드의
        HttpOnly cookie 흐름을 따릅니다.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          이메일
          <input
            autoComplete="email"
            inputMode="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
          />
        </label>

        <label>
          비밀번호
          <input
            autoComplete="current-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
          />
        </label>

        {errorMessage.length > 0 ? (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button type="submit" disabled={submitting}>
          {submitting ? '로그인 중' : '로그인'}
        </button>
      </form>

      <p className="auth-switch">
        계정이 없다면 <Link to={ROUTES.signup}>회원가입</Link>
      </p>
    </section>
  )
}
