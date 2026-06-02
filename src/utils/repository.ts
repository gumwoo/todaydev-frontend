import type { CreateRepositoryRequest } from '../types/preferences'

const REPOSITORY_PATTERN = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/

export function parseRepositoryInput(value: string): CreateRepositoryRequest | null {
  const normalized = value.trim()
  const matched = REPOSITORY_PATTERN.exec(normalized)

  if (matched === null) {
    return null
  }

  const [, owner, repoName] = matched
  return {
    owner,
    repoName,
  }
}
