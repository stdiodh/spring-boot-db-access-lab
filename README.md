# Spring Boot DB Access Lab

이 레포는 A&I 백엔드 커리큘럼의 `02~06` 시퀀스를 담는 토픽 레포입니다.
`main`은 가이드 브랜치이고, 학생 실습은 오늘 시퀀스 번호에 맞는 `NN-implementation`에서 시작합니다.

## 이 레포에서 배우는 것

- `02`: 메모리 저장소가 사라지는 문제를 MySQL Repository/Entity 흐름으로 해결합니다.
- `03`: 잘못된 요청이 Service까지 들어오는 문제를 Validation과 전역 예외 응답으로 막습니다.
- `04`: 로그인 이후 사용자를 구분하는 문제를 JWT 발급/검증 흐름으로 해결합니다.
- `05`: 외부 인증과 계정 복구 흐름을 OAuth2/SMTP 책임으로 나눕니다.
- `06`: 정상/실패 케이스를 fixture와 mock으로 재현해 Service 동작을 검증합니다.

## 시작 방법

오늘 시퀀스 번호에 맞는 브랜치로 checkout합니다.
예를 들어 시퀀스 03은 아래처럼 시작합니다.

```bash
git clone https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout 03-implementation
```

## 실습 브랜치

| 용도 | 브랜치 |
| --- | --- |
| 가이드 | `main` |
| 학생 시작 | `02-implementation` ~ `06-implementation` |
| 참고 정답 | `02-answer` ~ `06-answer` |

## 시퀀스별 브랜치

| Sequence | 학생 시작 | 참고 정답 |
| --- | --- | --- |
| 02 | `02-implementation` | `02-answer` |
| 03 | `03-implementation` | `03-answer` |
| 04 | `04-implementation` | `04-answer` |
| 05 | `05-implementation` | `05-answer` |
| 06 | `06-implementation` | `06-answer` |

## 실행 방법

MySQL이 필요한 시퀀스에서는 먼저 의존 서비스를 실행합니다.

```bash
docker compose up -d
export JWT_SECRET='local-dev-only-jwt-secret-change-me-123456'
./gradlew bootRun
```

`JWT_SECRET`은 필수이며 UTF-8 기준 32바이트 이상이어야 합니다. 값이 없거나 짧으면 애플리케이션 시작이 실패합니다. `JWT_EXPIRATION_MS`의 기본값은 3,600,000ms이며, issuer와 audience는 `JWT_ISSUER`, `JWT_AUDIENCE`로 재정의할 수 있습니다. 실제 secret과 `.env` 파일은 커밋하지 않습니다.

Swagger UI 기본 경로:

```text
http://localhost:8080/swagger
```

Sequence 04 인증 실습 화면:

```text
http://localhost:8080/auth-practice/index.html
```

email과 password를 직접 입력해 계정을 만든 뒤 로그인하면, 화면이 로그인 응답의 Access Token으로 `/auth/me`를 호출해 서버가 확인한 신원을 보여줍니다. Token은 브라우저 저장소가 아닌 현재 페이지의 JavaScript 메모리에만 보관합니다.

## 테스트 방법

```bash
./gradlew test
```

테스트가 확인하는 것:

시퀀스별 테스트 기준:

| Sequence | 테스트가 확인하는 것 |
| --- | --- |
| 02 | context 기동, Swagger와 MySQL을 통한 CRUD 수동 확인 |
| 03 | context 기동, Swagger를 통한 400과 에러 응답 수동 확인 |
| 04 | 로그인 성공/실패, 보호 API 401, 토큰 접근 성공, 작성자 인가 403 |
| 05 | context 기동, OAuth/SMTP/reset link의 자동·수동 검증 범위 구분 |
| 06 | Service 단위 테스트, 테스트 실행 순서, 보장 범위 읽기 |

실패하면 먼저 볼 것:

- 실패한 테스트 이름과 expected/actual 값을 먼저 읽습니다.
- 외부 OAuth2/SMTP가 필요한 흐름은 mock 또는 local profile로 대체되어 있는지 확인합니다.
- 401은 인증 실패, 403은 인가 실패로 구분해서 봅니다.

완료 기준:

- 오늘 시퀀스의 테스트 기준이 통과합니다.
- 어떤 테스트가 어떤 개념을 확인하는지 설명할 수 있습니다.

