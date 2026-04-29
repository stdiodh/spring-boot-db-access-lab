# 테스트와 검증 정답 가이드

## 정답을 보기 전에 먼저 확인할 것

- `TestFixtureFactory`에서 요청 DTO와 Entity, User를 재사용할 수 있게 준비했는가
- `PostServiceTest`에서 정상 케이스와 예외 케이스를 나눴는가
- `AuthServiceTest`에서 인증 성공과 실패를 각각 검증했는가
- TODO를 채운 뒤 `@Disabled`를 제거하고 `./gradlew test`를 다시 실행했는가

이번 answer 는 "테스트 코드를 완성했다"에서 끝나는 것이 아니라,
왜 지금은 service test 범위로 자른 것인지까지 함께 이해하는 기준입니다.

## 1. fixture 정답 포인트

- 게시글 요청과 저장 결과 Entity를 빠르게 만들 수 있어야 합니다.
- 로그인 요청과 사용자 fixture를 빠르게 만들 수 있어야 합니다.
- fixture는 복잡한 로직이 아니라 테스트 가독성을 위한 준비 도구에 가깝습니다.
- fixture 를 따로 둔 이유는 테스트 본문이 검증 흐름에 집중하게 만들기 위해서입니다.

예시 형태:

```kotlin
fun postEntity(
    id: Long = 1L,
    title: String = "테스트 제목",
    content: String = "테스트 내용",
    author: String = "tester"
): PostEntity = PostEntity(
    id = id,
    title = title,
    content = content,
    author = author
)
```

## 2. `PostServiceTest` 정답 포인트

### 정상 케이스

정답 흐름은 아래 순서입니다.

1. `postCreateRequest()`로 요청을 준비합니다.
2. `postEntity(...)`로 저장 결과를 준비합니다.
3. `postRepository.save(...)` mock을 설정합니다.
4. `postService.create(request)`를 호출합니다.
5. `id`, `title`, `content`, `author`를 검증합니다.

예시 핵심:

```kotlin
`when`(postRepository.save(any(PostEntity::class.java))).thenReturn(savedPost)

val result = postService.create(request)

assertEquals(1L, result.id)
assertEquals(request.title, result.title)
```

### 예외 케이스

정답 흐름은 아래 순서입니다.

1. `findById(999L)`가 빈 결과를 돌려주게 합니다.
2. `assertThrows`로 `PostNotFoundException` 발생을 확인합니다.

예시 핵심:

```kotlin
`when`(postRepository.findById(999L)).thenReturn(Optional.empty())

assertThrows(PostNotFoundException::class.java) {
    postService.getById(999L)
}
```

이 테스트의 포인트는 "실패도 별도 시나리오로 검증한다"는 데 있습니다.

## 3. `AuthServiceTest` 정답 포인트

### 인증 성공 테스트

1. `loginRequest()`를 준비합니다.
2. `passwordEncoder.encode(...)`로 저장된 사용자 비밀번호를 만듭니다.
3. `userRepository.findByEmail(...)`이 사용자를 돌려주게 설정합니다.
4. `authService.login(request)`를 호출합니다.
5. 토큰이 비어 있지 않은지, 토큰 안 email이 기대값과 같은지 확인합니다.

예시 핵심:

```kotlin
val encodedPassword = requireNotNull(passwordEncoder.encode(request.password))
val user = TestFixtureFactory.user(email = request.email, password = encodedPassword)
`when`(userRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

val result = authService.login(request)

assertFalse(result.accessToken.isBlank())
assertEquals(request.email, jwtTokenProvider.getEmail(result.accessToken))
```

여기서는 단순히 "문자열이 나왔다"보다
"그 토큰이 기대한 사용자를 다시 식별하는가"를 보는 것이 핵심입니다.

### 인증 실패 테스트

1. 저장된 사용자 비밀번호는 정상 비밀번호를 인코딩해서 둡니다.
2. 요청 비밀번호는 다른 값으로 준비합니다.
3. `assertThrows`로 `InvalidCredentialsException` 발생을 확인합니다.

예시 핵심:

```kotlin
val wrongPasswordRequest = TestFixtureFactory.loginRequest(
    email = "tester@example.com",
    password = "wrong-password"
)

assertThrows(InvalidCredentialsException::class.java) {
    authService.login(wrongPasswordRequest)
}
```

이 테스트는 사용자를 찾았더라도 인증이 실패할 수 있다는 점을 분리해서 보여줍니다.

## 4. 왜 이번에는 service test 에 집중하는가

정답 기준에서도 이번 시퀀스는 의도적으로 범위를 좁힙니다.

- 지금은 service 로직을 빠르게 다시 믿게 만드는 것이 목적입니다.
- controller, repository, integration 테스트를 한 번에 넣으면 무엇을 검증하는지 흐려질 수 있습니다.
- 그래서 mock 기반 service test 로 given / when / then 감각을 먼저 잡습니다.

## 5. 강사용 빠른 비교 포인트

- fixture는 재사용용 준비 코드인지
- 테스트 이름만 읽어도 무엇을 검증하는지 드러나는지
- 정상/실패 흐름이 각각 한 테스트에 한 동작만 담고 있는지
- `assertEquals`, `assertFalse`, `assertThrows`가 역할에 맞게 쓰였는지
- mock 을 왜 썼는지 설명할 수 있는지
- 지금은 왜 integration test 가 아닌지 설명할 수 있는지

## 6. answer 기준 완성 형태

`06-answer`에서는 아래 세 파일이 완성되어 있습니다.

- `src/test/kotlin/com/andi/rest_crud/support/TestFixtureFactory.kt`
- `src/test/kotlin/com/andi/rest_crud/service/PostServiceTest.kt`
- `src/test/kotlin/com/andi/rest_crud/service/AuthServiceTest.kt`

핵심은 테스트 개수를 늘리는 것이 아니라,
정상 케이스 1개, 예외 케이스 1개, 인증 흐름 2개 정도로
Service 테스트의 감각을 분명하게 잡는 것입니다.
