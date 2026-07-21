# DB Access 통합 구현 안내

## 1. 해결할 문제

메모리 CRUD만으로는 서버 재시작 뒤 데이터를 보존할 수 없습니다.
DB를 붙인 뒤에는 잘못된 요청, 로그인 사용자 구분, 작성자 권한, 테스트 기준까지 함께 정리해야 합니다.

## 2. 시퀀스별 구현 흐름

- `02`: `PostEntity`와 `PostRepository`로 DB 저장/조회 흐름을 만듭니다.
- `03`: DTO Validation과 `GlobalExceptionHandler`로 실패 응답을 정리합니다.
- `04`: `AuthService`, `JwtTokenProvider`, `JwtAuthenticationFilter`로 로그인과 보호 API를 연결합니다.
- `05`: 05 브랜치에서 profile 검증·계정 연결·redirect·token 발급/확정·SMTP adapter의 TODO 6개를 순서대로 구현합니다. 제공 scaffold가 hash 저장, 만료·회전·단일 사용과 AFTER_COMMIT 비동기 경계를 연결합니다.
- `06`: `PostServiceTest`, `AuthServiceTest`, `TestFixtureFactory`로 정상/실패 케이스를 검증합니다.

## 3. 핵심 코드

작성자만 게시글을 수정해야 하는 이유를 먼저 봅니다.
로그인 사용자를 구분하지 않으면 다른 사용자의 글을 수정할 수 있습니다.

```kotlin
private fun validateAuthor(post: PostEntity, currentUserEmail: String) {
    if (!post.isWrittenBy(currentUserEmail)) {
        throw ForbiddenPostAccessException(post.id)
    }
}
```

이 코드는 보호 API에서 현재 사용자와 게시글 작성자가 다른 문제를 403 흐름으로 보냅니다.
실패 응답은 `exception/ApiExceptionHandling.kt`의 `GlobalExceptionHandler`가 `ErrorResponse`로 정리합니다.

Sequence 04는 같은 책임을 여러 파일로 찾아다니지 않도록 아래 네 파일을 중심으로 읽습니다. 완성 코드의 `WHY:` 주석은 코드가 하는 일보다 해당 경계가 필요한 이유를 설명합니다.

| 파일 | 실습 범위 |
| --- | --- |
| `dto/ApiDtos.kt` | 요청 Validation과 API 응답 DTO |
| `exception/ApiExceptionHandling.kt` | 예외 종류와 400/401/403/404/409 응답 |
| `security/JwtAuthentication.kt` | JWT 발급·검증과 SecurityContext 연결 |
| `security/SecurityConfig.kt` | 인증 filter 순서와 공개·보호 경로 |

## 4. 실행/테스트

```bash
docker compose up -d --wait --wait-timeout 120
export JWT_SECRET='local-dev-only-jwt-secret-change-me-123456'
./gradlew test
./gradlew bootRun
```

Docker MySQL은 host `3307`에서 열리고 애플리케이션의 기본 `DB_URL`도 그 주소를 사용합니다. 별도 DB를 사용한다면 실행 전에 `DB_URL`을 재정의합니다.

Swagger에서 게시글 생성/조회/수정/삭제와 `/auth/signup`, `/auth/login`, `/auth/me` 흐름을 확인합니다.

브라우저에서 `http://localhost:8080/` 또는 `http://localhost:8080/auth-practice`를 열면 email과 password를 직접 입력해 `회원가입 -> 로그인 -> /auth/me`를 한 화면에서 확인할 수 있습니다. 로그인 후 표시되는 email이 입력한 계정과 같은지 확인합니다. Access Token은 페이지 메모리에만 있으므로 새로고침하면 다시 로그인해야 합니다. `04-implementation`에서 5xx 안내가 보이면 `AuthService.kt`, `ApiDtos.kt`, `ApiExceptionHandling.kt`, `JwtAuthentication.kt` 중 현재 단계의 TODO와 서버 로그를 확인합니다.

## 5. 인증과 요청 경계 구현 확인

- 회원가입은 계정 생성이고 로그인은 저장된 자격 정보 확인입니다. 수동 로그인 처리와 Spring Security의 이후 요청 인증·인가를 한 책임으로 섞지 않습니다.
- Authentication은 신원 확인, Authorization은 endpoint 접근 및 게시글 ownership 판단입니다.
- `04-implementation`에서는 Sequence 03의 DTO Validation과 `400` 예외 응답 TODO도 다시 완성합니다.
- 회원가입 email은 `Locale.ROOT`로 소문자 정규화하고 password는 trim하지 않습니다.
- 중복 조회를 BCrypt보다 먼저 실행하고, 저장 시 unique race는 `UserAlreadyExistsException`으로 변환합니다.
- JWT는 HS256, issuer, audience, issuedAt, expiration과 subject를 한 번의 parsing으로 검증합니다.
- 로그인 응답은 `accessToken`, `tokenType`, `expiresIn`과 `Cache-Control: no-store`를 포함합니다.
- Security가 만드는 401/403과 MVC 예외가 같은 `ErrorResponse` 구조를 사용합니다.
- 현재 JWT subject=email과 빈 authorities는 교육용 단순화입니다. Role 기반 인가, Refresh Token, Redis 기반 token 저장·회수는 이 구현에 없습니다.

운영에서는 기존 email 대소문자 중복과 DTO/컬럼 길이 초과 데이터를 먼저 진단합니다.

```sql
-- 소문자 정규화 시 충돌할 계정을 먼저 찾습니다.
SELECT LOWER(email), COUNT(*)
FROM users
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- 새 DTO/컬럼 계약을 넘는 기존 데이터를 확인합니다.
SELECT id FROM users WHERE CHAR_LENGTH(email) > 254;
SELECT id FROM users WHERE CHAR_LENGTH(password) > 100;
SELECT id FROM posts
WHERE CHAR_LENGTH(title) > 100
   OR CHAR_LENGTH(content) > 5000
   OR CHAR_LENGTH(author) > 254;
```

충돌과 초과 데이터를 정리한 뒤 스키마를 명시적으로 마이그레이션합니다. `users.email`을 소문자화한다면 ownership 비교가 끊기지 않도록 연결된 `posts.author`도 같은 계정 매핑과 transaction에서 함께 변경합니다. 자동 데이터 변환이나 migration 도구 도입은 이 가이드 변경 범위에 포함하지 않습니다. `JPA_DDL_AUTO=validate` 또는 `none`, `SPRINGDOC_ENABLED=false`를 사용하고 JWT 설정을 비밀 관리 체계에 둡니다.

## 6. 한계와 다음 개선 방향

이 레포의 목표는 DB 저장부터 인증과 테스트까지 기본 흐름을 잇는 것입니다.
조회 성능 문제는 Redis Cache 레포에서 다루고, 실시간 메시지는 Realtime Communication 레포에서 다룹니다.
