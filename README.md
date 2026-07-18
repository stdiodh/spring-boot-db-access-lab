# 04 JWT

## 이 시퀀스에서 다루는 문제

이전 시퀀스까지는 게시글 CRUD와 요청 검증을 다뤘습니다. 이번 시퀀스는 03에서 배운 Validation을 인증 요청에도 다시 연결한 뒤, `signup -> login -> access token 발급 -> JWT 검증 필터 -> SecurityContext -> 보호 API -> 게시글 소유권 인가` 흐름을 완성하는 문제를 다룹니다.

직접 수정하는 범위는 `Step01`부터 `Step08`까지입니다. 제공된 Controller, Repository, 설정 연결 코드와 58개 테스트도 이 여덟 파일의 TODO와 같은 API·보안 계약을 사용합니다. 따라서 테스트를 고쳐 통과시키지 않고 TODO를 모두 완성해야 합니다. 시작 상태에서는 핵심 테스트가 실패하고, 구현 계약을 모두 연결한 뒤 전체 테스트가 통과하는 흐름이 정상입니다.

OAuth2, SMTP, 비밀번호 재설정, Redis, 고급 권한 모델은 이번 범위에 넣지 않습니다.

## 학습 목표

- 03에서 배운 DTO Validation과 예외 응답을 인증 입력에 다시 적용합니다.
- 회원가입과 로그인 요청 흐름을 구현합니다.
- `accessToken`, `tokenType`, `expiresIn`으로 구성된 로그인 응답과 `Cache-Control: no-store`의 이유를 설명합니다.
- issuer, audience, 시간, 서명을 포함한 JWT 발급과 단일 파싱 검증 흐름을 이해합니다.
- 인증 필터가 요청에서 토큰을 읽어 인증 정보를 만드는 위치를 설명합니다.
- 공개 API와 보호 API, JSON 401과 403의 차이를 설명합니다.
- 인증된 신원과 게시글 소유권 인가를 구분합니다.

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

실제로 수정할 파일은 `Step01`부터 `Step08`까지 번호 순서로 확인합니다. 번호는 학습 중 다음 파일을 빠르게 찾기 위한 표시이며, 클래스 이름과 패키지 구조는 실무 코드처럼 유지합니다.

1. `src/main/kotlin/com/andi/rest_crud/dto/Step01ApiDtos.kt`: 입력 검증과 로그인 응답 계약
2. `src/main/kotlin/com/andi/rest_crud/domain/Step02User.kt`: 사용자 저장 계약
3. `src/main/kotlin/com/andi/rest_crud/domain/Step03PostEntity.kt`: 게시글 저장 계약과 소유권 판단
4. `src/main/kotlin/com/andi/rest_crud/exception/Step04ApiExceptionHandling.kt`: Validation과 도메인 오류 응답
5. `src/main/kotlin/com/andi/rest_crud/security/Step05JwtAuthentication.kt`: JWT 발급·단일 파싱 검증과 Filter
6. `src/main/kotlin/com/andi/rest_crud/service/Step06AuthService.kt`: 회원가입·로그인과 email 정규화
7. `src/main/kotlin/com/andi/rest_crud/security/Step07SecurityConfig.kt`: 공개·보호 경계와 JSON 401/403
8. `src/main/kotlin/com/andi/rest_crud/service/Step08PostService.kt`: 게시글 소유권 인가

## 실행 / 테스트 방법

```bash
cp .env.example .env
docker compose up -d
./gradlew bootRun
```

