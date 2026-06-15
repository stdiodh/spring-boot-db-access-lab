# DB Access 통합 구현 안내

## 1. 해결할 문제

메모리 CRUD만으로는 서버 재시작 뒤 데이터를 보존할 수 없습니다.
DB를 붙인 뒤에는 잘못된 요청, 로그인 사용자 구분, 작성자 권한, 테스트 기준까지 함께 정리해야 합니다.

## 2. 시퀀스별 구현 흐름

- `02`: `PostEntity`와 `PostRepository`로 DB 저장/조회 흐름을 만듭니다.
- `03`: DTO Validation과 `GlobalExceptionHandler`로 실패 응답을 정리합니다.
- `04`: `AuthService`, `JwtTokenProvider`, `JwtAuthenticationFilter`로 로그인과 보호 API를 연결합니다.
- `05`: 05 브랜치에서 OAuth2 사용자 연결, SMTP 메일 발송, 계정 복구 흐름을 분리합니다.
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
실패 응답은 `GlobalExceptionHandler.kt`가 `ErrorResponse`로 정리합니다.

## 4. 실행/테스트

```bash
docker compose up -d
./gradlew test
./gradlew bootRun
```

Swagger에서 게시글 생성/조회/수정/삭제와 `/auth/signup`, `/auth/login`, `/auth/me` 흐름을 확인합니다.

## 5. 한계와 다음 개선 방향

이 레포의 목표는 DB 저장부터 인증과 테스트까지 기본 흐름을 잇는 것입니다.
조회 성능 문제는 Redis Cache 레포에서 다루고, 실시간 메시지는 Realtime Communication 레포에서 다룹니다.
