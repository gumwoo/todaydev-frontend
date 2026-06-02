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
      <p className="eyebrow">로그인</p>
      <h1 id="login-title">내 브리핑을 확인해요</h1>
      <p className="auth-copy">
        관심사에 맞춘 개발 소식을 불러오려면 먼저 로그인해 주세요.
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