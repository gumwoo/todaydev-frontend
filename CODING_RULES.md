# Frontend Coding Rules

이 문서는 AI 또는 사람이 `오늘의 개발` 프론트엔드 코드를 작성할 때 반드시 지켜야 하는 기준입니다. 목표는 빠르게 화면만 붙이는 것이 아니라, 실제 서비스로 확장 가능한 **TypeScript 기반 브리핑 리더 프론트엔드**를 만드는 것입니다.

## 1. 핵심 원칙

- 화면 컴포넌트 안에 API URL, token 처리, 응답 변환 로직을 직접 넣지 않는다.
- 페이지, 컴포넌트, API client, hook, type, constant의 역할을 명확히 분리한다.
- 백엔드 API 스펙 변경에 대비해 API 호출 계층을 중앙화한다.
- 인증, 라우팅, SSE, 서버 상태 관리는 프로젝트 공통 규칙을 따른다.
- 임시 mock 데이터는 명확히 표시하고 실제 API 연결 전 제거한다.
- JavaScript가 아니라 TypeScript를 기본으로 사용한다.
- `any`로 타입 문제를 덮지 않는다.

## 2. TypeScript 규칙

- 새 파일은 기본적으로 `.ts` 또는 `.tsx`로 작성한다.
- React 컴포넌트는 `.tsx`, 순수 함수/API/상수/type은 `.ts`를 사용한다.
- `any` 사용은 금지한다. 불가피하면 이유를 주석으로 남기고 `unknown` 또는 명확한 type guard를 먼저 검토한다.
- 백엔드 DTO와 맞닿는 타입은 `src/types` 또는 도메인별 type 파일에서 관리한다.
- status, source, SSE event name은 string 남발 대신 union type 또는 const object로 관리한다.
- props 타입은 컴포넌트 파일 안에서 가까이 정의하되, 여러 곳에서 쓰면 분리한다.
- API 응답 타입과 화면 ViewModel 타입을 구분한다.
- optional field는 실제로 없을 수 있는 값에만 사용한다.

## 3. 디렉토리 구조 규칙

권장 기본 구조:

```text
src/
├─ api/
│  ├─ client.ts
│  ├─ auth.ts
│  ├─ briefings.ts
│  ├─ preferences.ts
│  └─ saved.ts
├─ hooks/
│  ├─ useAuth.ts
│  └─ useBriefingStream.ts
├─ pages/
│  ├─ LoginPage.tsx
│  ├─ SignupPage.tsx
│  ├─ PreferencesPage.tsx
│  ├─ BriefingHomePage.tsx
│  ├─ BriefingLoadingPage.tsx
│  ├─ BriefingDetailPage.tsx
│  ├─ BriefingHistoryPage.tsx
│  └─ SavedArticlesPage.tsx
├─ components/
├─ routes/
├─ constants/
├─ types/
├─ utils/
└─ styles/
```

규칙:

- `pages`: 라우트 단위 화면만 둔다.
- `components`: 재사용 가능한 UI 조각만 둔다.
- `api`: 서버 통신 함수만 둔다.
- `hooks`: 상태ful 로직, API 조합, SSE 연결 로직을 둔다.
- `constants`: route path, storage key, query key, status, source, event name을 둔다.
- `types`: 백엔드 DTO, view model, 공통 타입을 둔다.
- `utils`: 순수 함수만 둔다.

## 4. API 계층 규칙

- 모든 HTTP 요청은 `src/api/client.ts` 또는 동일 역할의 중앙 client를 통해 보낸다.
- 페이지나 컴포넌트에서 `fetch`, `axios`를 직접 호출하지 않는다.
- API endpoint 문자열은 API 모듈 안에서 관리한다.
- base URL은 환경 변수로 관리한다.
- 요청/응답 변환 로직은 API 모듈 또는 hook에서 처리한다.
- 백엔드 응답 구조가 바뀌어도 화면 컴포넌트 수정 범위가 최소가 되도록 한다.
- API 함수는 입력 타입과 반환 타입을 명확히 선언한다.

## 5. 하드코딩 금지 규칙

아래 값은 컴포넌트에 직접 쓰지 않는다.

- API base URL
- route path
- localStorage/sessionStorage key
- React Query query key
- briefing status 값
- source 값 `GITHUB`, `HACKER_NEWS`, `DEVTO`
- SSE event name
- token 만료 관련 숫자
- 반복 사용되는 에러 메시지

