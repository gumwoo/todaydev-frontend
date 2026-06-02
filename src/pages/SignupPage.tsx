import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ROUTES } from '../constants/routes'
import { getSafeErrorMessage } from '../utils/errors'
import { isValidEmail, isValidPassword } from '../utils/validation'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!isValidEmail(email) || !isValidPassword(password)) {
      setErrorMessage('이메일과 비밀번호를 다시 확인해 주세요.')
      return
    }

    setSubmitting(true)

    try {
      await signup({ email: email.trim(), password })
      navigate(ROUTES.home, { replace: true })
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="signup-title">
      <p className="eyebrow">회원가입</p>
      <h1 id="signup-title">나만의 개발 브리핑을 시작해요</h1>
      <p className="auth-copy">
        이메일과 비밀번호만 입력하면 관심사 설정으로 이어집니다.
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
            autoComplete="new-password"
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
          {submitting ? '계정 만드는 중' : '회원가입'}
        </button>
      </form>

      <p className="auth-switch">
        이미 계정이 있다면 <Link to={ROUTES.login}>로그인</Link>
      </p>
    </section>
  )
}