프로젝트 루트의 `.env`는 로컬 실행 설정으로 자동 로드됩니다. 기본 Docker MySQL 포트는 로컬 MySQL과 겹치지 않도록 `3307`을 사용합니다. 다른 DB나 secret이 필요하면 `.env`의 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`을 바꿉니다. 같은 이름의 OS 환경 변수가 있으면 `.env`보다 우선합니다. 예제만 저장소에 남기고 실제 `.env`와 운영 secret은 커밋하지 않습니다.

`JWT_SECRET`은 필수이며 UTF-8 기준 32바이트 이상이어야 합니다. 만료 시간은 `JWT_EXPIRATION_MS`로 바꿀 수 있고 기본값은 3,600,000ms입니다. issuer와 audience는 `JWT_ISSUER`, `JWT_AUDIENCE`로 재정의할 수 있습니다.

Swagger UI:

```text
http://localhost:8080/swagger
```

Sequence 04 인증 실습 화면:

```text
http://localhost:8080/auth-practice/index.html
```

인증 TODO를 완성한 뒤 email과 password를 직접 입력해 계정을 만들고 로그인합니다. 화면은 로그인 응답의 Access Token으로 `/auth/me`를 호출해 서버가 확인한 신원을 보여줍니다. Token은 브라우저 저장소가 아닌 현재 페이지의 JavaScript 메모리에만 보관합니다.

실습 화면에서 5xx 응답이 나오면 원인을 단정하지 말고 서버 로그를 먼저 확인합니다. 그다음 `Step01ApiDtos.kt`, `Step04ApiExceptionHandling.kt`, `Step05JwtAuthentication.kt`, `Step06AuthService.kt` TODO를 번호 순서로 확인합니다.

테스트 실행:

```bash
./gradlew test
```

제공된 58개 테스트는 Validation, 응답 DTO, 회원가입 중복 경쟁, 로그인, JWT 서명·만료·issuer·audience, Filter, JSON 401/403, 게시글 소유권을 같은 계약으로 검증합니다. TODO가 남은 시작 상태에서 실패하는 것은 의도된 학습 신호입니다. 테스트 구현이나 기대값을 바꾸지 말고 실패한 이름을 다음 Step을 찾는 단서로 사용합니다.

## 완료 기준

- 잘못된 회원가입·로그인·게시글 요청은 일관된 400 응답으로 거절됩니다.
- 게시글 작성자는 요청 body가 아니라 인증된 사용자 정보로 결정됩니다.
- 회원가입과 로그인 흐름을 설명합니다.
- 로그인 성공 시 `accessToken`, `tokenType="Bearer"`, 초 단위 `expiresIn`이 발급되고 응답에 `Cache-Control: no-store`가 있습니다.
- 인증 필터가 Bearer token을 한 번 파싱해 검증된 subject로 인증 정보를 구성합니다.
- 보호된 API는 토큰 없이 접근할 수 없습니다.
- 401과 403이 공통 `ErrorResponse` 형식의 JSON으로 반환됩니다.
- 게시글 수정·삭제는 인증된 작성자만 성공합니다.
- 제공된 58개 테스트를 수정하지 않은 상태에서 `./gradlew test`가 통과합니다.

<details>
<summary>멘토용 진행 포인트</summary>

## 수업 전 확인

- JWT secret은 환경 변수로 전달하고 실제 값을 저장소에 남기지 않는지 확인합니다.
- starter의 58개 테스트가 TODO 완성 전 실패하고 완성 후 통과하는지 확인합니다.
- OAuth2/SMTP는 다음 시퀀스 범위입니다.

## 수업 중 질문

- DTO 제약이 없으면 잘못된 입력이 어느 계층까지 흘러가나요?
- 같은 필드에서 여러 제약이 실패하면 어떤 메시지를 선택해야 하나요?
- 로그인 성공 후 서버가 왜 토큰을 발급하나요?
- 토큰을 검증하면서 subject를 한 번에 반환하면 어떤 중복 파싱을 막을 수 있나요?
- email 정규화에 기본 Locale이 아니라 `Locale.ROOT`를 사용하는 이유는 무엇인가요?
- 필터는 Controller보다 앞에서 어떤 일을 하나요?
- 공개 API와 보호 API는 Security 설정에서 어떻게 나뉘나요?

## 리뷰 기준

- 멘티가 회원가입, 로그인, 토큰 발급, 필터 검증, 보호 API 접근 순서를 설명하는지 봅니다.
- 토큰 문자열 자체보다 토큰이 요청 인증 상태로 바뀌는 위치를 설명하는지 확인합니다.
- Step03의 소유권 판단과 Step08의 인가 흐름을 신원 인증과 구분하는지 확인합니다.
- 막힌 경우 완성 내용을 보여주기보다 요청 경로, token provider, filter, security config 순서로 질문합니다.

</details>
