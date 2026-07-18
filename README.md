# 04 JWT

## 이 시퀀스에서 다루는 문제

이번 answer 브랜치는 `signup -> login -> access token 발급 -> JWT 검증 필터 -> SecurityContext -> 보호 API -> 게시글 소유권 인가`가 연결된 비교 기준입니다. 회원가입은 계정을 만드는 작업이고, 로그인은 저장된 자격 증명을 확인해 access token을 발급하는 작업입니다.

로그인은 `AuthService`가 수동으로 처리하고, 이후 요청의 인증과 인가는 Spring Security가 처리합니다. Authentication은 요청자의 신원을 확인하는 일이고, Authorization은 인증된 요청자가 작업할 수 있는지 판단하는 일입니다. 인증되지 않은 요청은 401, 인증됐지만 게시글 소유권이나 권한이 부족한 요청은 403입니다.

현재 구현은 Access Token only입니다. Refresh Token, Redis, OAuth2, SMTP, 비밀번호 재설정과 Role 기반 인가는 이번 범위에 넣지 않습니다.

## 학습 목표

- 회원가입과 로그인 요청 흐름을 비교합니다.
- JWT 발급과 검증 흐름을 이해합니다.
- 인증 필터가 요청에서 토큰을 읽어 인증 정보를 만드는 위치를 설명합니다.
- 공개 API와 보호 API의 차이를 설명합니다.
- 게시글 작성자 소유권 검사가 요청 인증 뒤에 동작하는 이유를 설명합니다.

## 멘티 시작 흐름

먼저 starter 브랜치에서 직접 구현한 뒤, 이 브랜치의 문서를 비교 기준으로 사용합니다.

```bash
git fetch origin
git diff origin/04-implementation..origin/04-answer
```

학생이 파일 사이에서 구현 순서를 잃지 않도록 starter에서 직접 구현하는 파일만 `Step01`부터 `Step08`까지 표시했습니다. 이 접두사는 실습용 탐색 장치이며 package와 class 이름에는 넣지 않습니다. Controller, Repository, 설정과 테스트는 제공되는 연결·검증 코드이므로 번호화하지 않습니다.

```text
Step01ApiDtos.kt              요청·응답 계약
Step02User.kt                 사용자 저장 계약
Step03PostEntity.kt           게시글 저장 계약
Step04ApiExceptionHandling.kt 오류 응답 계약
Step05JwtAuthentication.kt    JWT 발급·검증과 Filter
Step06AuthService.kt          회원가입·로그인
Step07SecurityConfig.kt       Security 경계와 401/403
Step08PostService.kt          게시글 소유권
```

answer의 각 파일 상단에는 선행 단계, 현재 판단, 다음 연결을 적고 핵심 구현 위에는 코드 문법보다 해당 검사가 필요한 이유를 설명했습니다.

## 읽는 순서

1. [이론 정리](./docs/theory.md)
2. [구현 가이드](./docs/implementation.md)
3. [체크리스트](./docs/checklist.md)

## 실행 / 테스트 방법

```bash
cp .env.example .env
# 필요하면 .env의 로컬 값을 수정합니다.
docker compose up -d
./gradlew bootRun
```

애플리케이션은 프로젝트 루트의 `.env`를 자동으로 읽습니다. OS 환경 변수는 `.env`보다 우선하므로 별도 실행 환경에서는 같은 이름의 값을 안전하게 덮어쓸 수 있습니다. `.env.example`은 로컬 학습용 예시일 뿐 운영에 복사해 사용하지 않으며, 실제 secret이 들어 있는 `.env`는 절대 커밋하지 않습니다.

Docker MySQL은 로컬 `3307` 포트를 사용하며 예시의 `DB_URL`도 여기에 맞춰져 있습니다. 별도 DB를 쓸 때는 `DB_URL`을 바꿉니다. `JWT_SECRET`은 필수이며 UTF-8 기준 32바이트 이상이어야 합니다. `.env`와 OS 환경 변수 어디에도 값이 없거나 값이 짧으면 애플리케이션 시작이 실패합니다. 만료 시간을 바꾸려면 `JWT_EXPIRATION_MS`를 밀리초 단위로 설정할 수 있으며 기본값은 3,600,000ms입니다. issuer와 audience는 각각 `JWT_ISSUER`, `JWT_AUDIENCE`로 재정의할 수 있고 기본값은 이 애플리케이션과 API 이름입니다.

Swagger UI:

```text
http://localhost:8080/swagger
```

`/swagger`는 실제 UI인 `/swagger-ui/index.html`로 이동하므로 Security 설정에서 `/swagger-ui/**`와 `/v3/api-docs/**`도 공개합니다. 운영에서는 아래 설명처럼 `SPRINGDOC_ENABLED=false`로 문서 자체를 끕니다.

