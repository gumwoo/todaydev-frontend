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
        <p className="note-label">다음에 이어서 만들 화면</p>
        <p>
          기본 흐름은 준비되어 있습니다. 다음 단계에서 실제 데이터와 상태를
          연결해 더 자연스럽게 사용할 수 있게 만들겠습니다.
        </p>
      </section>
    </section>
  )
}