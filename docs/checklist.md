# 체크리스트

## 1. 기능 확인

- [ ] 회원가입은 계정을 만들고 201을 반환합니다.
- [ ] 로그인은 저장된 자격 증명을 확인하고 Access Token을 발급합니다.
- [ ] 로그인 응답에 기존 `accessToken`, `tokenType="Bearer"`, 초 단위 `expiresIn`이 있습니다.
- [ ] 로그인 응답에 `Cache-Control: no-store`가 있습니다.
- [ ] 실제 signup -> login 응답 token -> `/auth/me` 흐름이 성공합니다.
- [ ] 인증 실습 화면에서 직접 계정을 만들고 로그인한 뒤 `/auth/me`가 같은 email을 반환하는지 확인했습니다.
- [ ] `/`, `/auth-practice`, `/auth-practice/`가 인증 실습 화면으로 이동합니다.
- [ ] 게시글 GET은 공개되고 POST/PUT/DELETE는 인증이 필요합니다.
- [ ] 작성자가 게시글을 수정/삭제할 수 있고 비작성자는 403을 받습니다.

## 2. 코드 구조 확인

- [ ] DTO 모델, API 예외, JWT 인증, Security 설정이 각각 네 개의 실습 파일에 모여 있습니다.
- [ ] answer의 실습 구현 위 주석이 문법을 반복하지 않고 해당 검사가 필요한 이유를 설명합니다.
- [ ] `JWT_SECRET`은 필수 환경 변수이며 소스나 `.env`에 실제 값이 없습니다.
- [ ] secret이 UTF-8 기준 32바이트 미만이면 시작 시 명확히 실패합니다.
- [ ] `JWT_EXPIRATION_MS` 기본값은 3,600,000ms입니다.
- [ ] DTO Validation에 Kotlin `@field:`와 email/password/title/content 길이 제한이 있습니다.
- [ ] DB email unique/254자, BCrypt hash, title 100자, content 5000자 저장 계약이 DTO와 맞습니다.
- [ ] email은 `Locale.ROOT`로 소문자화하고 password는 trim하지 않습니다.
- [ ] `existsByEmail`이 BCrypt encode보다 먼저 실행됩니다.
- [ ] signup은 transaction 안에서 unique 경쟁을 409 예외로 변환합니다.
- [ ] `JwtTokenProvider`가 HS256, issuer, audience, issuedAt, expiration을 발급/검증합니다.
- [ ] 토큰 검증과 subject 조회가 한 번의 parsing으로 끝납니다.
- [ ] `Clock`을 주입해 만료를 대기 없이 테스트합니다.
- [ ] `JwtAuthenticationFilter`가 기존 Authentication을 덮어쓰지 않습니다.
- [ ] 유효한 subject에만 새 빈 `SecurityContext`와 Authentication을 설정합니다.
- [ ] `SecurityConfig`가 공개 API와 보호 API를 구분합니다.
- [ ] authorities는 비어 있고 Role 기반 인가를 추가하지 않았습니다.

## 3. 실패 케이스 확인

- [ ] 중복 회원가입은 사전 조회와 DB unique 경쟁 모두 409입니다.
- [ ] 잘못된/빈/너무 긴 email과 짧거나 너무 긴 signup password는 400입니다.
- [ ] 없는 email과 잘못된 password 로그인은 같은 code/message의 401입니다.
- [ ] body Validation, method parameter Validation, malformed JSON을 각각 400으로 처리합니다.
- [ ] 같은 필드의 여러 Validation 오류는 `associate` 덮어쓰기 없이 첫 오류를 결정적으로 선택합니다.
- [ ] 토큰 없음, 빈 Bearer, 변조 token, 만료 token은 보호 API에서 401입니다.
- [ ] 보호 API의 401에는 `WWW-Authenticate: Bearer`가 있습니다.
- [ ] Security의 403도 `ErrorResponse` JSON이며 ownership 403 흐름은 유지됩니다.
- [ ] 잘못된 Authorization header가 있는 공개 API는 인증을 만들지 않고 정상 처리됩니다.
- [ ] 게시글 없음은 404입니다.