Sequence 04 인증 실습 화면:

```text
http://localhost:8080
```

`/`, `/auth-practice`, `/auth-practice/`는 모두 실제 화면인 `/auth-practice/index.html`로 이동합니다. email과 password를 직접 입력해 계정을 만든 뒤 로그인하면, 화면이 로그인 응답의 Access Token 전체 값과 `Header.Payload.Signature` 구조를 보여주고 같은 token으로 `/auth/me`를 호출해 서버가 확인한 신원을 연결합니다. 신원 확인이 성공하면 게시물 입력 영역이 열리고, 같은 Bearer token으로 `POST /posts`를 호출합니다. 작성자 입력값은 받지 않으며 응답의 `author`가 서버가 확인한 email과 같은지 확인합니다. 공개 `GET /posts` 목록은 로그인 없이도 새로고침할 수 있습니다. 실습용 token은 복사해 [jwt.io Debugger](https://www.jwt.io/#debugger-io)의 Encoded 칸에서 구조만 확인할 수 있습니다. Token을 링크에 자동으로 싣지 않으며, 운영 token과 `JWT_SECRET`은 외부 도구에 입력하지 않습니다. Token은 브라우저 저장소가 아닌 현재 페이지의 JavaScript 메모리에만 보관합니다.

jwt.io에서 Header와 Payload를 읽을 수 있다는 사실은 token이 유효하다는 뜻이 아닙니다. 서명, 만료, issuer, audience 검증은 실제 보호 요청에서 `JwtAuthenticationFilter`가 수행합니다.

테스트 실행:

```bash
./gradlew test
```

총 60개 테스트가 인증·JWT·게시글 소유권과 함께 인증 실습 사이트 및 Swagger 공개 경로를 검증합니다.

로그인 성공 응답은 기존 `accessToken`을 유지하고 전달 방식과 남은 만료 시간을 함께 제공합니다. 응답에는 `Cache-Control: no-store`가 설정됩니다.

```json
{
  "accessToken": "<signed-jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

JWT payload는 서명 대상일 뿐 암호화된 비밀 영역이 아닙니다. 민감 정보를 넣지 않습니다. 현재 subject는 학습 흐름을 단순하게 유지하려고 email을 사용하지만, 운영에서는 변경되지 않는 userId를 권장합니다. authorities는 비어 있으며 `authenticated` 여부와 게시글 ownership만 다룹니다. 토큰 저장 방식을 브라우저 쿠키로 바꾼다면 CSRF 정책도 다시 검토해야 합니다.

## 운영 배포 전 확인

- 운영 DB에는 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`를 별도로 주입하고 `JPA_DDL_AUTO=validate` 또는 `none`을 사용합니다.
- 기존 데이터의 대소문자 email 충돌과 새 길이 제한 초과 행을 먼저 조사한 뒤 명시적 migration을 적용합니다.
- 운영에서는 `SPRINGDOC_ENABLED=false`로 Swagger와 OpenAPI 문서를 닫습니다.
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`는 환경별로 고정해 비밀 관리 체계에서 관리합니다. single-key 구조이므로 secret 교체 시 기존 토큰은 즉시 무효화됩니다.
- Access Token only 구조에는 개별 토큰을 즉시 폐기하는 저장소가 없습니다. TTL과 재인증 정책으로 위험을 제한합니다.

## 완료 기준

- 회원가입과 로그인 흐름을 설명합니다.
- 로그인 성공 시 JWT가 발급됩니다.
- 인증 필터가 Bearer token을 읽어 인증 정보를 구성합니다.
- 보호된 API는 토큰 없이 접근할 수 없습니다.
- 게시글 수정과 삭제는 인증된 작성자만 성공합니다.
- 400, 401, 403, 404, 409 오류가 동일한 `code/message/errors` 기본 구조를 사용합니다.
- `./gradlew test`가 통과합니다.

<details>
<summary>멘토용 진행 포인트</summary>

## 수업 전 확인

- answer 브랜치에서 `./gradlew test`가 통과하는지 확인합니다.
- OAuth2/SMTP는 다음 시퀀스 범위입니다.

## 수업 중 질문

- answer에서 토큰은 어디에서 만들어지고 어디에서 검증되나요?
- 필터가 Controller보다 먼저 동작해야 하는 이유는 무엇인가요?
- 공개 API와 보호 API는 Security 설정에서 어떻게 나뉘나요?

## 리뷰 기준

- 멘티가 answer 코드를 그대로 외우는 것이 아니라 회원가입, 로그인, 토큰 발급, 필터 검증, 보호 API 접근 순서를 설명하는지 봅니다.
- token provider와 filter의 책임을 구분하는지 확인합니다.
- 다음 OAuth2 시퀀스에서 외부 로그인 이후 자체 JWT가 필요한 이유를 연결합니다.

</details>
