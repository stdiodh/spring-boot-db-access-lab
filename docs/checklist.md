# 체크리스트

## 1. 03 Validation 다시 구현

- [ ] 회원가입 email은 빈 값, 형식, 254자 제한을 검증합니다.
- [ ] 회원가입 password는 빈 값과 8~64자 제한을 검증하며 trim하지 않습니다.
- [ ] 로그인 email과 password의 입력 계약을 검증합니다.
- [ ] 게시글 title은 빈 값과 100자, content는 빈 값과 5000자 제한을 검증합니다.
- [ ] Kotlin 제약 조건이 field에 적용됩니다.
- [ ] 같은 field의 여러 오류 중 첫 오류가 결정적으로 선택됩니다.
- [ ] body, method parameter, malformed JSON 실패가 구분된 400 응답을 만듭니다.
- [ ] DTO 최대 길이와 Entity의 email/password/title/content/author 저장 범위가 일치합니다.

## 2. 기능 확인

- [ ] 회원가입 요청이 성공합니다.
- [ ] 로그인 성공 시 JWT가 발급됩니다.
- [ ] 잘못된 로그인 요청이 실패합니다.
- [ ] 보호 API는 토큰 없이 접근할 수 없습니다.
- [ ] 게시글 작성자는 요청 body가 아니라 인증된 사용자 정보로 저장됩니다.
- [ ] 수정·삭제 전 저장된 작성자와 인증된 사용자를 비교합니다.
- [ ] 작성자가 아닌 사용자의 수정·삭제는 403으로 실패합니다.
- [ ] 인증 TODO를 완성한 뒤 인증 실습 화면에서 계정을 만들고 로그인해 `/auth/me`가 같은 email을 반환하는지 확인합니다.
- [ ] 실습 화면에서 5xx 응답이 나오면 원인을 단정하지 않고 서버 로그를 먼저 확인한 뒤, 현재 단계의 `RequestValidation.kt`, `ApiExceptionHandling.kt`, `AuthService.kt`, `JwtAuthentication.kt` TODO를 확인합니다.
- [ ] `./gradlew test`가 통과합니다.

## 3. 코드 구조 확인

- [ ] `RequestValidation.kt` 한 파일에서 네 요청 DTO의 입력 계약을 확인합니다.
- [ ] `ApiExceptionHandling.kt` 한 파일에서 예외 타입과 응답 변환 흐름을 확인합니다.
- [ ] `AuthService`가 회원가입과 로그인 흐름을 담당합니다.
- [ ] `JwtAuthentication.kt` 안의 `JwtTokenProvider`가 토큰 발급과 검증 책임을 갖습니다.
- [ ] 같은 파일의 `JwtAuthenticationFilter`가 요청 토큰을 인증 정보로 바꿉니다.
- [ ] `SecurityConfig`가 공개 API와 보호 API를 구분합니다.
- [ ] `PostService`가 저장된 작성자와 인증된 사용자의 소유권을 비교합니다.
- [ ] JWT secret을 환경 변수로 전달하고 실제 값이나 `.env` 파일을 커밋하지 않습니다.

## 4. 실패 케이스 확인

- [ ] 잘못된 email과 경계를 넘는 입력이 400으로 실패합니다.
- [ ] 읽을 수 없는 JSON이 400으로 실패합니다.
- [ ] 중복 회원가입이 실패합니다.
- [ ] 잘못된 비밀번호 로그인이 실패합니다.
- [ ] 토큰이 없는 보호 API 요청이 실패합니다.
- [ ] 잘못된 토큰 요청이 실패합니다.

## 5. 설명할 수 있어야 하는 것

- [ ] Validation 실패와 인증 실패의 차이
- [ ] 인증과 인가의 차이
- [ ] JWT 발급 위치와 검증 위치
- [ ] Bearer token 형식
- [ ] Security filter가 Controller보다 먼저 동작하는 이유
- [ ] 공개 API와 보호 API의 차이

## 6. 남은 한계와 다음 시퀀스 연결

- [ ] 이번 시퀀스는 자체 회원가입/로그인과 JWT에 집중합니다.
- [ ] OAuth2, SMTP, 계정 복구는 다음 시퀀스에서 다룹니다.
- [ ] Redis 기반 토큰 저장이나 refresh token 고급 전략은 이번 범위 밖입니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- 통과 기준: 멘티가 signup, login, token issue, filter validation, protected API 흐름을 설명합니다.
- 보완 필요 기준: 토큰 발급만 보고 보호 API 검증 흐름을 설명하지 못합니다.
- 질문 예시: "이 요청은 Controller에 도달하기 전에 어떤 필터를 지나나요?"
- 비교 포인트: 리뷰 단계에서는 AuthService, JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig를 순서대로 봅니다.

</details>