관리 위치 예시:

- route path: `constants/routes.ts`
- storage key: `constants/storageKeys.ts`
- query key: `constants/queryKeys.ts`
- status/source/event: `constants/briefing.ts`
- 환경 값: `.env`

## 6. 인증 규칙

- Access Token 저장 위치는 프로젝트 결정에 따른다.
- Refresh Token은 가능하면 HttpOnly Cookie 기반 백엔드 흐름에 맞춘다.
- Authorization header 주입은 API client interceptor에서만 처리한다.
- 401 refresh 처리도 중앙 API client에서 처리한다.
- 컴포넌트가 token 문자열을 직접 읽거나 조립하지 않는다.
- 로그에 token, stream token, 사용자 비밀번호를 남기지 않는다.

## 7. 라우팅 규칙

- route path는 상수로 관리한다.
- 보호 라우트는 공통 `ProtectedRoute` 같은 한 곳에서 처리한다.
- 페이지 이동 경로를 문자열로 직접 반복하지 않는다.
- 브리핑 생성 후 loading/detail 이동 흐름은 hook 또는 page 단위에서 명확히 관리한다.

## 8. 상태 관리 규칙

서버 상태:

- 브리핑 목록, 상세, 관심사, 저장 글은 TanStack Query 같은 서버 상태 도구로 관리한다.
- query key는 상수 또는 factory 함수로 관리한다.
- mutation 성공 후 필요한 query invalidation을 명시한다.

클라이언트 상태:

- 입력값, 탭 선택, 모달 열림 여부처럼 화면 내부 상태만 `useState`로 관리한다.
- 여러 페이지가 공유하는 인증 상태는 전용 hook/context로 관리한다.
- 서버 응답을 전역 store에 복제하지 않는다.

## 9. SSE 규칙

- `EventSource` 생성은 `useBriefingStream` 같은 전용 hook에서만 한다.
- 일반 Access Token을 SSE URL query string에 넣지 않는다.
- 백엔드에서 발급한 단기 stream token만 SSE URL에 사용한다.
- 이벤트 이름은 상수로 관리한다.
- 컴포넌트 unmount 시 반드시 `EventSource.close()`를 호출한다.
- `BRIEFING_DONE`, `BRIEFING_FAILED` 같은 종료 이벤트 수신 시 연결을 닫는다.
- 재연결 정책이 필요하면 hook 내부에서만 구현한다.

## 10. 컴포넌트 규칙

- 페이지 컴포넌트는 데이터 로딩과 화면 조합을 담당한다.
- 공통 컴포넌트는 props 기반으로 동작하고 API 호출을 직접 하지 않는다.
- 하나의 컴포넌트가 너무 커지면 section 단위로 분리한다.
- UI 컴포넌트는 가능하면 도메인 API 응답 원본에 직접 의존하지 않는다.
- list rendering에는 안정적인 key를 사용한다.
- props drilling이 길어지면 composition, context, custom hook 중 가장 단순한 방법을 선택한다.

## 11. 스타일 규칙

- 디자인 토큰은 중앙 CSS 변수 또는 Tailwind theme로 관리한다.
- 색상, spacing, z-index 값을 컴포넌트마다 임의로 만들지 않는다.
- 반응형 기준은 프로젝트 공통 breakpoint를 따른다.
- 접근성을 위해 button, input, label, alt, aria 속성을 신경 쓴다.
- 클릭 가능한 요소를 `div`로 만들지 않는다.

## 12. 에러와 로딩 규칙

- 로딩, 빈 상태, 에러 상태를 모든 주요 화면에 둔다.
- 에러 메시지 표시 방식은 공통 컴포넌트 또는 공통 유틸로 통일한다.
- API 실패 시 콘솔 로그만 남기고 사용자 화면을 방치하지 않는다.
- 재시도 가능한 작업과 불가능한 작업을 구분한다.
- 서버의 raw error message를 사용자에게 그대로 노출하지 않는다.
- stack trace, 내부 endpoint, token, request header, 서버 내부 사유를 화면에 표시하지 않는다.
- 인증 실패, 권한 실패, 입력 오류, 서버 장애를 사용자 메시지 레벨에서 구분한다.
- `console.log`, `console.error`에 token, password, authorization header, stream token, API response 전체를 남기지 않는다.
- 에러 boundary 또는 공통 fallback UI를 통해 화면 전체가 깨지지 않게 한다.
- 보안 스캐너가 지적할 수 있는 debug 코드, 임시 alert, 민감정보 출력은 커밋하지 않는다.

