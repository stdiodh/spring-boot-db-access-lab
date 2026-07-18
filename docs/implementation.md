# 구현 가이드

## 1. 구현 전에 확인할 문제

이번 구현은 03에서 배운 입력 검증을 인증 요청에 다시 연결한 뒤 사용자 인증 상태와 게시글 소유권 인가를 만드는 작업입니다. Validation, 회원가입, 로그인, JWT 발급, JWT 검증, 보호 API 접근 흐름을 차례로 연결합니다.

```text
input validation -> signup -> login -> token issue -> token validation
-> SecurityContext -> protected API -> ownership authorization
```

직접 수정할 범위는 `Step01`부터 `Step08`까지입니다. 제공된 Controller, Repository, 설정 연결 코드와 58개 테스트는 이 여덟 파일이 완성해야 할 동일한 API·보안 계약을 사용합니다. 시작 상태에서는 TODO 때문에 핵심 테스트가 실패합니다. 테스트 코드나 기대값을 바꾸지 말고 실패한 테스트가 가리키는 Step의 TODO를 구현합니다.

## 2. 구현 순서

파일명의 `Step01`부터 `Step08`까지 순서대로 따라갑니다. 번호는 실습용 탐색 표시이므로 새 파일을 만들지 말고 각 파일의 TODO를 완성합니다.

1. `dto/Step01ApiDtos.kt`에서 네 요청 DTO의 03 Validation과 로그인 응답 계약을 완성합니다.
2. `domain/Step02User.kt`에서 사용자 저장 제약을 입력 계약과 맞춥니다.
3. `domain/Step03PostEntity.kt`에서 게시글 저장 제약과 소유권 판단을 완성합니다.
4. `exception/Step04ApiExceptionHandling.kt`에서 Validation과 API 예외 응답을 연결합니다.
5. `security/Step05JwtAuthentication.kt`에서 JWT 발급·단일 파싱 검증과 인증 필터를 연결합니다.
6. `service/Step06AuthService.kt`에서 회원가입, 중복 경쟁 처리와 로그인 흐름을 연결합니다.
7. `security/Step07SecurityConfig.kt`에서 공개·보호 API와 JSON 401/403을 구분합니다.
8. `service/Step08PostService.kt`에서 Step03의 소유권 판단을 변경 작업에 적용합니다.

## 3. Step 01. 요청 DTO Validation

### 해야 할 일

- 회원가입 email은 빈 값·이메일 형식·254자 제한, password는 빈 값·8~64자 제한을 적용합니다.
- 로그인 email은 같은 email 계약, password는 빈 값·64자 제한을 적용합니다.
- 게시글 title은 빈 값·100자 제한, content는 빈 값·5000자 제한을 적용합니다.
- Kotlin 제약 조건에는 field use-site target을 사용하고 password는 trim하지 않습니다.
- `TokenResponse`는 기존 `accessToken`과 `tokenType="Bearer"`, 초 단위 `expiresIn`을 제공합니다.

### 왜 이 작업을 하는가

회원가입과 로그인은 공개 API입니다. 입력 경계를 닫지 않으면 잘못된 값이 저장·인증 로직까지 흘러가고, 인증 실패와 입력 실패가 같은 문제처럼 보입니다.

### 확인 방법

- 각 제약 조건이 Kotlin field에 적용됐는지 확인합니다.
- password를 정규화하거나 trim하는 코드가 없는지 확인합니다.
- 로그인 응답 DTO의 세 필드와 단위가 제공된 Controller·테스트 계약과 맞는지 확인합니다.
- 제공된 Controller가 로그인 응답에 `Cache-Control: no-store`를 적용하는 이유를 설명합니다.

## 4. Step 02. 사용자 저장 구조

### 해야 할 일

