# 테스트와 검증 이론 정리

이미 만든 기능을 다시 믿을 수 있게 만드는 가장 작은 테스트 흐름을 익히는 문서입니다.

이번 주차 한 줄 요약  
`PostService`와 `AuthService`를 대상으로 정상 케이스와 실패 케이스를 나눠 테스트하면서, 테스트가 왜 필요한지 실감하는 단계입니다.

## 먼저 이것만 기억해도 됩니다

- 테스트는 기능이 맞는지 확인하는 도구입니다.
- 테스트는 변경 후 회귀를 막는 안전장치이기도 합니다.
- 이번 시퀀스는 Service 단위 테스트에만 집중합니다.

## 이 주제를 왜 배우는가

05 시퀀스까지 오면 기능은 꽤 많이 붙어 있습니다.
그런데 기능이 늘어날수록 "이걸 고친 뒤에도 기존 동작이 그대로일까?"라는 걱정이 함께 커집니다.

그래서 이번 실습에서는 새로운 기능을 더 붙이기보다,
이미 만든 Service 흐름을 테스트로 다시 확인해봅니다.
이 감각이 잡혀야 다음에 캐시나 확장 기능이 들어와도
"변경 전후를 어떻게 확인할지"를 자연스럽게 생각할 수 있습니다.

## 기초 개념 먼저 잡기

### test

- 무엇인가요  
  코드가 기대한 결과를 내는지 확인하는 실행 가능한 검증입니다.
- 왜 필요한가요  
  기능이 늘어날수록 "수정 후에도 기존 동작이 맞는가"를 사람이 기억만으로 확인하기 어려워지기 때문입니다.
- 이번 코드에서는 어디에 보이나요  
  `PostServiceTest.kt`, `AuthServiceTest.kt`

### service test

- 무엇인가요  
  controller, DB 전체, 브라우저 전체가 아니라 service 로직 흐름에 집중하는 테스트입니다.
- 왜 필요한가요  
  지금은 service 안의 분기와 결과를 다시 믿게 만드는 것이 가장 중요한 단계이기 때문입니다.
- 이번 코드에서는 어디에 보이나요  
  `postService.create(...)`, `postService.getById(...)`, `authService.login(...)`

### fixture

- 무엇인가요  
  테스트에서 반복해서 사용할 입력값과 객체를 미리 만들어두는 도구입니다.
- 왜 필요한가요  
  테스트마다 준비 코드가 길어지지 않게 해서, 본문이 검증 흐름에 집중되게 해줍니다.
- 이번 코드에서는 어디에 보이나요  
  `TestFixtureFactory`

### mock

- 무엇인가요  
  실제 DB나 외부 의존성 대신, 테스트 안에서 원하는 동작만 흉내 내는 객체입니다.
- 왜 필요한가요  
  이번 시퀀스에서는 service 로직 자체를 보고 싶지, DB 설정 전체를 다시 검증하려는 것이 아니기 때문입니다.
- 이번 코드에서는 어디에 보이나요  
  `postRepository.save(...)`, `userRepository.findByEmail(...)` 설정 부분

### regression

- 무엇인가요  
  수정 후 원래 되던 기능이 깨지는 상황입니다.
- 왜 필요한가요  
  지금처럼 기능이 많아질수록 회귀를 빨리 찾는 장치가 필요하기 때문입니다.
- 이번 코드에서는 어디에 보이나요  
  `./gradlew test` 를 다시 돌려 기존 흐름을 확인하는 전체 과정

## 이번 실습 흐름을 먼저 한눈에 보기

1. 테스트가 Service를 직접 호출합니다.
2. fixture와 mock으로 필요한 입력과 의존성을 준비합니다.
3. 정상 케이스에서는 기대한 값이 나오는지 확인합니다.
4. 실패 케이스에서는 예외가 발생하는지 확인합니다.
5. 결과를 보고 다시 실행하면서 기존 기능을 신뢰할 수 있는지 확인합니다.

짧게 말하면 이번 실습은  
given 준비 -> Service 호출 -> 결과 검증 -> 다시 실행 흐름을 익히는 과정입니다.

한 줄로 다시 보기  
기능을 만드는 단계에서 한 걸음 물러나, 지금까지 만든 코드를 다시 믿을 수 있게 만드는 실습입니다.

