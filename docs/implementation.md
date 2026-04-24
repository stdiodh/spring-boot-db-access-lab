# 인증과 JWT 구현 안내

## 이 도메인이 필요한 이유

요청을 안전하게 받는 것만으로는 아직 부족합니다.
이제는 "누가 요청했는지"를 구분해야 내 정보 조회 같은 API를 만들 수 있어요.
이번 실습은 그 첫 단계로 회원가입, 로그인, JWT 발급, 보호된 API 접근을 가장 단순한 형태로 연결합니다.

## 오늘 학생이 완성할 최종 흐름

오늘 실습이 끝나면 학생은 아래 흐름을 직접 보여줄 수 있어야 합니다.

1. `UserSignUpRequest`와 `LoginRequest`를 검증 가능한 DTO로 만듭니다.
2. `AuthService`에서 회원가입 시 비밀번호를 인코딩해 저장합니다.
3. 로그인 시 사용자 조회와 비밀번호 확인을 연결합니다.
4. 로그인 성공 후 JWT를 발급합니다.
5. `/auth/me`가 토큰 유무에 따라 다르게 동작하는 것을 확인합니다.

## 학생이 직접 구현할 순서

1. `User` 핵심 필드를 확인합니다.
2. 회원가입 `Request DTO`를 만듭니다.
3. 회원가입 Service에서 비밀번호 인코딩을 연결합니다.
4. 로그인 `Request DTO`를 만듭니다.
5. 로그인 Service에서 사용자 조회와 비밀번호 확인을 연결합니다.
6. JWT 발급 메서드를 연결합니다.
7. 인증이 필요한 API를 지정합니다.
8. 토큰에서 사용자 정보를 읽는 흐름을 연결합니다.
9. 토큰 유무에 따른 결과 차이를 확인합니다.

## TODO를 넣을 파일

- `src/main/kotlin/com/andi/rest_crud/dto/UserSignUpRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/LoginRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/service/AuthService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/JwtTokenProvider.kt`
- `src/main/kotlin/com/andi/rest_crud/security/SecurityConfig.kt`
- `src/main/kotlin/com/andi/rest_crud/controller/AuthController.kt`

## 파일별 역할 설명

- `UserSignUpRequest.kt`: 회원가입 요청에서 email, password를 받는 DTO
- `LoginRequest.kt`: 로그인 요청에서 email, password를 받는 DTO
- `AuthService.kt`: 회원가입, 로그인, 현재 사용자 조회 흐름을 조립하는 핵심 서비스
- `JwtTokenProvider.kt`: JWT 발급, 사용자 식별, 토큰 검증을 맡는 유틸
- `SecurityConfig.kt`: 어떤 API를 열어 두고 어떤 API를 보호할지 정하는 설정
- `AuthController.kt`: `/auth/signup`, `/auth/login`, `/auth/me` 요청의 입구
- `JwtAuthenticationFilter.kt`: 다음 요청에서 토큰을 읽어 현재 인증 정보를 넣는 필터

## 미리 제공할 것

- `03-answer` 기반 CRUD, Validation, 예외 응답 구조
- MySQL 실행 설정과 테스트용 H2 설정
- `User`, `UserRepository`, `TokenResponse`, `CurrentUserResponse`
- `PasswordEncoder` Bean
- JWT 필터 뼈대와 인증 실패 응답 기본 처리
- Swagger 설정과 기본 패키지 구조

## 단계별 구현 안내

### Step 1. User 핵심 필드 확인

- `User.kt`를 열어 id, email, password 세 필드만 유지되는지 확인합니다.
- 이번 시퀀스에서는 권한(Role), 프로필, OAuth 정보까지 확장하지 않습니다.

실습 힌트:
- 지금은 "인증 최소 흐름"이 목적이라 사용자 정보도 최소화합니다.

### Step 2. 회원가입 DTO 만들기

- `UserSignUpRequest.kt`를 엽니다.
- email에는 형식 검증과 빈값 검증을 붙입니다.
- password에는 빈값 검증을 붙입니다.

실습 힌트:
- 회원가입 요청에 id 같은 서버 관리 값은 넣지 않습니다.
- 비밀번호는 다음 단계에서 인코딩하지만, 요청 DTO 단계에서는 우선 빈값을 막습니다.

### Step 3. 회원가입 Service 연결

- `AuthService.signUp(...)`을 엽니다.
- 같은 email이 이미 있는지 확인합니다.
- `passwordEncoder.encode(...)`를 거친 뒤 `User`를 저장합니다.

