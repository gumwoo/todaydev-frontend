export function cleanDisplayText(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function displayBriefingTitle(value: string) {
  const trimmed = cleanDisplayText(value)

  if (trimmed.toLowerCase() === 'todaydev briefing') {
    return '오늘의 개발 브리핑'
  }

  return trimmed
}
