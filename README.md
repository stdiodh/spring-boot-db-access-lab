# 04 JWT

## 이 시퀀스에서 다루는 문제

이전 시퀀스까지는 게시글 CRUD와 요청 검증을 다뤘습니다. 이번 시퀀스는 회원가입과 로그인 흐름을 추가하고, 로그인 성공 후 발급한 JWT로 보호된 API에 접근하는 문제를 다룹니다.

OAuth2, SMTP, 비밀번호 재설정, Redis, 고급 권한 모델은 이번 범위에 넣지 않습니다.

## 학습 목표

- 회원가입과 로그인 요청 흐름을 구현합니다.
- JWT 발급과 검증 흐름을 이해합니다.
- 인증 필터가 요청에서 토큰을 읽어 인증 정보를 만드는 위치를 설명합니다.
- 공개 API와 보호 API의 차이를 설명합니다.

## 멘티 시작 흐름

```bash
git clone -b 04-implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b feat/<이름>
```

## 읽는 순서

1. [이론 정리](./docs/theory.md)
2. [구현 가이드](./docs/implementation.md)
3. [체크리스트](./docs/checklist.md)
4. [제공 자료 안내](./docs/assets.md)

핵심 파일은 아래 순서로 확인합니다.

- `src/main/kotlin/com/andi/rest_crud/domain/User.kt`
- `src/main/kotlin/com/andi/rest_crud/repository/UserRepository.kt`
- `src/main/kotlin/com/andi/rest_crud/service/AuthService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/JwtTokenProvider.kt`
- `src/main/kotlin/com/andi/rest_crud/security/JwtAuthenticationFilter.kt`
- `src/main/kotlin/com/andi/rest_crud/security/SecurityConfig.kt`
- `src/main/kotlin/com/andi/rest_crud/controller/AuthController.kt`

## 실행 / 테스트 방법

```bash
docker compose up -d
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

## 완료 기준

- 회원가입과 로그인 흐름을 설명합니다.
- 로그인 성공 시 JWT가 발급됩니다.
- 인증 필터가 Bearer token을 읽어 인증 정보를 구성합니다.
- 보호된 API는 토큰 없이 접근할 수 없습니다.
- `./gradlew test`가 통과합니다.

<details>
<summary>멘토용 진행 포인트</summary>

## 수업 전 확인

- JWT secret은 운영에서는 외부 설정으로 분리해야 함을 설명하되, 이번 구현은 기본 인증 흐름에 집중합니다.
- OAuth2/SMTP는 다음 시퀀스 범위입니다.

## 수업 중 질문

- 로그인 성공 후 서버가 왜 토큰을 발급하나요?
- 필터는 Controller보다 앞에서 어떤 일을 하나요?
- 공개 API와 보호 API는 Security 설정에서 어떻게 나뉘나요?

## 리뷰 기준

- 멘티가 회원가입, 로그인, 토큰 발급, 필터 검증, 보호 API 접근 순서를 설명하는지 봅니다.
- 토큰 문자열 자체보다 토큰이 요청 인증 상태로 바뀌는 위치를 설명하는지 확인합니다.
- 막힌 경우 완성 내용을 보여주기보다 요청 경로, token provider, filter, security config 순서로 질문합니다.

</details>