`User`의 email 길이와 unique 제약을 DTO 계약에 맞추고, BCrypt 해시가 잘리지 않도록 password 컬럼 길이를 정합니다. 동시 회원가입 경쟁의 최종 경계가 되는 unique 제약을 제거하지 않습니다. 저장과 조회에 필요한 `UserRepository`는 이미 제공되므로 수정하지 않습니다.

### 왜 이 작업을 하는가

요청 검증을 통과한 값도 데이터베이스 제약과 다르면 저장 단계에서 실패할 수 있습니다.

### 확인 방법

- email의 최대 길이와 unique 제약을 확인합니다.
- password 컬럼이 BCrypt 해시를 충분히 저장할 수 있는지 확인합니다.

## 5. Step 03. 게시글 저장 구조

### 해야 할 일

`PostEntity`의 title, content, author 컬럼을 요청 DTO와 사용자 email 계약에 맞춥니다. content는 H2와 MySQL에서 5000자를 안전하게 저장할 수 있는 JPA 매핑을 선택합니다. 저장된 작성자와 현재 email이 같은지를 판단하는 `isWrittenBy()`를 Entity의 소유권 규칙으로 완성합니다.

### 왜 이 작업을 하는가

게시글 요청과 저장 구조가 같은 경계를 가져야 Validation 이후의 저장 결과를 예측할 수 있습니다.

### 확인 방법

- title과 content의 저장 범위가 DTO 최대 길이와 맞는지 확인합니다.
- author가 인증 email 전체를 저장할 수 있는지 확인합니다.
- `isWrittenBy()`가 인증 여부를 추측하지 않고 저장된 author와 전달받은 email만 비교하는지 확인합니다.

## 6. Step 04. 예외 응답 연결

### 해야 할 일

request body Validation, method parameter Validation, 읽을 수 없는 JSON을 구분해 400 응답으로 변환합니다. 같은 field에 여러 오류가 있으면 첫 오류를 결정적으로 선택하고, 도메인 예외의 401·403·404·409 응답도 확인합니다. 모든 오류는 `ErrorResponse(code, message, errors)` 기본 구조를 공유합니다.

### 왜 이 작업을 하는가

입력 실패와 인증·인가 실패의 상태와 원인을 구분해야 클라이언트가 다음 행동을 판단할 수 있습니다.

### 확인 방법

- 빈 값, 잘못된 email, 경계보다 긴 값을 보내 400 응답을 확인합니다.
- 오류 응답의 `code`, `message`, `errors` 역할이 섞이지 않는지 확인합니다.
- 중복 가입은 409, 자격 증명 실패는 401, 게시글 소유권 부족은 403, 게시글 없음은 404인지 확인합니다.
- Security Filter 단계의 401/403은 MVC 전역 handler에 도달하지 않으므로 Step07에서 같은 JSON 계약을 별도로 연결해야 함을 확인합니다.

## 7. Step 05. JWT 발급과 요청 인증

### 해야 할 일

`Step05JwtAuthentication.kt`의 `JwtTokenProvider`에서 JWT 발급·검증을 완성하고, `JwtAuthenticationFilter`가 Bearer token을 인증 정보로 바꾸는 흐름을 확인합니다. provider는 secret, expiration, issuer, audience와 주입된 `Clock`을 같은 계약으로 사용합니다.

### 왜 이 작업을 하는가

로그인 응답의 문자열만으로는 보호 API가 사용자를 알 수 없습니다. 다음 요청에서 필터가 토큰을 검증하고 인증 정보를 구성해야 합니다. 검증과 subject 조회를 분리하면 같은 JWT를 두 번 파싱할 수 있으므로 `getValidatedSubject()`가 한 번의 파싱으로 검증된 subject 또는 null을 반환해야 합니다.

### 확인 방법

