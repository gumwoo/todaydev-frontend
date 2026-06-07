import { useEffect, useState, type FormEvent } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  getBriefingSchedule,
  updateBriefingSchedule,
} from '../api/schedule'
import { useAuth } from '../auth/useAuth'
import { ROUTES } from '../constants/routes'
import { getSafeErrorMessage } from '../utils/errors'

const brandIconUrl = new URL('../../icon.png', import.meta.url).href

const navItems = [
  { label: '홈', to: ROUTES.home },
  { label: '새 브리핑', to: ROUTES.briefingNew },
  { label: '관심사', to: ROUTES.preferences },
  { label: '저장한 글', to: ROUTES.savedArticles },
  { label: '지난 브리핑', to: ROUTES.briefingHistory },
] as const

export function AppLayout() {
  const { logout } = useAuth()
  const [briefingTime, setBriefingTime] = useState('08:00')
  const [scheduleEnabled, setScheduleEnabled] = useState(true)
  const [scheduleMessage, setScheduleMessage] = useState('')
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    let active = true

    getBriefingSchedule()
      .then((schedule) => {
        if (!active) {
          return
        }

        setBriefingTime(schedule.briefingTime)
        setScheduleEnabled(schedule.enabled)
      })
      .catch((error) => {
        if (active) {
          setScheduleMessage(getSafeErrorMessage(error))
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function handleScheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setScheduleMessage('')
    setScheduleSaving(true)

    try {
      const schedule = await updateBriefingSchedule({
        briefingTime,
        timezone,
        enabled: scheduleEnabled,
      })

      setBriefingTime(schedule.briefingTime)
      setScheduleEnabled(schedule.enabled)
      setScheduleMessage('받을 시간을 저장했습니다.')
    } catch (error) {
      setScheduleMessage(getSafeErrorMessage(error))
    } finally {
      setScheduleSaving(false)
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="서비스 탐색">
        <NavLink className="brand" to={ROUTES.home} aria-label="오늘의 개발 홈">
          <span className="brand-mark" aria-hidden="true">
            <img src={brandIconUrl} alt="" />
          </span>
        </NavLink>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
              to={item.to}
              end={item.to === ROUTES.home || item.to === ROUTES.briefingHistory}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <section className="briefing-time" aria-labelledby="briefing-time-title">
          <p id="briefing-time-title">매일 받을 시간</p>
          <strong>{briefingTime}</strong>
          <span>{scheduleEnabled ? '설정한 시간에 소식을 모아드려요' : '자동 브리핑이 꺼져 있어요'}</span>
          <form className="briefing-time-form" onSubmit={handleScheduleSubmit}>
            <div className="briefing-time-controls">
              <label className="briefing-time-field">
                받을 시간
                <input
                  type="time"
                  value={briefingTime}
                  onChange={(event) => setBriefingTime(event.target.value)}
                />
              </label>
              <label className="briefing-toggle">
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(event) => setScheduleEnabled(event.target.checked)}
                />
                자동
              </label>
            </div>
            <button type="submit" disabled={scheduleSaving}>
              {scheduleSaving ? '저장 중' : '시간 변경'}
            </button>
          </form>
          {scheduleMessage.length > 0 ? (
            <span className="briefing-time-message">{scheduleMessage}</span>
          ) : null}
        </section>

        <section className="profile-block" aria-label="로그아웃">
          <button type="button" onClick={() => void logout()}>
            로그아웃
          </button>
        </section>
      </aside>

      <Outlet />
    </main>
  )
}
