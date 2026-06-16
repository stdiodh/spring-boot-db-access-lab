# DB Access, 요청 안전성, 인증, 테스트 이론 정리

## 1. 저장과 인증 흐름은 왜 한 번에 무너지기 쉬울까?

메모리 CRUD는 서버를 재시작하면 데이터가 사라집니다.
DB를 붙이면 데이터는 남지만 Entity, Repository, transaction, 예외 처리, 인증 사용자 같은 새 책임이 함께 생깁니다.

요청 검증 없이 DB까지 내려가면 잘못된 값이 저장될 수 있습니다.
로그인 없이 보호 API를 열어 두면 누가 쓴 글인지 구분할 수 없습니다.
테스트 없이 기능을 이어 붙이면 정상 케이스와 실패 케이스가 섞여 어디가 깨졌는지 찾기 어렵습니다.

## 2. 배경: 02~06은 같은 코드 위에 책임을 쌓습니다

이 레포는 하나의 흐름을 단계별로 키웁니다.

1. `02`: Repository와 Entity로 DB 저장을 붙입니다.
2. `03`: DTO Validation과 `GlobalExceptionHandler`로 잘못된 요청을 정리합니다.
3. `04`: 로그인 요청에서 JWT를 발급하고 보호 API에서 검증합니다.
4. `05`: 외부 인증과 계정 복구를 별도 책임으로 분리합니다.
5. `06`: fixture와 mock으로 정상/실패 케이스를 재현합니다.

## 3. 선택한 방식

저장 흐름은 `Controller -> Service -> Repository -> Entity`로 둡니다.
요청 검증은 DTO에서 먼저 막고, 실패 응답은 전역 예외 처리에서 통일합니다.
인증은 로그인 성공 시 token을 발급하고, 보호 API 요청에서 token을 다시 읽어 현재 사용자를 구분합니다.
테스트는 Service 단위에서 Repository나 PasswordEncoder 같은 의존성을 mock으로 대체합니다.

## 4. 핵심 코드로 연결하기

현재 `main`에서 확인되는 공통 경로입니다.

- `src/main/kotlin/com/andi/rest_crud/controller/PostController.kt`: 게시글 요청을 받고 `Principal`의 사용자 정보를 Service로 넘깁니다.
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`: `PostEntity` 생성, 조회, 수정, 삭제와 작성자 검증을 처리합니다.
- `src/main/kotlin/com/andi/rest_crud/domain/PostEntity.kt`: DB에 저장되는 게시글 Entity입니다.
- `src/main/kotlin/com/andi/rest_crud/repository/PostRepository.kt`: Entity를 DB와 연결하는 Repository입니다.
- `src/main/kotlin/com/andi/rest_crud/controller/AuthController.kt`: 회원가입, 로그인, 현재 사용자 조회 요청을 받습니다.
- `src/main/kotlin/com/andi/rest_crud/service/AuthService.kt`: 회원가입 시 password를 encoding해 저장하고, 로그인 성공 시 JWT를 발급합니다.
- `src/main/kotlin/com/andi/rest_crud/exception/GlobalExceptionHandler.kt`: Validation, 404, 401, 403 예외 응답을 정리합니다.
- `src/main/kotlin/com/andi/rest_crud/security/JwtTokenProvider.kt`: 로그인 성공 후 token을 만들고 token에서 email을 읽습니다.
- `src/main/kotlin/com/andi/rest_crud/security/JwtAuthenticationFilter.kt`: Authorization header에서 Bearer token을 꺼내 인증 객체를 만듭니다.
- `src/test/kotlin/com/andi/rest_crud/service/PostServiceTest.kt`: 게시글 정상/실패 케이스를 Service 단위로 검증합니다.
- `src/test/kotlin/com/andi/rest_crud/support/TestFixtureFactory.kt`: 테스트 입력을 반복 없이 만듭니다.

05 시퀀스의 OAuth2/SMTP 전용 파일은 `05-implementation` 브랜치에서 확인합니다.
해당 브랜치 기준 핵심 경로는 `src/main/kotlin/com/andi/rest_crud/security/CustomOAuthUserService.kt`, `src/main/kotlin/com/andi/rest_crud/service/SmtpRecoveryMailSender.kt`, `src/main/kotlin/com/andi/rest_crud/service/AccountRecoveryService.kt`입니다.

왜 이 코드를 보는지 먼저 정리합니다.
DB 저장, 잘못된 요청, 로그인 사용자, 테스트 실패를 각각 다른 책임에서 처리하는지 확인하기 위해서입니다.
04 시퀀스에서는 `POST /auth/signup`으로 로컬 사용자를 만들고, `POST /auth/login` 성공 결과로 받은 token을 보호 API 요청의 기준으로 사용합니다.

```kotlin
fun create(request: PostCreateRequest, authorEmail: String): PostResponse {
    val savedPost = postRepository.save(
        PostEntity(
            title = request.title,
            content = request.content,
            author = authorEmail
        )
    )
    return PostResponse.from(savedPost)
}
```

이 코드는 요청 DTO를 DB Entity로 바꾸고 Repository에 저장하는 문제를 해결합니다.
Controller는 요청 입구를 맡고, Service는 저장 흐름과 응답 변환을 맡습니다.

## 5. 실행/테스트 결과로 확인할 것

로컬 실행은 DB가 필요하므로 의존 서비스를 먼저 띄웁니다.

```bash
docker compose up -d
./gradlew test
```

테스트에서는 정상 저장, 없는 게시글, 작성자 불일치, 로그인 실패, OAuth 사용자 password 로그인 차단 같은 흐름을 확인합니다.

## 6. 한계와 다음 개선 방향

이 레포는 DB, Validation, JWT, 외부 인증, 테스트를 한 흐름으로 묶어 보여줍니다.
하지만 Redis 캐시, WebSocket, 배포 자동화는 별도 레포에서 다룹니다.
DB 조회가 반복되어 느려지는 문제는 다음 Redis Cache 시퀀스에서 cache-aside 흐름으로 이어집니다.