- JWT를 HS256으로 발급하고 subject=email, `issuedAt`, `expiration`, issuer, audience를 포함하는지 확인합니다.
- secret이 UTF-8 기준 32바이트 미만이면 명확히 실패하는지 확인합니다.
- `Clock`을 기준으로 발급·만료 시각을 계산해 대기 없이 만료 테스트를 할 수 있는지 확인합니다.
- `getValidatedSubject()`가 정상 token을 한 번만 파싱하고 변조·만료·issuer 불일치·audience 불일치·다른 알고리즘을 거부하는지 확인합니다.
- 기존 Authentication을 덮어쓰지 않고, 검증된 subject에만 새 빈 `SecurityContext`를 설정하는지 확인합니다.
- Bearer prefix가 없거나 실제 token이 빈 경우 인증을 만들지 않는지 확인합니다.

## 8. Step 06. 회원가입과 로그인

### 해야 할 일

`Step06AuthService.kt`에서 email 정규화, 중복 email 확인, 비밀번호 암호화, DB unique 경쟁 처리, 로그인 검증, JWT 반환, 현재 사용자 조회 흐름을 연결합니다.

### 왜 이 작업을 하는가

회원가입은 계정 저장이고 로그인은 인증 증표 발급입니다. 두 동작의 책임을 구분하면서 앞 단계의 저장 계약과 JWT를 연결해야 합니다. email은 서버 Locale에 영향받지 않도록 `lowercase(Locale.ROOT)`로 정규화하고 password는 trim하지 않습니다. 사전 중복 조회만으로는 동시 요청을 막지 못하므로 transaction 안에서 DB unique 위반도 같은 409로 바꿉니다.

### 확인 방법

- `existsByEmail()`이 비용이 큰 BCrypt encode보다 먼저 호출되는지 확인합니다.
- signup이 쓰기 transaction에서 `saveAndFlush()`하고 email unique 종류의 `DataIntegrityViolationException`만 409 도메인 예외로 바꾸는지 확인합니다.
- 없는 email과 잘못된 password가 계정 존재 여부를 드러내지 않는 같은 401 code/message로 실패하는지 확인합니다.
- 성공한 로그인 응답에 token과 provider의 초 단위 만료 시간이 포함되고 현재 사용자 조회로 이어지는지 확인합니다.

## 9. Step 07. Security 경계

### 해야 할 일

`Step07SecurityConfig.kt`에서 공개 API와 보호 API를 구분하고 JWT 필터를 Security filter chain에 연결합니다. Filter 단계의 인증 실패와 Spring Security 접근 거부를 각각 JSON 401/403으로 직렬화합니다.

### 왜 이 작업을 하는가

회원가입, 로그인, 학습 화면과 게시글 GET은 토큰 없이 접근 가능해야 하고, `/auth/me`와 게시글 POST/PUT/DELETE는 인증 후 접근해야 합니다. 401은 신원이 없다는 뜻이고, 403은 인증됐지만 권한이 부족하다는 뜻입니다.

### 확인 방법

- 공개 API 목록을 설명합니다.
- 보호 API가 토큰 없이 열려 있지 않은지 확인합니다.
- `CustomAuthenticationEntryPoint`가 `WWW-Authenticate: Bearer`와 `UNAUTHORIZED` JSON을 반환하는지 확인합니다.
- `JsonAccessDeniedHandler`가 공통 `ErrorResponse` 구조의 `ACCESS_DENIED` JSON을 반환하는지 확인합니다.
- JWT 필터가 `UsernamePasswordAuthenticationFilter`보다 먼저 실행되고 Role 기반 authorities는 추가하지 않았는지 확인합니다.

## 10. Step 08. 게시글 소유권

### 해야 할 일

`Step08PostService.kt`에서 인증된 email을 게시글 작성자로 사용하고, 수정·삭제 전에 `validateAuthor()`가 Step03의 `isWrittenBy()`를 호출하도록 소유권 검사를 한곳에 모읍니다.

### 왜 이 작업을 하는가

인증은 요청자가 누구인지 확인하고, 소유권 인가는 그 사용자가 해당 게시글을 바꿀 수 있는지 판단합니다.