## 현재 코드 흐름에서 어디를 보면 되는가

이번 시퀀스는 기능을 새로 만드는 단계가 아니라,
이미 있는 service 흐름을 테스트 코드에서 다시 따라가는 단계입니다.

1. `PostService.kt`
   게시글 생성과 조회 예외 흐름의 테스트 대상입니다.
2. `AuthService.kt`
   로그인 성공과 실패 흐름의 테스트 대상입니다.
3. `TestFixtureFactory.kt`
   fixture 를 모아 테스트 준비 코드를 짧게 만드는 지점입니다.
4. `PostServiceTest.kt`
   CRUD service 테스트의 가장 작은 예시입니다.
5. `AuthServiceTest.kt`
   인증 흐름도 service 테스트 대상이 될 수 있음을 보여주는 예시입니다.

짧게 말하면 이번 시퀀스는

- `fixture 준비 -> Service 호출 -> 결과 검증`
- `정상 케이스 -> 실패 케이스 -> 다시 실행`

흐름을 반복하며 신뢰를 쌓는 단계입니다.

## 오늘 꼭 잡아야 할 질문

- 테스트는 왜 지금 시점에 필요한가요?
- 정상 케이스와 예외 케이스는 무엇이 다른가요?
- fixture와 mock은 각각 어떤 역할을 하나요?
- 이번 코드에서 가장 중요한 테스트 클래스는 무엇인가요?
- 다음 시퀀스로 가기 전에 무엇을 신뢰할 수 있어야 하나요?

## 중요한 코드 먼저 보기

### 1. 정상 흐름을 검증하는 테스트

```kotlin
@Test
fun `create는 요청 값을 저장하고 응답으로 돌려준다`() {
    val request = TestFixtureFactory.postCreateRequest()
    // 테스트에서 쓸 입력값을 fixture로 준비합니다.

    val savedPost = TestFixtureFactory.postEntity(
        id = 1L,
        title = request.title,
        content = request.content,
        author = request.author
    )
    // repository가 저장 후 돌려줄 값을 미리 만듭니다.

    `when`(postRepository.save(any(PostEntity::class.java))).thenReturn(savedPost)
    // 실제 DB 대신 mock이 이 값을 돌려주게 준비합니다.

    val result = postService.create(request)
    // 이번에 확인하고 싶은 Service 동작을 호출합니다.

    assertEquals(request.title, result.title)
    // 기대한 값이 그대로 응답에 담기는지 확인합니다.
}
```

- 이 코드는 정상 케이스 테스트의 전체 흐름을 보여줍니다.
- 여기서는 특히 `given -> when -> then` 순서가 보이는지 먼저 보세요.
- 학생이 기억해야 할 핵심은 "테스트는 준비하고, 호출하고, 확인하는 흐름"입니다.
- 파일: `src/test/kotlin/com/andi/rest_crud/service/PostServiceTest.kt`

### 2. 실패 흐름을 검증하는 테스트

```kotlin
@Test
fun `getById는 없는 게시글 id면 예외 흐름을 확인한다`() {
    `when`(postRepository.findById(999L)).thenReturn(Optional.empty())
    // 없는 게시글 상황을 mock으로 만듭니다.

    assertThrows(PostNotFoundException::class.java) {
        postService.getById(999L)
    }
    // 기대한 예외가 실제로 발생하는지 확인합니다.
}
```

- 이 코드는 예외 케이스 테스트를 보여줍니다.
- 학생이 기억해야 할 핵심은 "실패도 테스트 대상"이라는 점입니다.
- 파일: `src/test/kotlin/com/andi/rest_crud/service/PostServiceTest.kt`

### 3. 인증 흐름도 테스트하는 코드

```kotlin
@Test
fun `login은 올바른 이메일과 비밀번호면 access token을 만든다`() {
    val request = TestFixtureFactory.loginRequest()
    val encodedPassword = requireNotNull(passwordEncoder.encode(request.password))
    val user = TestFixtureFactory.user(email = request.email, password = encodedPassword)

    `when`(userRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

    val result = authService.login(request)

    assertFalse(result.accessToken.isBlank())
    assertEquals(request.email, jwtTokenProvider.getEmail(result.accessToken))
}
```

