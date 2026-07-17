# 구현 가이드

## 1. 구현 전에 확인할 문제

이번 answer는 사용자 인증 상태를 만드는 비교 기준입니다. 회원가입, 로그인, JWT 발급, JWT 검증, 보호 API 접근 흐름이 연결되어 있습니다.

```text
signup -> login -> access token issue -> JWT validation filter
-> SecurityContext -> protected API -> post ownership authorization
```

회원가입은 계정 생성이고 로그인은 자격 증명 확인입니다. 로그인은 `AuthService`에서 수동으로 처리하고, 로그인 뒤 요청의 인증과 인가는 Spring Security가 처리합니다. API 경로와 subject=email 계약은 유지합니다.

## 2. 구현 순서

먼저 `.env`의 DB 접속 정보와 `JWT_SECRET`을 준비합니다. 설정 파일은 Spring Boot가 정한 이름을 사용하므로 실습 번호를 붙이지 않습니다. 그다음 아래 파일을 번호 순서대로 구현합니다.

```text
01 dto/Step01ApiDtos.kt                    요청·응답 DTO와 입력 계약
02 domain/Step02User.kt                    email과 BCrypt 저장 계약
03 domain/Step03PostEntity.kt              게시글과 작성자 저장 계약
04 exception/Step04ApiExceptionHandling.kt ErrorResponse, 도메인 예외, 전역 handler
05 security/Step05JwtAuthentication.kt     JWT 발급·검증과 인증 Filter
06 service/Step06AuthService.kt            회원가입, 로그인, 현재 사용자 조회
07 security/Step07SecurityConfig.kt         공개/보호 경계, Clock, Security 401/403
08 service/Step08PostService.kt             게시글 작성자 저장과 ownership 인가
```

번호는 실습에서만 사용하는 탐색 순서입니다. package와 class 이름은 그대로 유지하므로 운영 코드의 계층 구조와 Spring component scan은 바뀌지 않습니다. Controller와 Repository는 연결 코드, 테스트는 검증 코드이므로 번호를 붙이지 않습니다. Step08까지 구현한 뒤 실제 signup/login token을 포함한 전체 테스트를 실행합니다.

## 3. Step01-03. 입력과 저장 계약

### 해야 할 일

`Step01ApiDtos.kt`의 Validation 범위와 `Step02User.kt`, `Step03PostEntity.kt`의 DB column 범위를 맞춥니다.

### 왜 이 작업을 하는가

검증만으로 막은 값이 DB에서 잘리거나, DB가 허용하지 않는 값을 DTO가 받으면 계층 계약이 어긋납니다. JWT secret은 코드에 둘 수 없는 운영 민감값입니다.

### 확인 방법

- `JWT_SECRET`이 필수이고 UTF-8 기준 32바이트 미만이면 시작이 실패하는지 확인합니다.
- `JWT_EXPIRATION_MS` 기본값이 3,600,000ms인지 확인합니다.
- email 254자, password 8~64자, title 100자, content 5000자 계약에 `@field:`가 적용됐는지 확인합니다.
- login password에는 최소 길이를 강제하지 않고 최대 64자만 제한하는지 확인합니다.
- `User.email` unique 제약과 길이, BCrypt 저장 길이, `PostEntity` 길이가 H2/MySQL에서 맞는지 확인합니다.

## 4. Step04. 오류 응답 계약

### 해야 할 일

Validation 실패와 Service의 도메인 예외를 `ErrorResponse(code, message, errors)`와 올바른 HTTP status로 바꿉니다.

### 왜 이 작업을 하는가

Service가 DB나 보안 라이브러리 내부 오류를 그대로 노출하면 클라이언트가 실패 원인을 안정적으로 처리할 수 없습니다. request body, method parameter, malformed JSON도 서로 구분하되 같은 기본 응답 문법을 사용해야 합니다.

### 오류 매핑

| 상황 | 상태 | code |
|---|---:|---|
| request body / method parameter validation | 400 | `VALIDATION_ERROR` |
| malformed JSON | 400 | `MALFORMED_JSON` |
| 중복 회원가입 | 409 | `USER_ALREADY_EXISTS` |
| 로그인 자격 증명 실패 | 401 | `INVALID_CREDENTIALS` |
| 보호 API 인증 실패 | 401 | `UNAUTHORIZED` |
| 게시글 ownership 부족 | 403 | `FORBIDDEN_POST_ACCESS` |
| Spring Security 접근 거부 | 403 | `ACCESS_DENIED` |
| 게시글 없음 | 404 | `POST_NOT_FOUND` |

같은 필드에 여러 Validation 오류가 생기면 `NotBlank -> Email -> Size` 우선순위로 첫 오류만 결정적으로 남깁니다. Filter 단계의 401/403은 MVC 전역 handler에 도달하지 않으므로 Step07에서 같은 `ErrorResponse`를 별도로 직렬화합니다.

## 5. Step05. JWT 발급·검증과 Filter

### 해야 할 일