실습 힌트:
- Controller에서 저장 로직을 직접 풀지 말고 Service에서 끝내세요.
- 이미 존재하는 email이면 `UserAlreadyExistsException`을 사용합니다.

### Step 4. 로그인 DTO 만들기

- `LoginRequest.kt`를 엽니다.
- email과 password만 받도록 유지합니다.
- 회원가입 DTO와 마찬가지로 기본 검증을 붙입니다.

실습 힌트:
- 로그인도 요청 초입에서 잘못된 입력을 막는 것이 중요합니다.

### Step 5. 로그인 Service 연결

- `AuthService.login(...)`을 엽니다.
- email로 사용자를 찾습니다.
- `passwordEncoder.matches(...)`로 비밀번호를 비교합니다.

실습 힌트:
- 비밀번호는 직접 문자열 비교하지 마세요.
- 조회 실패와 비밀번호 불일치는 모두 `InvalidCredentialsException`으로 묶어도 됩니다.

### Step 6. JWT 발급 메서드 연결

- `JwtTokenProvider.kt`를 엽니다.
- 로그인 성공 시 사용할 `createToken(...)`을 완성합니다.
- 토큰에서 email을 읽는 `getEmail(...)`, 토큰 형식을 확인하는 `validateToken(...)`을 연결합니다.

실습 힌트:
- 이번 실습에서는 access token 하나만 발급합니다.
- subject에는 사용자를 구분할 값인 email을 넣으면 됩니다.

### Step 7. 인증이 필요한 API 지정

- `SecurityConfig.kt`를 엽니다.
- `/auth/signup`, `/auth/login`, Swagger 관련 경로는 열어 둡니다.
- `/auth/me`는 `authenticated()`로 보호합니다.

실습 힌트:
- 이번 단계의 핵심은 "어떤 API가 공개이고, 어떤 API가 보호되는지"를 눈에 보이게 만드는 것입니다.

### Step 8. 토큰에서 사용자 정보를 읽는 흐름 연결

- `JwtAuthenticationFilter.kt`와 `AuthService.getCurrentUser(...)` 흐름을 함께 봅니다.
- 필터는 토큰에서 email을 읽고,
- Service는 그 email로 현재 사용자를 조회하게 연결합니다.

실습 힌트:
- Controller가 토큰을 직접 파싱하지 않도록 역할을 분리하세요.
- `Principal.name`을 Service에 넘기는 구조로 유지하면 흐름이 선명합니다.

### Step 9. 토큰 유무에 따른 결과 차이 확인

- `docker compose up -d`로 MySQL을 실행합니다.
- `./gradlew bootRun`으로 앱을 실행합니다.
- Swagger에서 회원가입 -> 로그인 -> `/auth/me` 순서로 호출합니다.

실습 힌트:
- 토큰 없이 `/auth/me`를 호출하면 401이어야 합니다.
- 로그인으로 받은 access token을 `Authorization: Bearer <token>` 헤더에 넣으면 통과해야 합니다.

## 학생 체크리스트

- [ ] 회원가입 요청 DTO와 로그인 요청 DTO에 왜 검증이 필요한지 설명할 수 있습니다.
- [ ] 회원가입 시 비밀번호를 왜 인코딩해야 하는지 설명할 수 있습니다.
- [ ] 로그인 흐름을 "조회 -> 비밀번호 확인 -> JWT 발급" 순서로 말할 수 있습니다.
- [ ] 토큰 없이 `/auth/me`를 호출해 401을 직접 확인했습니다.
- [ ] 토큰을 넣고 `/auth/me`를 호출해 현재 사용자 조회를 직접 확인했습니다.

## 강사 / PPT 체크리스트

- [ ] 회원가입 -> 로그인 -> JWT 발급 -> `/auth/me` 흐름 그림이 있는가
- [ ] 인증과 인가 차이를 짧게 비교해 설명할 자료가 있는가
- [ ] `encode(...)`와 `matches(...)`를 같은 화면에서 보여줄 수 있는가
- [ ] 토큰 없음 401과 토큰 있음 200을 같은 시연 흐름으로 준비했는가
- [ ] 다음 시퀀스의 OAuth2 확장으로 자연스럽게 연결할 수 있는가

## 다음 도메인 연결 포인트

다음 시퀀스에서는 직접 만든 로그인만이 아니라
Google OAuth처럼 외부 인증을 받아 우리 서비스 사용자와 연결하는 흐름으로 확장할 수 있습니다.