- 이 코드는 인증 성공 흐름도 테스트 대상이 된다는 점을 보여줍니다.
- 학생이 기억해야 할 핵심은 "Service 테스트는 CRUD에만 국한되지 않는다"는 점입니다.
- 파일: `src/test/kotlin/com/andi/rest_crud/service/AuthServiceTest.kt`

## 핵심 용어를 쉬운 말로 정리하기

### fixture

- 뜻  
  테스트에서 반복해서 사용할 입력값과 객체를 미리 만들어두는 도구입니다.
- 왜 중요한가  
  테스트마다 값을 새로 손으로 적지 않아도 돼서 흐름이 더 잘 보입니다.
- 이번 코드에서는 어디에 보이는가  
  `TestFixtureFactory` 안의 `postCreateRequest()`, `postEntity()`, `loginRequest()`, `user()`에서 볼 수 있습니다.
- 짧은 상황 예시  
  게시글 생성 테스트를 할 때 제목, 내용, 작성자를 빠르게 준비할 수 있습니다.

### mock

- 뜻  
  실제 DB나 외부 의존성 대신, 테스트 안에서 원하는 동작만 흉내 내는 객체입니다.
- 왜 중요한가  
  Service 로직만 따로 확인하고 싶을 때 DB까지 같이 띄우지 않아도 됩니다.
- 이번 코드에서는 어디에 보이는가  
  `mock(PostRepository::class.java)`, `mock(UserRepository::class.java)`에서 볼 수 있습니다.
- 짧은 상황 예시  
  `findById(999L)`가 빈 결과를 돌려주는 상황을 손쉽게 만들 수 있습니다.

### given-when-then

- 뜻  
  준비(given), 실행(when), 검증(then) 순서로 테스트를 읽기 쉽게 만드는 방식입니다.
- 왜 중요한가  
  테스트가 길어져도 어떤 값을 준비했고 무엇을 확인하는지 덜 헷갈립니다.
- 이번 코드에서는 어디에 보이는가  
  각 테스트 메서드의 TODO 주석과 테스트 흐름에서 볼 수 있습니다.
- 짧은 상황 예시  
  요청 DTO를 만들고, Service를 호출하고, 응답 제목을 검증하는 순서가 바로 이 구조입니다.

### unit test 와 integration test 의 감각 차이

- 뜻  
  unit test 는 작은 범위에 집중하고, integration test 는 여러 계층이나 실제 연결을 함께 봅니다.
- 왜 중요한가  
  지금은 모든 테스트를 다 하려는 것이 아니라, 현재 목적에 맞는 범위를 고르는 감각이 필요하기 때문입니다.
- 이번 코드에서는 어디에 보이는가  
  지금 시퀀스는 `service test + mock` 중심으로 설계되어 있습니다.
- 짧은 상황 예시  
  `PostService.create()`만 보고 싶을 때는 mock 기반 service test 가 더 빠르고 선명합니다.

## 핵심 개념 설명

### 1. 테스트는 결과 확인 도구입니다

테스트는 "이 코드가 원하는 결과를 내는가"를 빠르게 확인하는 방법입니다.
이번 실습에서는 `PostService.create()`가 요청 값을 잘 저장하는지,
`AuthService.login()`이 실제로 토큰을 만드는지 같은 결과를 확인합니다.

### 2. 테스트는 회귀 방지 장치입니다

회귀는 원래 되던 기능이 수정 후에 깨지는 상황을 말합니다.
지금처럼 기능이 늘어나는 시점에는 테스트가 있어야
"수정했더니 예전 로그인 흐름이 깨졌다" 같은 문제를 빨리 찾을 수 있습니다.

### 3. 실패도 테스트해야 구조가 보입니다

정상 케이스만 보면 코드가 안전해 보일 수 있습니다.
하지만 실제 서비스는 없는 게시글 조회, 잘못된 비밀번호처럼
실패 상황도 자주 만나기 때문에 예외 흐름을 같이 검증해야 구조가 더 또렷하게 보입니다.

## 실무에서 한 번 더 보기

이번 시퀀스의 실무 확장 개념은 아래 두 가지입니다.

- 테스트 범위 구분
- 테스트 더블 사용 기준

### 1. 왜 지금은 service test 에 집중하는가

05 시퀀스까지 오면 기능은 늘어났지만,
지금 가장 먼저 확인해야 하는 것은 "service 로직이 기대한 값을 내는가"입니다.

