# Spring Boot Authentication And JWT Lab

회원가입, 로그인, JWT 발급, 보호된 API 접근까지 가장 작은 인증 흐름으로 익히는 실습 레포입니다.

## 이 시퀀스에서 무엇을 배우나요

이번 실습은 `03-answer`의 안전한 요청 처리 위에
인증과 JWT 최소 흐름을 올리는 단계입니다.

이번 레포에서는 아래 흐름에 집중합니다.

1. 회원가입 요청을 받아 사용자를 저장합니다.
2. 비밀번호를 원문 그대로 저장하지 않고 `PasswordEncoder`로 인코딩합니다.
3. 로그인 시 email과 password를 확인합니다.
4. 로그인 성공 후 JWT를 발급합니다.
5. `/auth/me`는 토큰이 있어야 접근되도록 보호합니다.
6. 로그인만으로는 부족하고, 그다음에는 인가 규칙이 왜 필요한지도 이해합니다.

## 브랜치 사용 방법

- `main`: 이 레포의 주제, 문서, 브랜치 구조를 안내하는 대표 브랜치
- `04-implementation`: 학생 실습용 starter 브랜치
- `04-answer`: 비교용 정답 브랜치

학생은 반드시 `04-implementation`에서 시작합니다.

```bash
git clone -b 04-implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b feat/<이름>
```

정답 비교가 필요할 때는 아래 흐름을 사용합니다.

```bash
git fetch origin
git diff origin/04-implementation..origin/04-answer
```

## 문서 안내

- [이론 문서](./docs/theory.md)
- [구현 안내](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자료 안내](./docs/assets.md)

## 파일을 어떻게 보면 좋나요

실습은 아래 순서로 보는 것을 권장합니다.

1. `docs/theory.md`에서 왜 로그인 이후 요청을 구분해야 하는지 읽습니다.
2. `docs/implementation.md`에서 오늘 손으로 칠 순서를 확인합니다.
3. 아래 핵심 파일을 순서대로 엽니다.

- `src/main/kotlin/com/andi/rest_crud/dto/UserSignUpRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/LoginRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/service/AuthService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/JwtTokenProvider.kt`
- `src/main/kotlin/com/andi/rest_crud/security/SecurityConfig.kt`
- `src/main/kotlin/com/andi/rest_crud/controller/AuthController.kt`

`04-implementation`에서는 TODO를 채우며 실습하고,
완료 후에는 `04-answer`나 `docs/answer-guide.md`로 비교하면 됩니다.

## 미리 제공되는 것

- Kotlin + Spring Boot + Spring Security + JWT 기본 설정
- MySQL 실행 설정과 테스트 격리 실행을 위한 MySQL 호환 테스트 설정
- Swagger UI 진입 설정
- `User`, `UserRepository`, `TokenResponse`, `CurrentUserResponse`
- `PasswordEncoder` Bean, JWT 필터 뼈대, 인증 실패 응답 기본 처리

학생은 회원가입, 로그인, 토큰 발급, 보호된 API 흐름의 핵심만 직접 구현합니다.
인가와 역할 기반 접근은 실무 확장 개념으로 문서에서 같이 다루되,
이번 starter의 메인 구현 범위를 과하게 넓히지는 않습니다.

## 실행 방법

먼저 MySQL을 준비합니다.

```bash
docker compose up -d
```

애플리케이션 실행:

```bash
./gradlew bootRun
```

Swagger UI:

```text
http://localhost:8080/swagger
```

테스트 실행:

```bash
./gradlew test
```

## 이번 실습에서 직접 구현할 범위

- 회원가입 요청 DTO 검증
- 로그인 요청 DTO 검증
- `AuthService`의 회원가입 / 로그인 / 현재 사용자 조회 흐름
- `JwtTokenProvider`의 토큰 발급 / 사용자 식별 / 검증 메서드
- `SecurityConfig`에서 보호할 API 지정과 JWT 필터 연결
- `/auth/signup`, `/auth/login`, `/auth/me` 흐름 확인

실무 확장 메모:
`docs/theory.md`와 `docs/answer-guide.md`에는
- 로그인만으로는 부족한 문제 상황
- `authenticated()`만으로는 설명되지 않는 접근 규칙
- `hasRole("ADMIN")`, 본인 확인 인가 코드 예시
도 함께 정리되어 있습니다.

이번 시퀀스에서는 OAuth2, Email Verification, refresh token, 권한(Role) 확장, 복잡한 인가 정책은 넣지 않습니다.