`04-implementation`에서는 Sequence 03에서 배운 DTO Validation과 요청 본문 예외 처리도 다시 구현합니다. 회원가입·로그인·게시글 요청의 길이/형식 계약과 `400` 응답 TODO를 먼저 완성한 뒤 JWT 흐름을 연결합니다.

## 05 시퀀스 단계

05는 하나의 브랜치 쌍을 사용하지만 내부 학습은 세 단계로 나눕니다.

| 단계 | 주제 | 핵심 |
| --- | --- | --- |
| 05-A | OAuth2 로그인 흐름 | verified email, provider/providerId 식별, 동일 email 계정 충돌 처리 |
| 05-B | SMTP 메일 발송 흐름 | `RecoveryMailSender` 인터페이스, SMTP 구현체, 환경변수 설정 |
| 05-C | 계정 복구 유스케이스 | 복구 요청과 reset link 생성, 후속 토큰 저장·만료 설계 |

실제 Google client secret이나 SMTP password는 문서와 코드에 쓰지 않습니다.
외부 계정 준비가 어렵다면 mock 또는 local profile로 service 흐름부터 확인합니다.
같은 email의 로컬 계정은 자동 연결하지 않으며, OAuth 성공 JWT는 URL query가 아니라 fragment로 전달합니다.

## 정답과 비교하는 방법

실습 중 막혔거나 완료 후 확인이 필요할 때만 같은 번호의 참고 정답 브랜치와 비교합니다.
예를 들어 시퀀스 03은 아래처럼 비교합니다.

```bash
git fetch origin
git diff 03-implementation..03-answer
```

## Visual Lab

Visual Lab은 아래 위치에 있습니다.

```text
docs/visual-lab/index.html
```

로컬 확인:

```bash
python3 -m http.server 8080 -d docs/visual-lab
```

접속 주소:

```text
http://localhost:8080
```

## 문서 안내

- [이론 정리](./docs/theory.md)
- [구현 안내](./docs/implementation.md)
- [체크리스트](./docs/checklist.md)
- [Visual Lab](./docs/visual-lab/index.html)

각 시퀀스의 실제 실습 문서는 해당 `NN-implementation` 브랜치에서 확인합니다.

## 운영 메모

legacy `implementation` 브랜치가 남아 있다면 deprecated로만 취급합니다.
정식 수업 운영에서는 `02~06-implementation`, `02~06-answer`만 사용합니다.

회원가입은 계정을 만드는 일이고 로그인은 이미 저장된 자격 정보를 확인하는 일입니다. 로그인은 `AuthService`가 수동으로 처리하고, 이후 요청의 인증·인가는 Spring Security filter chain이 처리합니다. Authentication은 사용자의 신원을 확인하는 단계이고 Authorization은 확인된 사용자가 endpoint나 게시글에 접근할 수 있는지 판단하는 단계입니다.

Sequence 04의 JWT는 Access Token only이며 subject=email은 학습용 단순화입니다. Refresh Token과 Redis 기반 token 저장·회수는 범위 밖입니다. 운영에서는 변경되지 않는 userId를 권장합니다. 현재 authorities는 비어 있어 `authenticated` 여부와 게시글 ownership만 확인하고 Role 기반 인가는 다루지 않습니다. JWT payload는 암호화된 비밀 영역이 아니며, 브라우저 쿠키 저장으로 바꾸면 CSRF 정책을 다시 검토해야 합니다.

운영 배포 전에는 다음 항목을 별도로 확인합니다.

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`를 운영 비밀로 주입하고 `JPA_DDL_AUTO=validate` 또는 `none`을 사용합니다.
- email 소문자 정규화와 길이 제약 적용 전 기존 중복/초과 데이터를 점검하고 명시적인 스키마 마이그레이션을 수행합니다. `users.email`을 바꿀 때 연결된 `posts.author`도 같은 계정 매핑으로 함께 변경합니다.
- `SPRINGDOC_ENABLED=false`로 Swagger와 OpenAPI 문서를 닫습니다.
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`를 환경별로 고정합니다. single-key 구조에서는 이 값이 바뀌면 기존 access token이 모두 무효화됩니다.
- Access Token only 구조에는 개별 토큰 즉시 회수 저장소가 없으므로 TTL과 재인증 정책으로 위험을 제한합니다.
