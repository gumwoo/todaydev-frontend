# Frontend Development Plan

이 문서는 `오늘의 개발` 프론트엔드를 어떤 순서로 구현할지 정리한 개발 계획입니다. AI 또는 사람이 개발할 때 이 순서를 기준으로 진행하며, 화면 구현이 API 계약, 타입, 디자인 룰을 벗어나지 않도록 합니다.

## 0. 개발 전 확인

구현 전 반드시 확인할 문서:

- `API_CONTRACT.md`
- `CODING_RULES.md`
- `DESIGN_RULES.md`
- `TESTING_RULES.md`
- `DONE_DEFINITION.md`

원칙:

- TypeScript를 기본으로 한다.
- API 타입은 `API_CONTRACT.md`를 기준으로 만든다.
- 화면은 `DESIGN_RULES.md`의 브리핑 리더 방향을 따른다.
- 장식용 이모티콘, 의미 없는 상단 카드, 카드 남발을 피한다.

## 1. 공통 기반

목표:

- API, route, type, style의 기반을 먼저 만든다.

작업:

- route path constants
- storage key constants
- query key constants
- source/status/event constants
- 공통 API response type
- 공통 error type
- API client
- 공통 layout 기준

완료 기준:

- API URL, route path, storage key가 컴포넌트에 하드코딩되지 않는다.
- `any` 없이 타입이 구성된다.

## 2. 디자인 시스템 최소 기반

목표:

- 실제 서비스처럼 보이는 일관된 시각 기준을 만든다.

작업:

- CSS variables 또는 Tailwind theme 기준
- typography 기준
- color token
- spacing/radius/shadow 기준
- source badge 스타일
- focus-visible 스타일
- loading/empty/error/partial 상태 패턴

완료 기준:

- 보라색 SaaS 템플릿 느낌이 아니다.
- 기본 system font만 쓰지 않는다.
- 의미 없는 welcome/stat card가 없다.

## 3. 라우팅과 인증 흐름

목표:

- 로그인 상태에 따라 화면 접근을 제어한다.

작업:

- router 구성
- ProtectedRoute
- LoginPage
- SignupPage
- auth API
- token 저장/제거 정책
- 401 refresh 처리

완료 기준:

- token 처리가 중앙 API client 밖으로 새지 않는다.
- 인증 실패 시 조용히 로그인으로 유도한다.

## 4. 관심사 설정

목표:

- 사용자가 브리핑 재료를 설정할 수 있다.

작업:

- PreferencesPage
- keyword 등록/삭제
- repository 등록/삭제
- owner/repo 입력 파싱
- empty state
- validation

완료 기준:

- `owner/repo` 입력은 API 요청 전 `owner`, `repoName`으로 분리된다.
- 키워드와 repository가 장식용 pill이 아니라 브리핑 재료처럼 표현된다.

## 5. 브리핑 홈

목표:

- 사용자가 오늘 읽을 핵심과 새 브리핑 생성 행동을 바로 이해한다.

작업:

- BriefingHomePage
- 오늘 브리핑 요약
- 새 브리핑 생성
- 최근 브리핑 진입
- source 수집 상태 요약

완료 기준:

- 의미 없는 welcome card나 stat card가 없다.
- 첫 화면 상단은 핵심 콘텐츠 또는 핵심 행동과 연결된다.

## 6. 브리핑 생성 중 화면

목표:

- 긴 작업을 spinner가 아니라 진행 흐름으로 보여준다.

작업:

- BriefingLoadingPage
- stream token 발급
- `useBriefingStream`
- source별 progress timeline
- partial/failure 표시
- 완료 후 detail 이동

완료 기준:

- 일반 access token을 SSE URL에 넣지 않는다.
- unmount 시 EventSource를 닫는다.
- done/partial/failed 이벤트 처리 후 연결을 닫는다.

## 7. 브리핑 상세

목표:

- 개발자가 실제로 읽기 좋은 브리핑 리더를 만든다.

작업:

- BriefingDetailPage
- editorial AI summary
- source tabs
- GitHub article row
- Hacker News article row
- DEV.to article row
- save action
- long text 대응

완료 기준:

- source별 정보 구조가 다르게 보인다.
- 같은 카드 반복처럼 보이지 않는다.
- 실제 데이터가 길어도 깨지지 않는다.

## 8. 히스토리와 저장한 글

목표:

- 과거 브리핑과 저장한 글을 읽기 흐름 안에서 관리한다.

작업:

- BriefingHistoryPage
- SavedArticlesPage
- paging
- empty state
- memo 표시

완료 기준:

- 단순 관리자 테이블처럼 보이지 않는다.
- reading list/archive 느낌이 난다.

## 9. QA와 접근성

목표:

- 실제 서비스 품질에 가까운 마무리를 한다.

작업:

- 모바일 레이아웃
- keyboard navigation
- focus-visible
- loading/error/empty/partial 상태 확인
- API error message 매핑
- 불필요한 mock/debug 제거

완료 기준:

- 데스크톱과 모바일에서 모두 읽을 수 있다.
- token, raw error, debug 로그가 노출되지 않는다.
- 디자인 룰 위반이 없다.

