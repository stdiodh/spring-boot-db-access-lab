# 체크리스트

## 1. 시작 범위와 설정

- [ ] 직접 수정하는 파일은 `Step01ApiDtos.kt`부터 `Step08PostService.kt`까지입니다.
- [ ] 제공된 Controller, Repository, 설정 연결 코드와 테스트가 Step01~08의 TODO와 같은 계약을 사용한다는 점을 확인했습니다.
- [ ] 테스트 코드나 기대값을 바꾸지 않고 TODO를 구현합니다.
- [ ] `JWT_SECRET`을 환경 변수로 전달하고 실제 값이나 `.env`를 커밋하지 않습니다.
- [ ] `JWT_SECRET`은 UTF-8 기준 32바이트 이상입니다.
- [ ] `JWT_EXPIRATION_MS` 기본값은 3,600,000ms이고 issuer와 audience 설정을 확인합니다.

## 2. Step01~04 입력·저장·오류 계약

- [ ] 회원가입 email은 빈 값, 형식, 254자 제한을 검증합니다.
- [ ] 회원가입 password는 빈 값과 8~64자 제한을 검증하며 trim하지 않습니다.
- [ ] 로그인 email은 같은 email 계약, password는 빈 값과 64자 제한을 검증합니다.
- [ ] 게시글 title은 빈 값과 100자, content는 빈 값과 5000자 제한을 검증합니다.
- [ ] Kotlin 제약 조건에 `@field:` use-site target을 적용합니다.
- [ ] `TokenResponse`가 `accessToken`, `tokenType="Bearer"`, 초 단위 `expiresIn`을 제공합니다.
- [ ] DTO 최대 길이와 Entity의 email/password/title/content/author 저장 범위가 일치합니다.
- [ ] `User.email`의 unique 제약을 유지합니다.
- [ ] `PostEntity.isWrittenBy()`가 저장된 author와 전달받은 email을 비교합니다.
- [ ] 같은 field의 여러 오류 중 첫 오류가 결정적으로 선택됩니다.
- [ ] body Validation, method parameter Validation, malformed JSON 실패를 구분된 400으로 변환합니다.
- [ ] 400, 401, 403, 404, 409가 공통 `ErrorResponse(code, message, errors)` 기본 구조를 사용합니다.

## 3. Step05 JWT와 Filter

- [ ] JWT를 HS256으로 발급하고 subject=email, `issuedAt`, `expiration`, issuer, audience를 포함합니다.
- [ ] 발급·만료 시각은 주입된 `Clock`을 사용합니다.
- [ ] `getValidatedSubject()`가 토큰을 한 번만 파싱해 검증과 subject 조회를 함께 끝냅니다.
- [ ] 변조, 만료, issuer 불일치, audience 불일치, HS256 이외 알고리즘을 거부합니다.
- [ ] `JwtException`과 토큰 인자 관련 `IllegalArgumentException`만 인증 실패로 처리합니다.
- [ ] Bearer prefix가 없거나 실제 token이 비어 있으면 인증을 만들지 않습니다.
- [ ] 기존 Authentication을 덮어쓰지 않습니다.
- [ ] 검증된 subject에만 요청별 새 빈 `SecurityContext`와 Authentication을 설정합니다.

## 4. Step06 회원가입·로그인

- [ ] 가입, 로그인, 현재 사용자 조회의 email을 `lowercase(Locale.ROOT)`로 정규화합니다.
- [ ] password는 앞뒤 공백도 자격 정보로 취급해 trim하지 않습니다.
- [ ] `existsByEmail()`을 비용이 큰 BCrypt encode보다 먼저 호출합니다.
- [ ] 비밀번호 원문을 저장하지 않고 `PasswordEncoder.encode()` 결과를 저장합니다.
- [ ] signup을 쓰기 transaction 안에서 처리합니다.
- [ ] `saveAndFlush()`로 DB unique 경쟁을 transaction 안에서 확인합니다.
- [ ] email unique 종류의 `DataIntegrityViolationException`만 중복 가입 409로 바꾸고 다른 무결성 오류는 숨기지 않습니다.
- [ ] 없는 email과 잘못된 password 로그인이 같은 code/message의 401로 실패합니다.
- [ ] 로그인 성공 후 JWT와 provider의 초 단위 만료 시간을 `TokenResponse`로 반환합니다.
- [ ] 제공된 Controller의 로그인 응답에 `Cache-Control: no-store`가 있습니다.
- [ ] Filter가 확인한 principal로 `/auth/me`가 같은 email을 반환합니다.

## 5. Step07~08 인증·인가 경계

- [ ] 회원가입, 로그인, 학습 화면과 게시글 GET은 공개됩니다.
- [ ] `/auth/me`와 게시글 POST/PUT/DELETE는 인증이 필요합니다.
- [ ] JWT Filter가 `UsernamePasswordAuthenticationFilter`보다 먼저 실행됩니다.
- [ ] 보호 API의 401은 공통 `ErrorResponse` JSON과 `WWW-Authenticate: Bearer`를 반환합니다.
- [ ] Spring Security의 403도 공통 `ErrorResponse` JSON을 반환합니다.
- [ ] authorities는 비어 있고 Role 기반 인가를 추가하지 않습니다.
- [ ] 게시글 작성자는 request body가 아니라 인증된 principal에서 가져옵니다.
- [ ] Step08의 `validateAuthor()`가 Step03의 `isWrittenBy()`를 호출합니다.
- [ ] 수정은 값을 바꾸기 전, 삭제는 Entity를 지우기 전에 같은 작성자 검사를 통과합니다.
- [ ] 작성자가 아닌 사용자의 수정·삭제는 403으로 실패합니다.

