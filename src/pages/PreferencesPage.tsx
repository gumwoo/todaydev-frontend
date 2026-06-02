import {
  Children,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  createKeyword,
  createRepository,
  deleteKeyword,
  deleteRepository,
  getPreferences,
} from '../api/preferences'
import type {
  PreferenceKeyword,
  PreferenceRepository,
  PreferencesResponse,
} from '../types/preferences'
import { getSafeErrorMessage } from '../utils/errors'
import { parseRepositoryInput } from '../utils/repository'
import { INPUT_LIMITS, isValidKeyword } from '../utils/validation'

const DEFAULT_KEYWORD_WEIGHT = 5

export function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferencesResponse>({
    keywords: [],
    repositories: [],
  })
  const [loading, setLoading] = useState(true)
  const [keywordInput, setKeywordInput] = useState('')
  const [repositoryInput, setRepositoryInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [keywordSubmitting, setKeywordSubmitting] = useState(false)
  const [repositorySubmitting, setRepositorySubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getPreferences()
      .then((response) => {
        if (!active) {
          return
        }

        setPreferences(response)
      })
      .catch((error) => {
        if (!active) {
          return
        }

        setErrorMessage(getSafeErrorMessage(error))
      })
      .finally(() => {
        if (!active) {
          return
        }

        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const keywordCountLabel = useMemo(
    () => `${preferences.keywords.length}개 키워드`,
    [preferences.keywords.length],
  )

  const repositoryCountLabel = useMemo(
    () => `${preferences.repositories.length}개 저장소`,
    [preferences.repositories.length],
  )

  async function handleKeywordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!isValidKeyword(keywordInput)) {
      setErrorMessage('키워드는 1자 이상 40자 이하로 입력해 주세요.')
      return
    }

    const keyword = keywordInput.trim()
    setKeywordSubmitting(true)

    try {
      const created = await createKeyword({
        keyword,
        weight: DEFAULT_KEYWORD_WEIGHT,
      })
      setPreferences((current) => ({
        ...current,
        keywords: [...current.keywords, created],
      }))
      setKeywordInput('')
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setKeywordSubmitting(false)
    }
  }

  async function handleRepositorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (repositoryInput.length > INPUT_LIMITS.repositoryMaxLength) {
      setErrorMessage('저장소는 120자 이하로 입력해 주세요.')
      return
    }

    const repository = parseRepositoryInput(repositoryInput)

    if (repository === null) {
      setErrorMessage('저장소는 owner/repo 형식으로 입력해 주세요.')
      return
    }

    setRepositorySubmitting(true)

    try {
      const created = await createRepository(repository)
      setPreferences((current) => ({
        ...current,
        repositories: [...current.repositories, created],
      }))
      setRepositoryInput('')
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setRepositorySubmitting(false)
    }
  }

  async function handleDeleteKeyword(keyword: PreferenceKeyword) {
    setErrorMessage('')
    setDeletingId(`keyword:${keyword.keywordId}`)

    try {
      await deleteKeyword(keyword.keywordId)
      setPreferences((current) => ({
        ...current,
        keywords: current.keywords.filter(
          (item) => item.keywordId !== keyword.keywordId,
        ),
      }))
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteRepository(repository: PreferenceRepository) {
    setErrorMessage('')
    setDeletingId(`repository:${repository.repositoryId}`)

    try {
      await deleteRepository(repository.repositoryId)
      setPreferences((current) => ({
        ...current,
        repositories: current.repositories.filter(
          (item) => item.repositoryId !== repository.repositoryId,
        ),
      }))
    } catch (error) {
      setErrorMessage(getSafeErrorMessage(error))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <header className="board-header">
        <div>
          <p className="eyebrow">preferences</p>
          <h1 id="page-title">브리핑 재료를 조율합니다</h1>
          <p className="lede">
            키워드와 GitHub repository는 매일 아침 브리핑의 수집 기준입니다.
            장식용 태그가 아니라 실제 점수화에 쓰이는 신호로 관리합니다.
          </p>
        </div>
      </header>

      {errorMessage.length > 0 ? (
        <p className="form-error preference-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="preference-grid" aria-busy={loading}>
        <article className="preference-section">
          <div className="preference-heading">
            <div>
              <p className="note-label">keyword signal</p>
              <h2>관심 키워드</h2>
            </div>
            <span>{keywordCountLabel}</span>
          </div>

          <form className="preference-form" onSubmit={handleKeywordSubmit}>
            <label>
              키워드
              <input
                name="keyword"
                type="text"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                maxLength={INPUT_LIMITS.keywordMaxLength}
                placeholder="예: Spring, WebFlux, TypeScript"
              />
            </label>
            <button type="submit" disabled={keywordSubmitting || loading}>
              {keywordSubmitting ? '추가 중' : '키워드 추가'}
            </button>
          </form>

          <PreferenceList
            emptyDescription="아직 키워드가 없습니다. 자주 읽는 기술 이름부터 하나 추가해 보세요."
            loading={loading}
          >
            {preferences.keywords.map((keyword) => (
              <li key={keyword.keywordId} className="preference-item">
                <div>
                  <strong>{keyword.keyword}</strong>
                  <span>weight {keyword.weight}</span>
                </div>
                <button
                  type="button"
                  disabled={deletingId === `keyword:${keyword.keywordId}`}
                  onClick={() => void handleDeleteKeyword(keyword)}
                >
                  삭제
                </button>
              </li>
            ))}
          </PreferenceList>
        </article>

        <article className="preference-section">
          <div className="preference-heading">
            <div>
              <p className="note-label">repository watch</p>
              <h2>GitHub 저장소</h2>
            </div>
            <span>{repositoryCountLabel}</span>
          </div>

          <form className="preference-form" onSubmit={handleRepositorySubmit}>
            <label>
              owner/repo
              <input
                name="repository"
                type="text"
                value={repositoryInput}
                onChange={(event) => setRepositoryInput(event.target.value)}
                maxLength={INPUT_LIMITS.repositoryMaxLength}
                placeholder="예: spring-projects/spring-framework"
              />
            </label>
            <button
              type="submit"
              disabled={repositorySubmitting || loading}
            >
              {repositorySubmitting ? '추가 중' : '저장소 추가'}
            </button>
          </form>

          <PreferenceList
            emptyDescription="아직 저장소가 없습니다. 추적할 repository를 owner/repo 형식으로 추가해 보세요."
            loading={loading}
          >
            {preferences.repositories.map((repository) => (
              <li key={repository.repositoryId} className="preference-item">
                <div>
                  <strong>
                    {repository.owner}/{repository.repoName}
                  </strong>
                  <span>GitHub repository</span>
                </div>
                <button
                  type="button"
                  disabled={
                    deletingId === `repository:${repository.repositoryId}`
                  }
                  onClick={() => void handleDeleteRepository(repository)}
                >
                  삭제
                </button>
              </li>
            ))}
          </PreferenceList>
        </article>
      </section>
    </section>
  )
}

type PreferenceListProps = {
  children: ReactNode
  emptyDescription: string
  loading: boolean
}

function PreferenceList({
  children,
  emptyDescription,
  loading,
}: PreferenceListProps) {
  const childCount = Children.count(children)

  if (loading) {
    return (
      <div className="preference-empty" aria-live="polite">
        설정을 불러오는 중입니다.
      </div>
    )
  }

  if (childCount === 0) {
    return <div className="preference-empty">{emptyDescription}</div>
  }

  return <ul className="preference-list">{children}</ul>
}