`JwtTokenProvider`에서 token을 발급·검증하고, `JwtAuthenticationFilter`에서 검증된 subject만 `SecurityContext`로 옮깁니다.

### 왜 이 작업을 하는가

발급은 HS256을 명시하고 `issuedAt`, `expiration`, issuer, audience, subject를 넣습니다. 검증 함수는 JWT를 한 번 파싱해 서명, 만료, issuer, audience, HS256과 필수 claim을 확인한 뒤 검증된 subject만 반환합니다. `Clock`을 주입해 시간 테스트가 실제 대기를 요구하지 않게 합니다.

### 확인 방법

- `JwtException`과 토큰 인자 관련 `IllegalArgumentException`만 잘못된 토큰으로 처리하는지 확인합니다.
- 정상, 변조, 만료, issuer 불일치, audience 불일치 테스트를 확인합니다.
- 기존 Authentication을 덮어쓰지 않고 요청마다 빈 `SecurityContext`를 만드는지 확인합니다.
- Bearer prefix가 없거나 token이 공백이면 인증을 만들지 않는지 확인합니다.
- 현재 subject=email이 학습용 단순화이며 운영에서는 불변 userId를 권장함을 설명합니다.

## 6. Step06. 회원가입·로그인 서비스

### 해야 할 일

`AuthService`에서 회원가입을 안전하게 저장하고 로그인 요청을 검증해 JWT를 발급하는 흐름을 연결합니다.

### 왜 이 작업을 하는가

email은 `lowercase(Locale.ROOT)`로 일관되게 정규화해야 합니다. 중복 사전 조회만으로는 동시 요청 경쟁을 막을 수 없으므로 DB unique 제약과 저장 예외 변환도 필요합니다. signup은 계정 생성이고 login은 자격 증명 확인 뒤 token을 발급하는 별도 작업입니다.

### 확인 방법

- `existsByEmail()`이 비용이 큰 BCrypt encode보다 먼저 호출되는지 확인합니다.
- password가 trim되지 않고 그대로 encode/matches에 전달되는지 확인합니다.
- signup이 transaction 안에서 `saveAndFlush()`하고 email unique 종류의 `DataIntegrityViolationException`만 409로 바꾸는지 확인합니다.
- 없는 email과 잘못된 password가 같은 code/message로 실패하는지 확인합니다.
- 로그인 응답에 `accessToken`, `tokenType="Bearer"`, 초 단위 `expiresIn`과 `Cache-Control: no-store`가 있는지 확인합니다.
- Filter가 만든 principal로 `/auth/me`가 현재 email을 반환하는지 확인합니다.

## 7. Step07. Security 요청 경계

### 해야 할 일

`SecurityConfig`에서 공개/보호 API를 구분하고 Step05 Filter와 Security 전용 401/403 handler를 연결합니다.

### 왜 이 작업을 하는가

회원가입, 로그인과 게시글 GET은 token 없이 접근 가능해야 하고, `/auth/me`와 게시글 변경은 인증 후 접근해야 합니다. Filter는 Controller보다 먼저 실행되어야 보호 API가 principal을 신뢰할 수 있습니다.

### 확인 방법

- 변조·만료 token이 있는 보호 API는 401인지 확인합니다.
- 잘못된 Authorization이 있는 공개 API는 헤더를 무시하고 공개 상태로 처리하는지 확인합니다.
- 401에 `WWW-Authenticate: Bearer`가 있고 401/403 모두 `ErrorResponse` JSON인지 확인합니다.
- authorities는 비어 있고 Role 인가는 이번 범위가 아님을 확인합니다.
- Bearer header 기반 Access Token only 구조와 CSRF 비활성화의 전제를 설명합니다.

## 8. Step08. 게시글 소유권 인가

### 해야 할 일

인증된 principal을 게시글 작성자로 저장하고 수정·삭제 전에 현재 사용자와 저장된 작성자를 비교합니다.

### 왜 이 작업을 하는가

Authentication은 요청자가 누구인지 확인할 뿐 어떤 게시글을 변경할 수 있는지까지 결정하지 않습니다. 따라서 인증 정보가 없으면 401, 인증됐지만 작성자가 아니면 403으로 구분합니다.

### 확인 방법

- 게시글 GET은 공개 상태로 유지되는지 확인합니다.
- 작성 요청의 author를 body가 아니라 검증된 principal에서 가져오는지 확인합니다.
- 작성자와 비작성자의 PUT/DELETE가 각각 성공과 403으로 나뉘는지 확인합니다.
- 없는 게시글은 Step04의 `POST_NOT_FOUND` 404로 반환되는지 확인합니다.

## 9. 실행과 회귀 확인

```bash
docker compose up -d
export JWT_SECRET='local-dev-only-jwt-secret-change-me-123456'
./gradlew bootRun
```

로컬 MySQL은 다른 기본 설치와 충돌하지 않도록 host `3307`에 열리고, 애플리케이션 기본 URL도 `jdbc:mysql://localhost:3307/aandi_lab`을 사용합니다. 다른 DB를 사용할 때는 `DB_URL`을 지정합니다.

