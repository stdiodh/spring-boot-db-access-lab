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
test -f .env || cp .env.example .env
docker compose config --quiet
docker compose up -d --wait --wait-timeout 120
./gradlew bootRun
```

복사한 `.env`의 값은 로컬 환경에 맞게 변경합니다. Spring Boot는 프로젝트 루트의 `.env`를 자동으로 읽으며, 같은 key가 OS 환경 변수에도 있으면 OS 환경 변수 값을 우선 사용합니다.

Docker MySQL은 로컬에 이미 설치된 MySQL의 `3306`과 충돌하지 않도록 host의 `3307`을 사용합니다. 다른 DB를 사용하려면 `.env`의 `DB_URL` 또는 OS 환경 변수를 변경합니다.

`JWT_SECRET`은 필수이며 UTF-8 기준 32바이트 이상이어야 합니다. 값이 없거나 짧으면 애플리케이션 시작이 실패합니다. `JWT_EXPIRATION_MS`의 기본값은 3,600,000ms이며, issuer와 audience는 `JWT_ISSUER`, `JWT_AUDIENCE`로 재정의할 수 있습니다. `.env.example`만 예시로 공유하고 실제 secret이 들어 있는 `.env`는 절대 커밋하지 않습니다.

Swagger UI 기본 경로:

```text
http://localhost:8080/swagger
```

Sequence 04 인증 실습 화면:

```text
http://localhost:8080/
http://localhost:8080/auth-practice
```

두 주소는 실제 화면인 `/auth-practice/index.html`로 이동합니다. email과 password를 직접 입력해 계정을 만든 뒤 로그인하면, 화면이 로그인 응답의 Access Token으로 `/auth/me`를 호출해 서버가 확인한 신원을 보여줍니다. Token은 브라우저 저장소가 아닌 현재 페이지의 JavaScript 메모리에만 보관합니다. `04-implementation`에서 API가 5xx를 반환하면 `AuthService.kt`, `ApiDtos.kt`, `ApiExceptionHandling.kt`, `JwtAuthentication.kt` 중 현재 단계의 TODO와 서버 로그를 확인합니다.

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
| 05 | OAuth 계정 정책, reset token 생명주기, AFTER_COMMIT SMTP와 외부 E2E 증거 구분 |
| 06 | Service 단위 테스트, 테스트 실행 순서, 보장 범위 읽기 |

실패하면 먼저 볼 것:

- 실패한 테스트 이름과 expected/actual 값을 먼저 읽습니다.
- 05 자동 테스트는 mock·fake로 외부 네트워크 없이 실행하고, 실제 Google·Gmail은 별도 수동 E2E로 확인합니다.
- 401은 인증 실패, 403은 인가 실패로 구분해서 봅니다.

완료 기준:

- 오늘 시퀀스의 테스트 기준이 통과합니다.
- 어떤 테스트가 어떤 개념을 확인하는지 설명할 수 있습니다.

`04-implementation`에서는 Sequence 03에서 배운 DTO Validation과 요청 본문 예외 처리도 다시 구현합니다. 회원가입·로그인·게시글 요청의 길이/형식 계약과 `400` 응답 TODO를 먼저 완성한 뒤 JWT 흐름을 연결합니다.

Sequence 04의 연관 코드는 책임별로 다음 파일에 모았습니다.

| 파일 | 한 번에 읽을 흐름 |
| --- | --- |
| `dto/ApiDtos.kt` | 회원가입·로그인·게시글의 요청 및 응답 DTO 계약 |
| `exception/ApiExceptionHandling.kt` | 도메인 예외, `ErrorResponse`, 전역 예외 변환 |
| `security/JwtAuthentication.kt` | JWT 발급·검증과 요청 인증 filter |
| `security/SecurityConfig.kt` | Clock, 401/403 JSON, 공개·보호 endpoint 설정 |

`04-answer`와 `main`의 완성 코드에는 핵심 블록 위에 `WHY:` 주석을 두어 구현 결과뿐 아니라 그 경계를 선택한 이유도 함께 읽을 수 있습니다.

## 05 시퀀스 단계

05는 하나의 브랜치 쌍을 사용하지만 내부 학습은 세 단계로 나눕니다. 학생이 직접 구현하는 범위는 5개 파일의 TODO 6개입니다.

| 단계 | 주제 | 핵심 |
| --- | --- | --- |
| 05-A | OAuth2 로그인 | profile 정규화, verified email, provider identity, 자동 연결 금지, JWT fragment redirect |
| 05-B | 계정 복구 | raw/hash 분리, 15분 만료, 1분 cooldown, 회전·단일 사용, BCrypt 비밀번호 변경 |
| 05-C | SMTP 발송 | commit 이후 bounded async event, SMTP adapter, 공개 202와 실제 배달 증거 구분 |

실제 Google client secret이나 SMTP password는 문서와 코드에 쓰지 않습니다.
공식 05 브랜치의 기본 SMTP는 로컬 Mailpit이므로 Gmail credential 없이 메일과 reset link를 시연할 수 있습니다. OAuth 자동 테스트도 외부 네트워크를 사용하지 않지만 실제 Google callback은 유효한 client credential이 있어야 합니다.
같은 email의 로컬 계정은 자동 연결하지 않으며, OAuth JWT와 reset token은 URL query가 아니라 fragment로 받은 뒤 실습 화면이 메모리로 옮기고 URL에서 제거합니다.

[Visual Lab에서 OAuth와 복구 생명주기 비교하기](./docs/visual-lab/sequences/05/)

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
