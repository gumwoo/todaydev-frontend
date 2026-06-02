import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export function BriefingDetailPlaceholderPage() {
  const params = useParams()

  return (
    <section className="briefing-board single-column" aria-labelledby="page-title">
      <p className="eyebrow">briefing detail</p>
      <h1 id="page-title">브리핑 상세 화면 준비 중</h1>
      <p className="lede">
        브리핑 #{params.briefingId} 생성이 끝났습니다. 다음 단계에서 상세
        조회 API와 source별 article row를 연결합니다.
      </p>
      <section className="editorial-note">
        <p className="note-label">next</p>
        <p>이제 AI summary와 GitHub/Hacker News/DEV.to 항목을 읽기 좋게 보여줄 차례입니다.</p>
      </section>
      <Link className="primary-action inline-action" to={ROUTES.home}>
        홈으로 돌아가기
      </Link>
    </section>
  )
}
