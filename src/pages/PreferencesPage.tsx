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
const KEYWORD_WEIGHT_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1)

export function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferencesResponse>({
    keywords: [],
    repositories: [],
  })
  const [loading, setLoading] = useState(true)
  const [keywordInput, setKeywordInput] = useState('')
  const [keywordWeight, setKeywordWeight] = useState(DEFAULT_KEYWORD_WEIGHT)
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
        weight: keywordWeight,
      })
      setPreferences((current) => ({
        ...current,
        keywords: [...current.keywords, created],
      }))
      setKeywordInput('')
      setKeywordWeight(DEFAULT_KEYWORD_WEIGHT)
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
          <p className="eyebrow">관심사</p>
          <h1 id="page-title">관심 있는 기술을 알려주세요</h1>
          <p className="lede">
            보고 싶은 키워드와 GitHub 저장소를 등록하면 브리핑이 그 기준에 맞춰
            글을 고릅니다.
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
              <p className="note-label">키워드</p>
              <h2>관심 키워드</h2>
            </div>
            <span>{keywordCountLabel}</span>
          </div>

          <form
            className="preference-form keyword-preference-form"
            onSubmit={handleKeywordSubmit}
          >
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
            <label className="keyword-weight-field">
              중요도
              <select
                name="weight"
                value={keywordWeight}
                onChange={(event) => setKeywordWeight(Number(event.target.value))}
              >
                {KEYWORD_WEIGHT_OPTIONS.map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </select>
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
                  <span>중요도 {keyword.weight}</span>
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
              <p className="note-label">저장소</p>
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
            <button type="submit" disabled={repositorySubmitting || loading}>
              {repositorySubmitting ? '추가 중' : '저장소 추가'}
            </button>
          </form>

          <PreferenceList
            emptyDescription="아직 저장소가 없습니다. 살펴보고 싶은 GitHub 저장소를 owner/repo 형식으로 추가해 보세요."
            loading={loading}
          >
            {preferences.repositories.map((repository) => (
              <li key={repository.repositoryId} className="preference-item">
                <div>
                  <strong>
                    {repository.owner}/{repository.repoName}
                  </strong>
                  <span>GitHub 저장소</span>
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