### 확인 방법

- 게시글 요청 body에 `author`를 보내지 않아도 인증된 사용자가 작성자로 저장되는지 확인합니다.
- 수정은 값을 바꾸기 전에, 삭제는 Entity를 지우기 전에 같은 `validateAuthor()`를 통과하는지 확인합니다.
- 다른 사용자가 작성한 게시글의 수정·삭제가 `ForbiddenPostAccessException`을 통해 403으로 거절되는지 확인합니다.

## 11. 실행 확인

```bash
export JWT_SECRET="$(openssl rand -hex 32)"
docker compose up -d
./gradlew bootRun
```

Docker MySQL은 기본적으로 `localhost:3307`을 사용합니다. 다른 DB가 필요하면 `DB_URL`을 재정의하고, 생성한 JWT secret이나 `.env` 파일은 커밋하지 않습니다.

Swagger UI:

```text
http://localhost:8080/swagger
```

인증과 Validation TODO를 완성한 뒤 브라우저에서 `http://localhost:8080/auth-practice/index.html`을 엽니다. email과 password를 직접 입력해 `회원가입 -> 로그인 -> /auth/me`를 한 화면에서 확인하고, 마지막에 표시되는 email이 입력한 계정과 같은지 확인합니다. Access Token은 페이지 메모리에만 있으므로 새로고침하면 다시 로그인해야 합니다.

실습 화면에서 5xx 응답이 나오면 원인을 단정하지 말고 서버 로그를 먼저 확인합니다. 그다음 `Step01ApiDtos.kt`, `Step04ApiExceptionHandling.kt`, `Step05JwtAuthentication.kt`, `Step06AuthService.kt` TODO를 번호 순서로 확인합니다.

테스트:

```bash
./gradlew test
```

총 58개 테스트는 다음 계약을 함께 검증합니다.

- DTO Validation과 400 오류 형식
- `TokenResponse`와 로그인 `Cache-Control: no-store`
- email 정규화, BCrypt, 사전 중복 조회와 DB unique 경쟁
- JWT 서명·만료·issuer·audience·단일 파싱 subject 검증
- Filter의 Authentication·SecurityContext 처리와 JSON 401/403
- 실제 `signup -> login 응답 token -> /auth/me` 흐름
- 게시글 공개 조회, 인증 작성, 작성자와 비작성자의 수정·삭제

Step01부터 Step08까지 TODO가 남아 있는 시작 상태에서는 관련 테스트가 실패해야 합니다. 한 Step을 구현할 때마다 실패 범위가 줄어드는지 확인하고, 마지막에는 테스트를 수정하지 않은 채 58개 전체가 통과해야 합니다.

## 마지막 확인

- 잘못된 입력이 400으로 거절되고 오류 원인을 확인할 수 있습니다.
- 게시글 작성자를 요청 body가 아닌 인증 정보에서 가져옵니다.
- 회원가입과 로그인 흐름을 설명합니다.
- 토큰 발급과 단일 파싱 검증 위치를 구분합니다.
- 공개 API, 보호 API와 게시글 소유권 인가를 구분합니다.
- 로그인 응답 계약과 JSON 401/403 응답을 설명합니다.
- 제공된 58개 테스트를 변경하지 않고 통과합니다.
- OAuth2/SMTP 범위로 확장하지 않았습니다.

<details>
<summary>멘토용 진행 포인트</summary>

- 각 Step에서 요청이 Controller, Service, token provider, filter, security config 중 어디를 지나는지 말하게 합니다.
- 힌트가 필요하면 로그인 응답, Authorization header, filter 검증 순서로 좁혀갑니다.
- 실패 테스트 이름을 해당 Step으로 연결하되 테스트를 완화하지 않게 합니다.
- 정답을 직접 말하지 않고 "이 요청은 인증 전인가 후인가"를 먼저 질문합니다.

</details>
