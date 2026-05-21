# Frontend Testing Rules

이 문서는 프론트엔드 테스트 기준입니다. 화면이 보이는 것뿐 아니라 API 계약, 타입 안정성, 에러/로딩/빈 상태, SSE 정리, 보안 노출을 검증합니다.

## 1. 테스트 원칙

- API 계약과 다른 타입/응답 가정은 테스트 실패로 본다.
- 주요 화면은 loading, empty, error, success 상태를 고려한다.
- 사용자의 다음 행동이 막히는 에러 상태를 방치하지 않는다.
- token, raw error, 내부 endpoint가 화면이나 로그에 노출되지 않게 한다.
- 테스트를 쉽게 만들기 위해 실제 코드 구조를 망가뜨리지 않는다.

## 2. 테스트 범위

공통:

- API response type narrowing
- ErrorCode message mapping
- route constants
- query key factory
- storage key constants

API:

- auth API 요청/응답 타입
- preferences API 요청/응답 타입
- briefings API 요청/응답 타입
- saved articles API 요청/응답 타입
- 401 refresh 처리
- error response 처리

인증:

- 로그인 성공
- 로그인 실패
- 로그아웃
- 인증 없는 보호 라우트 접근
- token 저장/삭제

관심사:

- keyword 추가/삭제
- repository owner/repo parsing
- validation error 표시
- empty state

브리핑:

- 브리핑 홈 loading/empty/success
- 브리핑 생성 요청
- 브리핑 상세 source별 렌더링
- partial briefing 표시
- save article action

SSE:

- stream token 요청
- EventSource 생성
- `BRIEFING_PROGRESS` 처리
- `BRIEFING_DONE` 처리
- `BRIEFING_PARTIAL_DONE` 처리
- `BRIEFING_FAILED` 처리
- unmount cleanup

디자인/상태:

- spinner만 있는 long-running 화면 금지
- 의미 없는 welcome/stat card 금지
- 장식용 emoji 금지
- 긴 title/summary 대응
- 모바일 레이아웃

## 3. 권장 도구

프로젝트 도구는 구현 시 확정한다.

권장:

- Vitest
- React Testing Library
- MSW
- Testing Library user-event

규칙:

- API mock은 `API_CONTRACT.md` 응답 포맷을 따라야 한다.
- mock 데이터는 실제 서비스 톤으로 작성한다.
- token이나 secret처럼 보이는 mock 값은 피한다.

## 4. API 계약 테스트 기준

프론트는 아래를 가정하고 타입/테스트를 작성한다.

- 성공 응답은 `success: true`, `data`, `timestamp`를 가진다.
- 실패 응답은 `success: false`, `error`, `timestamp`를 가진다.
- error는 `code`, `message`, `details`, `traceId`를 가진다.
- paging 응답은 `items`, `page`, `size`, `totalElements`, `totalPages`, `hasNext`를 가진다.

## 5. 보안 테스트 기준

화면/로그에 노출되면 안 되는 값:

- password
- access token
- refresh token
- stream token
- authorization header
- raw API response 전체
- stack trace
- 내부 endpoint
- API key

금지:

- `dangerouslySetInnerHTML`
- raw error message dump
- debug alert
- 민감정보 console 출력
- Access Token query string 사용

## 6. 접근성 테스트 기준

- 버튼은 button 요소를 사용한다.
- 링크는 a 요소를 사용한다.
- 아이콘만 있는 버튼은 accessible label을 가진다.
- focus-visible 상태가 보인다.
- 색상만으로 상태를 구분하지 않는다.
- 키보드로 주요 액션에 접근할 수 있다.

## 7. 완료 전 필수 테스트/확인

기능별 최소 확인:

- Auth: 성공/실패/보호 라우트
- Preferences: 추가/삭제/validation
- Briefing Home: loading/empty/success
- Briefing Loading: SSE progress/done/cleanup
- Briefing Detail: source별 렌더링/긴 데이터
- Saved Articles: empty/success

## 8. 테스트 금지 사항

- 실제 백엔드 서버에 의존하는 단위 테스트 금지
- 실제 token을 테스트에 넣는 것 금지
- snapshot만으로 UI 품질을 보장하는 것 금지
- implementation detail에 과하게 의존하는 테스트 금지
- 테스트 통과를 위해 타입을 `any`로 낮추는 것 금지

