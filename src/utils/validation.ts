export const INPUT_LIMITS = {
  emailMaxLength: 254,
  passwordMinLength: 8,
  passwordMaxLength: 72,
  keywordMaxLength: 40,
  repositoryMaxLength: 120,
  memoMaxLength: 1000,
} as const

export function isValidEmail(value: string) {
  const email = value.trim()

  return (
    email.length > 0 &&
    email.length <= INPUT_LIMITS.emailMaxLength &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
}

export function isValidPassword(value: string) {
  return (
    value.length >= INPUT_LIMITS.passwordMinLength &&
    value.length <= INPUT_LIMITS.passwordMaxLength
  )
}

export function isValidKeyword(value: string) {
  const keyword = value.trim()

  return keyword.length > 0 && keyword.length <= INPUT_LIMITS.keywordMaxLength
}

export function isValidMemo(value: string) {
  return value.length <= INPUT_LIMITS.memoMaxLength
}