Swagger UI:

```text
http://localhost:8080/swagger
```

브라우저에서 `http://localhost:8080`을 열면 인증 실습 화면으로 이동합니다. `/auth-practice`와 `/auth-practice/`도 같은 화면으로 이동합니다. email과 password를 직접 입력해 `회원가입 -> 로그인 -> /auth/me`를 한 화면에서 확인하고, 로그인 후 표시되는 email이 입력한 계정과 같은지 확인합니다. 로그인 응답의 Access Token 전체 값은 화면에서 선택하거나 복사할 수 있으며, `Header.Payload.Signature` 구조와 실제 `Authorization: Bearer <token>` 사용 경로를 함께 보여줍니다. 로컬 실습용 token만 jwt.io의 Encoded 칸에 직접 붙여넣어 구조를 확인하고, 운영 token과 `JWT_SECRET`은 입력하지 않습니다. Access Token은 페이지 메모리에만 있으므로 새로고침하면 다시 로그인해야 합니다.

jwt.io에서 내용을 decode한 결과와 서버가 token을 유효하다고 판단하는 것은 다릅니다. 실제 유효성은 보호 요청의 `JwtAuthenticationFilter`가 서명, 만료, issuer, audience를 검증해 결정합니다.

테스트:

```bash
./gradlew test
```

테스트에는 회원가입/로그인 Validation과 오류, 실제 signup -> login 응답 token -> `/auth/me`, JWT 서명·만료·issuer·audience, 게시글 공개 조회/인증 작성/작성자와 비작성자의 수정·삭제가 포함되어야 합니다.

### 운영 전 데이터 진단

신규 H2/MySQL 스키마가 정상 생성되는 것과 기존 운영 데이터 migration이 안전한 것은 다른 문제입니다. 기존 DB가 있다면 변경 전에 아래 진단부터 실행합니다.

```sql
-- 소문자 정규화 시 하나의 email로 충돌할 계정을 찾습니다.
SELECT LOWER(email) AS normalized_email, COUNT(*) AS account_count
FROM users
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- 새 DTO/column 길이 계약을 넘는 기존 행을 찾습니다.
SELECT id, CHAR_LENGTH(email) AS email_length
FROM users
WHERE CHAR_LENGTH(email) > 254;

SELECT id, CHAR_LENGTH(password) AS password_length
FROM users
WHERE CHAR_LENGTH(password) > 100;

SELECT id,
       CHAR_LENGTH(title) AS title_length,
       CHAR_LENGTH(content) AS content_length,
       CHAR_LENGTH(author) AS author_length
FROM posts
WHERE CHAR_LENGTH(title) > 100
   OR CHAR_LENGTH(content) > 5000
   OR CHAR_LENGTH(author) > 254;
```

충돌과 초과 데이터를 먼저 해결한 뒤 별도 migration으로 column과 unique index를 변경합니다. 기존 `users.email`을 소문자화한다면 ownership 비교가 끊기지 않도록 연결된 `posts.author`도 같은 계정 매핑과 transaction에서 함께 변경합니다. 이 시퀀스에는 Flyway/Liquibase나 자동 일괄 email 변경을 추가하지 않습니다.

운영 실행 값은 다음처럼 학습 기본값과 분리합니다.

```bash
# 실제 값은 배포 환경의 secret/configuration store에서 주입합니다.
export DB_URL='jdbc:mysql://db-host:3306/aandi_lab'
export DB_USERNAME='app_user'
export DB_PASSWORD='<managed-secret>'
export JWT_SECRET='<managed-secret-at-least-32-bytes>'
export JWT_ISSUER='aandi-production'
export JWT_AUDIENCE='aandi-api'
export JPA_DDL_AUTO='validate'
export SPRINGDOC_ENABLED='false'
```

## 마지막 확인

- 회원가입과 로그인 흐름을 설명합니다.
- 토큰 발급과 검증 위치를 구분합니다.
- 공개 API, 보호 API와 게시글 ownership 인가를 구분합니다.
- JWT payload가 암호화된 비밀 영역이 아님을 설명합니다.
- 현재 구현이 Access Token only이고 Refresh Token/Redis를 추가하지 않았습니다.
- OAuth2, SMTP, 비밀번호 재설정, AuthenticationManager 전환으로 범위를 확장하지 않았습니다.
- 브라우저 쿠키 저장으로 바꿀 때 CSRF 정책을 다시 검토해야 함을 설명합니다.
- 기존 데이터 진단과 명시적 DB migration이 신규 스키마 smoke test와 다른 검증임을 설명합니다.

<details>
<summary>멘토용 진행 포인트</summary>

- starter와 비교할 때 AuthService, JwtAuthentication의 provider와 filter, SecurityConfig 순서로 확인합니다.
- 힌트가 필요하면 로그인 응답, Authorization header, filter 검증 순서로 좁혀갑니다.
- 다음 OAuth2 시퀀스로 넘어가기 전 자체 JWT의 역할을 설명하게 합니다.

</details>