## 13. Secure Coding 규칙

입력 검증:

- 사용자 입력은 클라이언트에서 1차 검증하고 백엔드에서 최종 검증한다고 가정한다.
- email, password, keyword, owner/repo, memo 등은 길이 제한을 둔다.
- API 요청 전 명백히 잘못된 값은 보내지 않는다.
- HTML을 직접 렌더링해야 하는 경우 반드시 sanitize 정책을 먼저 둔다.

XSS 방지:

- `dangerouslySetInnerHTML`은 기본 금지한다.
- 외부 API에서 온 title, summary, url, memo는 신뢰하지 않는다.
- 사용자 입력을 HTML 문자열로 조합하지 않는다.
- 외부 링크는 필요한 경우 `rel="noopener noreferrer"`를 사용한다.

인증/토큰:

- Access Token, Refresh Token, stream token을 로그에 남기지 않는다.
- token을 URL에 넣는 것은 SSE 단기 stream token 예외 외에는 금지한다.
- 일반 Access Token을 query string에 넣지 않는다.
- localStorage/sessionStorage key는 중앙 상수로 관리한다.

API 통신:

- API base URL은 환경 변수로 관리한다.
- 인증 header 조립은 중앙 client에서만 한다.
- 에러 응답 전체를 화면에 dump하지 않는다.
- 재시도 로직은 무한 재시도가 되지 않게 제한한다.

환경 변수:

- 프론트 환경 변수에는 secret을 넣지 않는다.
- `VITE_`로 노출되는 값은 브라우저에 공개된다고 간주한다.
- API key가 필요한 호출은 백엔드를 통해 처리한다.

의존성/빌드:

- 출처가 불명확한 패키지를 추가하지 않는다.
- 패키지를 추가할 때 실제 필요성과 대체 가능성을 검토한다.
- 임시 mock, debug banner, 테스트 계정 정보는 커밋하지 않는다.

## 14. Karpathy Rule

이 프로젝트에서 말하는 Karpathy Rule은 "AI가 화면과 상태 코드를 빠르게 만들수록, 코드는 더 작고 읽기 쉬워야 한다"는 기준이다.

- clever code보다 boring code를 우선한다.
- 컴포넌트 하나가 너무 많은 일을 하지 않게 한다.
- 한 파일에 page, API 호출, token 처리, 스타일, 변환 로직을 몰아넣지 않는다.
- 작은 컴포넌트, 작은 hook, 작은 API 함수로 나눈다.
- 중복이 2번 나오면 지켜보고, 3번 나오면 공통화한다.
- 공통화는 실제 반복이 확인된 뒤 진행한다.
- 복잡한 상태 관리 라이브러리보다 현재 문제에 맞는 단순한 구조를 우선한다.
- 이름만 봐도 데이터 흐름이 보이게 한다.
- AI가 만든 코드는 사람이 브라우저에서 디버깅할 수 있어야 한다.
- 설명할 수 없는 추상화는 만들지 않는다.

## 15. AI 코드 작성 체크리스트

AI가 프론트엔드 코드를 작성하기 전 반드시 확인한다.

- TypeScript로 작성했는가?
- `any`로 타입 문제를 덮지 않았는가?
- API 호출을 컴포넌트에 직접 넣지 않았는가?
- API URL, route path, storage key를 하드코딩하지 않았는가?
- token 처리 로직이 중앙 client 밖으로 새지 않았는가?
- SSE 연결이 전용 hook에 있는가?
- 컴포넌트가 너무 많은 책임을 갖고 있지 않은가?
- 서버 상태와 클라이언트 상태를 구분했는가?
- 로딩/에러/빈 상태를 고려했는가?
- 백엔드 응답 DTO에 화면이 과하게 결합되지 않았는가?
- raw error message, token, header, 내부 endpoint를 화면이나 로그에 노출하지 않았는가?
- `dangerouslySetInnerHTML`, 임시 debug 코드, 민감정보 console 출력이 없는가?
- 입력값 길이와 형식을 최소한으로 검증했는가?
- 환경 변수에 secret을 넣지 않았는가?
- Karpathy Rule 기준으로 파일과 컴포넌트가 너무 크거나 똑똑한 척하지 않는가?

