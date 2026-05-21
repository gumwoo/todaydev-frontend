# Frontend Definition of Done

이 문서는 프론트엔드 작업을 "완료"라고 말하기 전 반드시 확인해야 하는 기준입니다.

## 1. 공통 완료 기준

- `API_CONTRACT.md`와 타입/응답 가정이 일치한다.
- `CODING_RULES.md`를 위반하지 않는다.
- `DESIGN_RULES.md`를 위반하지 않는다.
- `TESTING_RULES.md` 기준의 필요한 테스트가 작성되었거나, 작성하지 못한 이유가 명확하다.
- TypeScript로 작성되었다.
- `any`로 타입 문제를 덮지 않았다.
- API URL, route path, storage key, query key가 하드코딩되지 않았다.

## 2. API 연동 완료 기준

- API 호출은 중앙 API client를 통해 이루어진다.
- 컴포넌트에서 `fetch` 또는 `axios`를 직접 호출하지 않는다.
- 요청/응답 타입이 명확하다.
- error code 처리가 흩어져 있지 않다.
- 401 처리 정책이 중앙화되어 있다.
- raw error response를 화면에 dump하지 않는다.

## 3. UI 완료 기준

- loading, empty, error, success 상태가 있다.
- 필요한 경우 partial success 상태가 있다.
- 긴 title, summary, tag, URL이 들어와도 깨지지 않는다.
- 모바일에서 읽기 흐름이 유지된다.
- keyboard/focus 접근성이 깨지지 않는다.
- 아이콘만 있는 버튼에는 accessible label이 있다.

## 4. 디자인 완료 기준

- 브리핑 리더 방향을 따른다.
- 보라색 SaaS 템플릿 느낌이 아니다.
- 장식용 이모티콘을 쓰지 않았다.
- 의미 없는 상단 hero/welcome/stat card가 없다.
- 카드형 UI를 기본값으로 남발하지 않았다.
- source별 정보 성격이 다르게 보인다.
- spinner 하나로 긴 작업을 때우지 않았다.
- 실제 서비스 데이터가 들어와도 어색하지 않다.

## 5. 보안 완료 기준

- token, password, authorization header, stream token이 로그에 남지 않는다.
- 일반 access token을 query string에 넣지 않는다.
- `dangerouslySetInnerHTML`을 사용하지 않는다.
- 프론트 환경 변수에 secret이 없다.
- raw exception 또는 stack trace를 사용자에게 보여주지 않는다.
- debug alert, debug banner, 테스트 계정 정보가 남아 있지 않다.

## 6. SSE 완료 기준

- stream token 발급 후 EventSource를 생성한다.
- 일반 access token을 SSE URL에 넣지 않는다.
- unmount 시 EventSource를 닫는다.
- done/partial/failed 이벤트 후 연결을 닫는다.
- 진행 상태가 spinner 하나가 아니라 단계적으로 보인다.

## 7. 테스트 완료 기준

- 주요 화면 상태가 확인되었다.
- API mock은 `API_CONTRACT.md` 포맷을 따른다.
- 에러 상태가 사용자를 방치하지 않는다.
- 보안 노출 금지 항목을 확인했다.
- 타입 오류가 없다.

## 8. 문서 완료 기준

- API 계약 변경이 있으면 양쪽 `API_CONTRACT.md`를 갱신했다.
- 디자인 방향 변경이 있으면 `DESIGN_RULES.md`를 갱신했다.
- 새 route, query key, status, source가 생기면 constants와 문서를 확인했다.
- 백엔드와 맞닿는 변경은 백엔드 계약 문서도 함께 갱신했다.

## 9. AI 작업 완료 체크리스트

AI가 프론트엔드 작업 후 반드시 확인한다.

- 이 변경은 어느 단계의 개발 계획에 속하는가?
- API 계약을 임의로 추측하지 않았는가?
- TypeScript 타입이 안전한가?
- 컴포넌트가 너무 많은 책임을 갖지 않는가?
- 보안상 노출되는 값이 없는가?
- 디자인 금지 패턴을 만들지 않았는가?
- 사용자가 실패/빈/로딩 상태에서 다음 행동을 알 수 있는가?
- 실제 서비스처럼 보이는가?

