# 구현 가이드

## 1. 구현 전에 확인할 문제

이번 구현은 03에서 배운 입력 검증을 인증 요청에 다시 연결한 뒤 사용자 인증 상태를 만드는 작업입니다. Validation, 회원가입, 로그인, JWT 발급, JWT 검증, 보호 API 접근 흐름을 차례로 연결합니다.

```text
input validation -> signup -> login -> token issue -> token validation -> protected API
```

## 2. 구현 순서

1. 요청 DTO와 `GlobalExceptionHandler`에서 03 Validation을 다시 완성합니다.
2. `User.kt`, `UserRepository.kt`에서 사용자 저장 구조를 확인합니다.
3. `AuthService.kt`에서 회원가입과 로그인 흐름을 연결합니다.
4. `JwtTokenProvider.kt`에서 토큰 발급과 검증 책임을 확인합니다.
5. `JwtAuthenticationFilter.kt`에서 요청 토큰을 인증 정보로 바꾸는 흐름을 연결합니다.
6. `SecurityConfig.kt`에서 공개 API와 보호 API를 구분합니다.
7. Swagger에서 로그인 후 보호 API 접근을 확인합니다.

## 3. Step 0. 03 Validation 다시 연결

### 해야 할 일

- 회원가입 email은 빈 값·이메일 형식·254자 제한, password는 빈 값·8~64자 제한을 적용합니다.
- 로그인 email은 같은 email 계약, password는 빈 값·64자 제한을 적용합니다.
- 게시글 title은 빈 값·100자 제한, content는 빈 값·5000자 제한을 적용합니다.
- Kotlin 제약 조건에는 field use-site target을 사용하고 password는 trim하지 않습니다.
- request body field 오류는 같은 field의 첫 오류를 결정적으로 선택해 400으로 응답합니다.
- method parameter 검증 실패와 읽을 수 없는 JSON도 원인을 구분한 400으로 응답합니다.
- Entity 컬럼 길이는 DTO 계약과 맞춥니다.
- 게시글 수정·삭제에서는 저장된 작성자와 인증된 사용자를 비교하고, 다르면 403 예외를 발생시킵니다.

### 왜 이 작업을 하는가

회원가입과 로그인은 공개 API입니다. 입력 경계를 닫지 않으면 잘못된 값이 저장·인증 로직까지 흘러가고, 인증 실패와 입력 실패가 같은 문제처럼 보입니다.

### 확인 방법

- 빈 값, 잘못된 email, 경계보다 긴 값을 보내 400 응답을 확인합니다.
- 오류 응답의 `code`, `message`, `errors` 역할이 섞이지 않는지 확인합니다.
- 게시글 요청 body에 `author`를 보내지 않아도 인증된 사용자가 작성자로 저장되는지 확인합니다.
- 다른 사용자가 작성한 게시글의 수정·삭제가 403으로 거절되는지 확인합니다.

## 4. Step 1. 사용자 저장 구조 확인

### 해야 할 일

`User`와 `UserRepository`가 회원가입 정보를 저장할 수 있는지 확인합니다.

### 왜 이 작업을 하는가

JWT는 사용자를 식별한 뒤 발급됩니다. 로그인 전에 사용자 저장과 조회 흐름이 먼저 있어야 합니다.

### 확인 방법

- 회원가입 요청이 사용자 저장으로 이어지는지 확인합니다.
- 중복 사용자 처리가 필요한 이유를 설명합니다.

## 5. Step 2. 로그인과 토큰 발급

### 해야 할 일

`AuthService`에서 로그인 요청을 검증하고 JWT를 발급하는 흐름을 연결합니다.

### 왜 이 작업을 하는가

로그인은 인증 증표를 받는 시작점입니다. 비밀번호 확인과 토큰 발급 책임이 섞이지 않도록 흐름을 읽어야 합니다.

### 확인 방법

- 잘못된 로그인 요청이 실패하는지 확인합니다.
- 성공한 로그인 응답에 token이 포함되는지 확인합니다.

## 6. Step 3. 토큰 검증

### 해야 할 일

`JwtTokenProvider`와 `JwtAuthenticationFilter`에서 토큰 검증 흐름을 확인합니다.

### 왜 이 작업을 하는가

클라이언트는 이후 요청마다 토큰을 보냅니다. 필터가 토큰을 검증해 인증 정보를 구성해야 보호 API가 요청자를 알 수 있습니다.

### 확인 방법

- Bearer token 형식을 설명합니다.
- 토큰이 없거나 잘못된 경우 보호 API가 실패하는지 확인합니다.

## 7. Step 4. Security 설정

### 해야 할 일

`SecurityConfig`에서 공개 API와 보호 API 경계를 확인합니다.

### 왜 이 작업을 하는가

회원가입과 로그인은 토큰 없이 접근 가능해야 하고, 보호 API는 인증 후 접근해야 합니다.

### 확인 방법

- 공개 API 목록을 설명합니다.
- 보호 API가 토큰 없이 열려 있지 않은지 확인합니다.

## 8. Step 5. 실행 확인

```bash
docker compose up -d
./gradlew bootRun
```

Swagger UI:

```text
http://localhost:8080/swagger
```

인증과 Validation TODO를 완성한 뒤 브라우저에서 `http://localhost:8080/auth-practice/index.html`을 엽니다. email과 password를 직접 입력해 `회원가입 -> 로그인 -> /auth/me`를 한 화면에서 확인하고, 마지막에 표시되는 email이 입력한 계정과 같은지 확인합니다. Access Token은 페이지 메모리에만 있으므로 새로고침하면 다시 로그인해야 합니다.

테스트:

```bash
./gradlew test
```

## 마지막 확인

- 잘못된 입력이 400으로 거절되고 오류 원인을 확인할 수 있습니다.
- 게시글 작성자를 요청 body가 아닌 인증 정보에서 가져옵니다.
- 회원가입과 로그인 흐름을 설명합니다.
- 토큰 발급과 검증 위치를 구분합니다.
- 공개 API와 보호 API를 구분합니다.
- OAuth2/SMTP 범위로 확장하지 않았습니다.

<details>
<summary>멘토용 진행 포인트</summary>

- 각 Step에서 요청이 Controller, Service, token provider, filter, security config 중 어디를 지나는지 말하게 합니다.
- 힌트가 필요하면 로그인 응답, Authorization header, filter 검증 순서로 좁혀갑니다.
- 정답을 직접 말하지 않고 "이 요청은 인증 전인가 후인가"를 먼저 질문합니다.

</details>
