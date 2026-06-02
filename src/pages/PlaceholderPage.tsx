type PlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1 id="page-title">{title}</h1>
      <p className="lede">{description}</p>

      <section className="editorial-note">
        <p className="note-label">다음 구현 대상</p>
        <p>
          라우팅과 인증 보호는 준비되어 있습니다. 다음 단계에서 이 화면에
          실제 API 데이터와 상태 UI를 연결합니다.
        </p>
      </section>
    </section>
  )
}
