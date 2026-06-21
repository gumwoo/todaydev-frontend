import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  deleteNotificationPreference,
  getNotificationDeliveries,
  getNotificationPreferences,
  sendTestNotification,
  updateNotificationPreference,
} from '../api/notifications'
import type { PageResponse } from '../types/api'
import type {
  NotificationChannel,
  NotificationDelivery,
  NotificationDeliveryStatus,
  NotificationPreference,
} from '../types/notifications'
import { getSafeErrorMessage } from '../utils/errors'

const PAGE_SIZE = 10

const CHANNELS: NotificationChannel[] = ['EMAIL', 'SLACK', 'DISCORD']

const CHANNEL_META: Record<
  NotificationChannel,
  { label: string; description: string; destinationLabel: string; placeholder: string }
> = {
  EMAIL: {
    label: '이메일',
    description: '브리핑을 메일함으로 받습니다.',
    destinationLabel: '이메일 주소',
    placeholder: 'name@example.com',
  },
  SLACK: {
    label: 'Slack',
    description: 'Slack Incoming Webhook으로 브리핑을 보냅니다.',
    destinationLabel: 'Webhook URL',
    placeholder: 'https://hooks.slack.com/services/...',
  },
  DISCORD: {
    label: 'Discord',
    description: 'Discord Webhook으로 브리핑을 보냅니다.',
    destinationLabel: 'Webhook URL',
    placeholder: 'https://discord.com/api/webhooks/...',
  },
}

type DraftState = Record<NotificationChannel, { destination: string; enabled: boolean }>

const EMPTY_DRAFTS: DraftState = {
  EMAIL: { destination: '', enabled: true },
  SLACK: { destination: '', enabled: true },
  DISCORD: { destination: '', enabled: true },
}