## 4. 설명할 수 있어야 하는 것

- [ ] 회원가입은 계정 생성이고 로그인과 다르다는 점
- [ ] 수동 로그인 처리와 Spring Security 요청 인증/인가의 경계
- [ ] Authentication은 신원 확인, Authorization은 접근 가능 여부 판단이라는 점
- [ ] 401은 인증 실패, 403은 인증된 사용자의 권한 또는 소유권 부족이라는 점
- [ ] JWT 발급 위치와 검증 위치
- [ ] Bearer token 형식
- [ ] JWT payload는 암호화된 비밀 영역이 아니라는 점
- [ ] subject=email은 교육용 단순화이고 운영에서는 불변 userId를 권장한다는 점
- [ ] Security filter가 Controller보다 먼저 동작하는 이유
- [ ] 공개 API와 보호 API의 차이

## 5. 남은 한계와 다음 시퀀스 연결

- [ ] 현재 구현은 Access Token only입니다.
- [ ] Refresh Token과 Redis는 이번 범위 밖입니다.
- [ ] OAuth2, SMTP, 비밀번호 재설정을 구현하지 않았습니다.
- [ ] AuthenticationManager 기반으로 구조를 전환하지 않았습니다.
- [ ] Role 인가는 없고 `authenticated`와 게시글 ownership만 다룹니다.
- [ ] JWT를 브라우저 쿠키에 저장한다면 CSRF 정책을 다시 검토합니다.

## 6. 테스트 확인

- [ ] Docker MySQL host port와 기본 DB URL이 로컬 `3307`로 일치하고 `DB_URL` 재정의도 유지됩니다.
- [ ] 회원가입 성공/중복/Validation과 잘못된 JSON 통합 테스트가 통과합니다.
- [ ] 로그인 성공 응답과 두 종류의 로그인 실패 통합 테스트가 통과합니다.
- [ ] `/auth/me`의 없음/정상/변조/만료/빈 Bearer 테스트가 통과합니다.
- [ ] JWT subject/signature/expiration/issuer/audience 단위 테스트가 통과합니다.
- [ ] 게시글 공개 GET, 비인증 POST, 작성자 저장, 작성자/비작성자 PUT·DELETE 테스트가 통과합니다.
- [ ] `./gradlew test` 전체가 통과합니다.

## 7. 운영 배포 확인

- [ ] 실제 `.env`와 secret 값이 Git에 포함되지 않았습니다.
- [ ] 운영 DB 접속 정보는 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`로 주입합니다.
- [ ] `LOWER(email)` 기준 충돌과 email/password/title/content/author 길이 초과 행을 조사했습니다.
- [ ] 데이터 충돌을 해결한 뒤 명시적 DB migration을 적용했습니다.
- [ ] `users.email`을 정규화할 때 연결된 `posts.author`도 같은 계정 매핑으로 함께 변경했습니다.
- [ ] 운영에서는 `JPA_DDL_AUTO=validate` 또는 `none`을 사용합니다.
- [ ] 운영에서는 `SPRINGDOC_ENABLED=false`로 Swagger/OpenAPI를 닫습니다.
- [ ] 환경별 `JWT_ISSUER`와 `JWT_AUDIENCE`를 고정했습니다.
- [ ] single-key secret 교체가 기존 token 전체를 무효화한다는 점을 운영 절차에 반영했습니다.
- [ ] Access Token only의 즉시 회수 불가를 TTL과 재인증 정책에 반영했습니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- 통과 기준: 멘티가 answer 구현을 보고 signup, login, token issue, filter validation, protected API 흐름을 설명합니다.
- 보완 필요 기준: 토큰 발급만 보고 보호 API 검증 흐름을 설명하지 못합니다.
- 질문 예시: "이 요청은 Controller에 도달하기 전에 어떤 필터를 지나나요?"
- 비교 포인트: starter 구현과 answer 구현의 차이를 AuthService, JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig 순서로 봅니다.

</details>
