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

## 읽는 순서

1. [이론 정리](./docs/theory.md)
2. [구현 가이드](./docs/implementation.md)
3. [체크리스트](./docs/checklist.md)

## 실행 / 테스트 방법

```bash
docker compose up -d
export JWT_SECRET='local-dev-only-jwt-secret-change-me-123456'
./gradlew bootRun
```

`JWT_SECRET`은 필수이며 UTF-8 기준 32바이트 이상이어야 합니다. 값이 없거나 짧으면 애플리케이션 시작이 실패합니다. 만료 시간을 바꾸려면 `JWT_EXPIRATION_MS`를 밀리초 단위로 설정할 수 있으며 기본값은 3,600,000ms입니다. issuer와 audience는 각각 `JWT_ISSUER`, `JWT_AUDIENCE`로 재정의할 수 있고 기본값은 이 애플리케이션과 API 이름입니다. 실제 secret이나 `.env` 파일은 커밋하지 않습니다.

Swagger UI:

```text
http://localhost:8080/swagger
```

Sequence 04 인증 실습 화면:

```text
http://localhost:8080/auth-practice/index.html
```

email과 password를 직접 입력해 계정을 만든 뒤 로그인하면, 화면이 로그인 응답의 Access Token으로 `/auth/me`를 호출해 서버가 확인한 신원을 보여줍니다. Token은 브라우저 저장소가 아닌 현재 페이지의 JavaScript 메모리에만 보관합니다.

테스트 실행:

```bash
./gradlew test
```

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
