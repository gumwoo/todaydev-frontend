export type PreferenceKeyword = {
  keywordId: number
  keyword: string
  weight: number
  createdAt: string
}

export type PreferenceRepository = {
  repositoryId: number
  owner: string
  repoName: string
  createdAt: string
}

export type PreferencesResponse = {
  keywords: PreferenceKeyword[]
  repositories: PreferenceRepository[]
}

export type CreateKeywordRequest = {
  keyword: string
  weight: number
}

export type CreateRepositoryRequest = {
  owner: string
  repoName: string
}