그래서 이번 시퀀스에서는 의도적으로 아래 범위를 제외합니다.

- controller test
- repository test
- integration test
- e2e test

이건 중요하지 않아서가 아니라,
이번 단계에서는 검증 범위를 좁혀서 테스트 감각을 먼저 잡기 위해서입니다.

### 2. 처음 보면 자연스러운 문제 코드

```kotlin
val context = SpringApplication.run(App::class.java)
val postService = context.getBean(PostService::class.java)
val result = postService.create(request)
```

이런 방식은 실행 자체는 가능하지만,

- 지금 실패가 service 로직 때문인지
- DB 설정 때문인지
- 다른 bean wiring 때문인지

구분하기 어려워질 수 있습니다.

### 3. 해결 방향 코드

```kotlin
val postRepository = mock(PostRepository::class.java)
val postService = PostService(postRepository)

`when`(postRepository.save(any(PostEntity::class.java))).thenReturn(savedPost)

val result = postService.create(request)
assertEquals(request.title, result.title)
```

이 흐름이면 "이번 테스트는 PostService.create 로직을 본다"는 범위가 분명해집니다.

### 4. fixture 를 왜 따로 두는가

```kotlin
val request = TestFixtureFactory.postCreateRequest()
```

fixture 는 단순 편의 기능이 아니라,
테스트 본문이 준비 코드로 길어지는 것을 막아줍니다.

즉, fixture 는 "더 짧게 쓰기 위한 도구"이면서 동시에
"무엇을 검증하는지 더 잘 보이게 하는 도구"입니다.

## 이번 실습에서 꼭 보면 좋은 포인트

- fixture를 쓰면 테스트 본문이 얼마나 짧아지는지
- mock으로 "없는 게시글" 같은 상황을 얼마나 쉽게 만들 수 있는지
- `assertEquals`와 `assertThrows`가 각각 어떤 상황에 쓰이는지
- JWT 테스트에서 토큰 문자열 자체보다 "토큰 안의 email"을 검증하는 이유가 무엇인지

## 자주 헷갈리는 포인트

- 테스트는 무조건 DB를 띄워야 하는 것이 아닙니다.
- 이번 시퀀스는 controller 테스트나 통합 테스트까지 넓히지 않습니다.
- fixture는 진짜 로직이 아니라 테스트 입력을 정리하는 도구입니다.
- mock은 "가짜라서 의미 없다"가 아니라 "이번에는 Service만 집중해서 본다"는 뜻에 가깝습니다.
- mock 을 썼다고 테스트가 낮은 가치가 되는 것은 아니고, 검증 범위가 다를 뿐입니다.

## 직접 말해보기

- 지금 시점에서 테스트가 왜 필요한가요?
- 정상 케이스와 예외 케이스는 각각 무엇을 확인하나요?
- fixture와 mock은 어떤 차이가 있나요?
- `PostServiceTest`와 `AuthServiceTest`는 각각 어떤 흐름을 검증하나요?

## 복습 체크리스트

- [ ] 테스트가 왜 필요한지 한 문장으로 설명할 수 있습니다.
- [ ] 정상 케이스와 예외 케이스를 구분해서 설명할 수 있습니다.
- [ ] fixture와 mock이 각각 어디에 쓰이는지 말할 수 있습니다.
- [ ] 왜 지금은 service test 에 집중하는지 설명할 수 있습니다.
- [ ] unit test 와 integration test 의 감각 차이를 설명할 수 있습니다.
- [ ] `PostService`와 `AuthService` 테스트 흐름을 다시 설명할 수 있습니다.
- [ ] 테스트가 구조 점검 도구라는 점을 이해했습니다.

## 오늘 실습에서 꼭 기억할 것

이번 시퀀스의 핵심은 테스트 문법을 많이 외우는 것이 아닙니다.
대신 "이미 만든 기능을 다시 믿기 위해 어떤 테스트를 붙이면 되는가"를 손으로 직접 연결해보는 것입니다.

## 다음 실습과 연결하기

다음 시퀀스에서 캐시나 성능 관련 흐름이 붙기 시작하면,
"이 변경이 기존 기능을 깨뜨리지 않았는가"를 더 자주 확인해야 합니다.
그래서 이번 테스트 시퀀스는 다음 확장 실습으로 넘어가기 전 안전장치를 준비하는 단계입니다.