export function NotificationsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [drafts, setDrafts] = useState<DraftState>(EMPTY_DRAFTS)
  const [preferencesLoading, setPreferencesLoading] = useState(true)
  const [deliveriesPage, setDeliveriesPage] =
    useState<PageResponse<NotificationDelivery> | null>(null)
  const [page, setPage] = useState(0)
  const [loadingPage, setLoadingPage] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [busyAction, setBusyAction] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getNotificationPreferences()
      .then((response) => {
        if (!active) {
          return
        }

        setPreferences(response)
        setDrafts((current) => mergeEnabledDrafts(current, response))
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(getSafeErrorMessage(error))
        }
      })
      .finally(() => {
        if (active) {
          setPreferencesLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    getNotificationDeliveries(page, PAGE_SIZE)
      .then((response) => {
        if (!active) {
          return
        }

        setDeliveriesPage(response)
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(getSafeErrorMessage(error))
        }
      })
      .finally(() => {
        if (active) {
          setLoadingPage(page)
        }
      })

    return () => {
      active = false
    }
  }, [page])

  const preferenceByChannel = useMemo(
    () => new Map(preferences.map((preference) => [preference.channel, preference])),
    [preferences],
  )

  const deliveryItems = deliveriesPage?.items ?? []
  const deliveriesLoading = deliveriesPage === null || loadingPage !== page
  const totalLabel = `${deliveriesPage?.totalElements ?? 0}개 이력`

  async function handlePreferenceSubmit(
    event: FormEvent<HTMLFormElement>,
    channel: NotificationChannel,
  ) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const draft = drafts[channel]
    const destination = draft.destination.trim()

    if (destination.length === 0) {
      setErrorMessage(`${CHANNEL_META[channel].destinationLabel}을 입력해 주세요.`)
      return
    }

    setBusyAction(`save:${channel}`)

    try {
      const updated = await updateNotificationPreference(channel, {
        destination,
        enabled: draft.enabled,
      })
      setPreferences((current) => upsertPreference(current, updated))
      setDrafts((current) => ({
        ...current,
        [channel]: { ...current[channel], destination: '' },
      }))
      setSuccessMessage(`${CHANNEL_META[channel].label} 알림 설정을 저장했습니다.`)
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setBusyAction(null)
    }
  }

  async function handleDelete(channel: NotificationChannel) {
    setErrorMessage('')
    setSuccessMessage('')
    setBusyAction(`delete:${channel}`)

    try {
      await deleteNotificationPreference(channel)
      setPreferences((current) =>
        current.filter((preference) => preference.channel !== channel),
      )
      setDrafts((current) => ({
        ...current,
        [channel]: { destination: '', enabled: true },
      }))
      setSuccessMessage(`${CHANNEL_META[channel].label} 알림 설정을 삭제했습니다.`)
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setBusyAction(null)
    }
  }

  async function handleTest(channel: NotificationChannel) {
    setErrorMessage('')
    setSuccessMessage('')
    setBusyAction(`test:${channel}`)

    try {
      const updated = await sendTestNotification({ channel })
      setPreferences((current) => upsertPreference(current, updated))
      setSuccessMessage(`${CHANNEL_META[channel].label} 테스트 알림을 보냈습니다.`)
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <header className="board-header">
        <div>
          <p className="eyebrow">알림</p>
          <h1 id="page-title">브리핑을 받을 채널을 관리하세요</h1>
          <p className="lede">
            이메일, Slack, Discord 중 원하는 채널을 연결하고 발송 이력을 확인할 수
            있습니다.
          </p>
        </div>
        <span className="detail-status">{totalLabel}</span>
      </header>

      {errorMessage.length > 0 ? (
        <p className="form-error preference-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {successMessage.length > 0 ? (
        <p className="form-success notification-message" role="status">
          {successMessage}
        </p>
      ) : null}

      <section className="notification-grid" aria-busy={preferencesLoading}>
        {CHANNELS.map((channel) => {
          const meta = CHANNEL_META[channel]
          const preference = preferenceByChannel.get(channel)
          const draft = drafts[channel]
          const configured = preference?.configured ?? false
          const busy = busyAction?.endsWith(`:${channel}`) ?? false

          return (
            <article key={channel} className="preference-section notification-card">
              <div className="preference-heading">
                <div>
                  <p className="note-label">{channel}</p>
                  <h2>{meta.label}</h2>
                </div>
                <span>{configured ? '설정됨' : '미설정'}</span>
              </div>
              <p className="notification-description">{meta.description}</p>

              <form
                className="notification-form"
                onSubmit={(event) => void handlePreferenceSubmit(event, channel)}
              >
                <label>
                  {meta.destinationLabel}
                  <input
                    type={channel === 'EMAIL' ? 'email' : 'url'}
                    value={draft.destination}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [channel]: {
                          ...current[channel],
                          destination: event.target.value,
                        },
                      }))
                    }
                    placeholder={
                      configured
                        ? '새 값을 입력하면 기존 설정을 교체합니다.'
                        : meta.placeholder
                    }
                  />
                </label>
                <label className="notification-toggle">
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [channel]: {
                          ...current[channel],
                          enabled: event.target.checked,
                        },
                      }))
                    }
                  />
                  활성화
                </label>
                <div className="notification-actions">
                  <button type="submit" disabled={busy || preferencesLoading}>
                    {busyAction === `save:${channel}` ? '저장 중' : '저장'}
                  </button>
                  <button
                    type="button"
                    disabled={!configured || busy || preferencesLoading}
                    onClick={() => void handleTest(channel)}
                  >
                    {busyAction === `test:${channel}` ? '발송 중' : '테스트'}
                  </button>
                  <button
                    type="button"
                    disabled={!configured || busy || preferencesLoading}
                    onClick={() => void handleDelete(channel)}
                  >
                    {busyAction === `delete:${channel}` ? '삭제 중' : '삭제'}
                  </button>
                </div>
              </form>

              <dl className="notification-meta">
                <div>
                  <dt>상태</dt>
                  <dd>{statusText(preference)}</dd>
                </div>
                <div>
                  <dt>최근 수정</dt>
                  <dd>{preference ? formatDate(preference.updatedAt) : '없음'}</dd>
                </div>
              </dl>
            </article>
          )
        })}
      </section>

      <section className="notification-history" aria-labelledby="delivery-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">발송 이력</p>
            <h2 id="delivery-title">최근 알림 상태</h2>
          </div>
        </div>

        {deliveriesLoading ? (
          <section className="reading-empty" aria-live="polite">
            알림 이력을 불러오는 중입니다.
          </section>
        ) : null}

        {!deliveriesLoading && deliveryItems.length === 0 ? (
          <section className="reading-empty">
            아직 발송된 알림이 없습니다. 브리핑 알림이 발송되면 이곳에 기록됩니다.
          </section>
        ) : null}

        <div className="history-stack">
          {deliveryItems.map((delivery) => (
            <article key={delivery.deliveryId} className="history-row delivery-row">
              <div className="history-index">
                <span>{formatDate(delivery.updatedAt)}</span>
                <strong>{delivery.deliveryId}</strong>
              </div>
              <div className="history-main">
                <div className="article-meta">
                  <span>{CHANNEL_META[delivery.channel].label}</span>
                  <span>시도 {delivery.attemptCount}회</span>
                  <span>브리핑 #{delivery.briefingId}</span>
                </div>
                <h2>{deliveryStatusLabel(delivery.status)}</h2>
                <p>
                  대기 {formatNullableDate(delivery.queuedAt)} · 발송{' '}
                  {formatNullableDate(delivery.sentAt)}
                </p>
              </div>
              <span className={`detail-status ${delivery.status}`}>
                {delivery.status}
              </span>
            </article>
          ))}
        </div>

        {deliveriesPage !== null && deliveriesPage.totalPages > 1 ? (
          <nav className="pagination" aria-label="알림 이력 페이지">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              이전
            </button>
            <span>
              {deliveriesPage.page + 1} / {deliveriesPage.totalPages}
            </span>
            <button
              type="button"
              disabled={!deliveriesPage.hasNext}
              onClick={() => setPage((current) => current + 1)}
            >
              다음
            </button>
          </nav>
        ) : null}
      </section>
    </section>
  )
}

function mergeEnabledDrafts(
  current: DraftState,
  preferences: NotificationPreference[],
): DraftState {
  return preferences.reduce(
    (next, preference) => ({
      ...next,
      [preference.channel]: {
        ...next[preference.channel],
        enabled: preference.enabled,
      },
    }),
    current,
  )
}

function upsertPreference(
  preferences: NotificationPreference[],
  updated: NotificationPreference,
) {
  const exists = preferences.some(
    (preference) => preference.channel === updated.channel,
  )

  if (!exists) {
    return [...preferences, updated]
  }

  return preferences.map((preference) =>
    preference.channel === updated.channel ? updated : preference,
  )
}

function statusText(preference: NotificationPreference | undefined) {
  if (preference === undefined || !preference.configured) {
    return '아직 연결되지 않았습니다.'
  }

  return preference.enabled ? '알림을 받고 있습니다.' : '설정은 있지만 꺼져 있습니다.'
}

function deliveryStatusLabel(status: NotificationDeliveryStatus) {
  const labels: Record<NotificationDeliveryStatus, string> = {
    PENDING: '발송 대기',
    PUBLISHED: '큐 등록',
    SENDING: '발송 중',
    SENT: '발송 완료',
    RETRYING: '재시도 중',
    FAILED: '발송 실패',
    DLQ: '실패 큐 이동',
    SKIPPED: '건너뜀',
  }

  return labels[status]
}

function formatNullableDate(value: string | null) {
  return value === null ? '기록 없음' : formatDate(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