## 6. 실패 케이스 확인

- [ ] 잘못된 email과 경계를 넘는 입력이 400으로 실패합니다.
- [ ] 읽을 수 없는 JSON이 400으로 실패합니다.
- [ ] 사전 조회에서 발견한 중복 회원가입이 409로 실패합니다.
- [ ] 동시에 저장된 DB unique 중복도 같은 409로 실패합니다.
- [ ] 토큰 없음, 빈 Bearer, 변조 token, 만료 token은 보호 API에서 401입니다.
- [ ] issuer 또는 audience가 다른 token은 보호 API에서 401입니다.
- [ ] 잘못된 Authorization header가 있는 공개 API는 인증을 만들지 않고 정상 처리됩니다.
- [ ] 게시글 없음은 404입니다.
- [ ] 인증된 비작성자의 게시글 변경은 JSON 403입니다.

## 7. 테스트 완료 기준

- [ ] 시작 상태에서 TODO에 해당하는 테스트가 실패하는 것을 확인합니다.
- [ ] 테스트 실패를 테스트 수정이나 기대값 완화로 숨기지 않습니다.
- [ ] DTO·오류, 회원가입·로그인, JWT, Filter, Security, 게시글 소유권 테스트를 모두 확인합니다.
- [ ] 실제 `signup -> login 응답 token -> /auth/me` 통합 흐름이 성공합니다.
- [ ] 제공된 60개 테스트를 수정하지 않고 `./gradlew test`가 통과합니다.
- [ ] 인증 실습 화면에서 계정을 만들고 로그인해 `/auth/me`가 같은 email을 반환하는지 확인합니다.
- [ ] `/auth/me` 성공 뒤 게시물 입력 영역이 열리고 Bearer token으로 `POST /posts` 201을 확인합니다.
- [ ] 게시물 작성자 입력칸 없이 응답의 `author`가 검증된 Principal email과 같은지 확인합니다.
- [ ] 공개 `GET /posts` 목록은 로그인 없이 조회할 수 있습니다.
- [ ] `/swagger` redirect 뒤 `/swagger-ui/**` 자산과 `/v3/api-docs/**` 설정이 인증 없이 열립니다.
- [ ] 실습 화면에서 5xx 응답이 나오면 서버 로그를 먼저 확인한 뒤 관련 Step의 TODO를 확인합니다.

## 8. 설명할 수 있어야 하는 것

- [ ] Validation 실패와 인증 실패의 차이
- [ ] 회원가입과 로그인의 차이
- [ ] 수동 로그인과 Spring Security 요청 인증·인가의 경계
- [ ] 401 인증 실패와 403 권한·소유권 부족의 차이
- [ ] JWT 발급 위치와 `getValidatedSubject()` 단일 파싱 검증 위치
- [ ] issuer, audience, `Clock`이 필요한 이유
- [ ] `TokenResponse` 세 필드와 `Cache-Control: no-store`의 의미
- [ ] Bearer token 형식과 JWT payload가 암호화된 비밀 영역이 아니라는 점
- [ ] Security Filter가 Controller보다 먼저 동작하는 이유
- [ ] `isWrittenBy()`와 `validateAuthor()`가 표현하는 소유권 정책
- [ ] 공개 API와 보호 API의 차이

## 9. 남은 한계와 다음 시퀀스 연결

- [ ] 이번 시퀀스는 자체 회원가입/로그인과 Access Token only JWT에 집중합니다.
- [ ] Refresh Token과 Redis 기반 토큰 저장은 이번 범위 밖입니다.
- [ ] OAuth2, SMTP, 계정 복구는 다음 시퀀스에서 다룹니다.
- [ ] 현재 subject=email은 학습용 단순화이며 운영에서는 불변 userId를 권장합니다.
- [ ] 브라우저 쿠키 인증으로 바꾸면 CSRF 정책을 다시 검토해야 합니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- 통과 기준: 멘티가 signup, login, token issue, single-parse validation, SecurityContext, protected API, ownership 흐름을 설명합니다.
- 보완 필요 기준: 토큰 발급만 보고 Filter 검증, JSON 401/403 또는 게시글 소유권 흐름을 설명하지 못합니다.
- 질문 예시: "이 요청은 Controller에 도달하기 전에 어떤 필터를 지나고, 작성자 권한은 어디에서 판단하나요?"
- 비교 포인트: `Step05JwtAuthentication.kt`, `Step06AuthService.kt`, `Step07SecurityConfig.kt`, `Step03PostEntity.kt`, `Step08PostService.kt` 순서로 봅니다.
- 60개 테스트 실패를 구현 위치를 찾는 단서로 사용하고, 테스트를 변경해 통과시키지 않게 합니다.

</details>
