# 안전한 요청 처리 이론 정리

> 사용자가 보낸 값을 그대로 믿지 않고, 실패도 설계 대상으로 다루는 감각을 익히는 문서입니다.

> 이번 시퀀스 한 줄 요약  
> CRUD가 동작하는 것만으로는 충분하지 않기 때문에, DTO 분리와 Validation, 예외 응답 통일을 붙여 안전한 요청 흐름을 만드는 단계입니다.

## 먼저 이것만 기억해도 됩니다

- 요청 DTO와 응답 DTO는 Entity와 같은 역할이 아닙니다.
- Validation은 요청 초입에서 잘못된 입력을 막는 장치입니다.
- Exception Handling은 에러를 숨기는 것이 아니라 실패 응답을 일정하게 만드는 일입니다.
- 기본 `@NotBlank`만으로는 부족한 순간이 있고, 그때 커스텀 Validation이 필요해집니다.

## 이 주제를 왜 배우는가

`02`에서는 게시글을 저장하고 조회하는 기본 CRUD 흐름을 만들었습니다.
그런데 그 상태로는 빈 문자열, 잘못된 값, 존재하지 않는 게시글 같은 상황을 제대로 설명하기 어렵습니다.

그래서 이번 실습에서는
"입력을 어디까지 믿을 수 있을까",
"실패했을 때도 왜 응답 구조가 필요할까"를 코드로 직접 확인합니다.
이 흐름을 이해하면 다음에는 인증과 JWT처럼 더 민감한 입력도 같은 감각으로 다룰 수 있습니다.

## 이번 실습 흐름을 먼저 한눈에 보기

1. 클라이언트가 `POST /posts` 또는 `PUT /posts/{id}` 요청을 보냅니다.
2. Controller가 `@Valid`와 함께 요청 DTO를 받습니다.
3. DTO 필드 검증이 먼저 동작합니다.
4. Service는 DTO를 이용해 저장 또는 수정 흐름을 처리합니다.
5. 없는 게시글이면 비즈니스 예외를 던집니다.
6. `GlobalExceptionHandler`가 실패를 `ErrorResponse` 형태로 정리합니다.

짧게 말하면 이번 실습은  
**요청 DTO -> Validation -> Service -> 비즈니스 예외 또는 성공 응답 -> 통일된 실패 응답** 흐름을 익히는 과정입니다.

> 한 줄로 다시 보기  
> 요청을 받는 것에서 끝나지 않고, 잘못된 요청과 실패한 요청까지 설계하는 실습입니다.

## 오늘 꼭 잡아야 할 질문

- 왜 Entity를 요청/응답에 그대로 쓰면 안 될까요?
- Validation은 정확히 어디서 동작하나요?
- 검증 실패와 비즈니스 예외는 무엇이 다른가요?
- 실패 응답을 왜 같은 모양으로 내려줘야 할까요?

## 중요한 코드 먼저 보기

### 1. 요청 초입에서 입력을 막는 코드

```kotlin
data class PostCreateRequest(
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    val title: String,
    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    val content: String,
    @field:NotBlank(message = "author는 비어 있을 수 없습니다.")
    val author: String
)
```

- 이 코드는 "잘못된 입력을 어디서 막는가"를 보여줍니다.
- 학생은 여기서 `@NotBlank`가 요청 초입의 안전장치라는 점을 먼저 잡으면 됩니다.
- 파일: `src/main/kotlin/com/andi/rest_crud/dto/PostCreateRequest.kt`

### 2. Controller가 `@Valid`로 검증을 연결하는 코드

```kotlin
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
fun create(@Valid @RequestBody request: PostCreateRequest): PostResponse {
    return postService.create(request)
    // Controller는 직접 검증 로직을 풀지 않고,
    // 검증이 끝난 요청만 Service로 넘깁니다.
}
```

- 이 코드는 Validation이 실제 요청 흐름과 만나는 지점입니다.
- 학생은 `@Valid`가 붙는 위치와 Service 위임 흐름을 같이 봐야 합니다.
- 파일: `src/main/kotlin/com/andi/rest_crud/controller/PostController.kt`

### 3. 비즈니스 예외를 분리하는 코드

```kotlin
private fun findPostById(id: Long): PostEntity {
    return postRepository.findById(id)
        .orElseThrow { PostNotFoundException(id) }
    // 없는 게시글이면 NoSuchElementException 대신
    // 우리 서비스 의미가 드러나는 예외를 던집니다.
}
```

- 이 코드는 "왜 비즈니스 예외가 필요한가"를 보여줍니다.
- 학생은 단순한 시스템 예외 대신, 도메인 의미가 있는 예외를 만드는 이유를 여기서 잡으면 됩니다.
- 파일: `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`

### 4. 실패 응답을 통일하는 코드

```kotlin
data class ErrorResponse(
    val code: String,
    val message: String,
    val errors: Map<String, String> = emptyMap()
)
```

- 이 코드는 실패 응답의 공통 모양을 보여줍니다.
- 학생은 "실패도 응답 계약"이라는 감각을 여기서 잡으면 됩니다.
- 파일: `src/main/kotlin/com/andi/rest_crud/exception/ErrorResponse.kt`

## 핵심 용어를 쉬운 말로 정리하기

### DTO

- **뜻**  
  요청과 응답에 필요한 값만 담는 객체입니다.
- **왜 중요한가**  
  Entity를 그대로 바깥에 노출하지 않기 위해 필요합니다.
- **이번 코드에서는 어디에 보이는가**  
  `PostCreateRequest`, `PostUpdateRequest`, `PostResponse`
- **짧은 상황 예시**  
  글 생성 요청에는 `title`, `content`, `author`만 받으면 충분합니다.

### Validation

- **뜻**  
  요청값이 최소 조건을 만족하는지 확인하는 과정입니다.
- **왜 중요한가**  
  비어 있는 제목 같은 잘못된 입력을 서비스 로직 안쪽까지 들이지 않기 위해 필요합니다.
- **이번 코드에서는 어디에 보이는가**  
  `@Valid`, `@NotBlank`
- **짧은 상황 예시**  
  제목이 빈 문자열이면 저장 로직으로 들어가기 전에 바로 실패합니다.

### 비즈니스 예외

- **뜻**  
  서비스 규칙이 깨졌을 때 도메인 의미를 담아 던지는 예외입니다.
- **왜 중요한가**  
  "없는 게시글"처럼 서비스 의미가 분명한 실패를 구분해 설명할 수 있습니다.
- **이번 코드에서는 어디에 보이는가**  
  `PostNotFoundException`
- **짧은 상황 예시**  
  `GET /posts/999` 요청에서 해당 id가 없으면 이 예외가 발생합니다.

### Exception Handling

- **뜻**  
  발생한 예외를 일정한 응답 형태로 바꾸는 처리입니다.
- **왜 중요한가**  
  실패 응답이 매번 제각각이면 클라이언트도, 학생도 흐름을 파악하기 어렵습니다.
- **이번 코드에서는 어디에 보이는가**  
  `GlobalExceptionHandler`, `ErrorResponse`
- **짧은 상황 예시**  
  검증 실패는 `VALIDATION_ERROR`, 없는 게시글은 `POST_NOT_FOUND`로 응답합니다.

## 핵심 개념 설명

### DTO 분리

DTO 분리는 요청과 응답에서 필요한 값만 따로 다루는 방식입니다.
이게 필요한 이유는 DB와 직접 연결된 Entity를 외부 요청/응답 모델로 그대로 쓰면 역할이 섞이기 때문입니다.
이번 코드에서는 `PostResponse.from(...)`가 그 분리 지점을 보여줍니다.

### Validation

Validation은 "나쁜 입력을 빨리 막자"는 생각입니다.
Service 안쪽에서 `if (title.isBlank())`를 뒤늦게 확인하는 것보다,
요청 초입에서 `@Valid`와 `@NotBlank`로 막는 쪽이 흐름이 훨씬 명확합니다.

### 예외 응답 통일

예외를 통일한다는 것은 에러를 없애는 것이 아닙니다.
어떤 실패가 일어났는지 `code`, `message`, `errors`로 설명 가능하게 만드는 일입니다.
이번 실습에서는 검증 실패와 게시글 없음 실패를 같은 틀로 보게 됩니다.

## 실무에서 한 번 더 보기

이번 시퀀스의 메인 구현은 기본 `@NotBlank`와 `@Valid`, 예외 응답 통일로 유지합니다.
하지만 실무에서는 금방 “비어 있지는 않지만 우리 서비스 규칙상 막아야 하는 입력”을 만나게 됩니다.

### 1. 기본 Validation만으로는 부족한 순간

예를 들어 게시글 제목에 아래 같은 규칙이 있다고 가정해보겠습니다.

- `광고`
- `무료`
- `대출`

이런 금지어가 제목에 들어가면 저장되면 안 됩니다.
그런데 아래 요청은 비어 있지 않으므로 `@NotBlank`만으로는 통과합니다.

```json
{
  "title": "무료 대출 이벤트",
  "content": "지금 바로 신청하세요",
  "author": "marketing-bot"
}
```

즉, 기본 Validation은 **값이 있는지**는 검사하지만
**우리 서비스가 허용하는 값인지**까지는 알지 못합니다.

### 2. 처음 보면 자연스러운 문제 코드

이 상황에서 처음에는 Service 안쪽에서 아래처럼 막고 싶어질 수 있습니다.

```kotlin
fun create(request: PostCreateRequest): PostResponse {
    if (request.title.contains("무료") || request.title.contains("광고")) {
        throw IllegalArgumentException("허용되지 않는 제목입니다.")
    }

    val entity = PostEntity(
        title = request.title,
        content = request.content,
        author = request.author
    )

    return PostResponse.from(postRepository.save(entity))
}
```

- 이 코드는 처음 보면 단순하고 빠르게 보입니다.
- 하지만 검증 규칙이 늘어나면 Service가 저장 흐름과 입력 정책을 함께 떠안게 됩니다.

### 3. 그래서 왜 흐름이 지저분해지는가

Service 안쪽 `if` 검증이 많아지면 아래 문제가 생깁니다.

1. **요청 초입에서 막히지 않습니다.**  
   이미 Service 안쪽까지 들어온 뒤에야 잘못된 입력을 발견합니다.

2. **비즈니스 처리와 입력 검증이 섞입니다.**  
   저장 흐름을 읽고 싶은데, 중간마다 문자열 검사 코드가 끼어듭니다.

3. **같은 규칙을 재사용하기 어렵습니다.**  
   생성 요청과 수정 요청에서 같은 검증이 필요하면 중복되기 쉽습니다.

4. **실패 응답도 일관되기 어려워집니다.**  
   어떤 곳은 `IllegalArgumentException`, 어떤 곳은 `BadRequestException`처럼 흩어질 수 있습니다.

쉽게 말하면, 기본 `@NotBlank`로 막을 수 없는 규칙을 모두 Service 안쪽 `if`로 처리하면
요청 검증과 저장 로직의 경계가 흐려집니다.

### 4. 대표 해결 코드는 어떻게 생기는가

이럴 때는 커스텀 annotation과 validator를 따로 만들어서
“요청 초입 검증” 흐름 안에서 처리하는 방식을 자주 씁니다.

```kotlin
@Target(AnnotationTarget.FIELD)
@Retention(AnnotationRetention.RUNTIME)
@Constraint(validatedBy = [NoForbiddenTitleWordsValidator::class])
annotation class NoForbiddenTitleWords(
    val message: String = "허용되지 않는 제목입니다.",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = []
)
```

```kotlin
class NoForbiddenTitleWordsValidator : ConstraintValidator<NoForbiddenTitleWords, String> {
    private val forbiddenWords = listOf("광고", "무료", "대출")

    override fun isValid(value: String?, context: ConstraintValidatorContext): Boolean {
        if (value.isNullOrBlank()) return true
        return forbiddenWords.none { forbiddenWord -> value.contains(forbiddenWord) }
    }
}
```

그리고 DTO에서는 이런 식으로 연결할 수 있습니다.

```kotlin
data class PostCreateRequest(
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:NoForbiddenTitleWords
    val title: String,
    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    val content: String,
    @field:NotBlank(message = "author는 비어 있을 수 없습니다.")
    val author: String
)
```

이렇게 바꾸면 의도는 분명합니다.

- 기본 검증은 기본 검증대로 유지하고
- 서비스 고유 규칙은 커스텀 validator로 따로 분리하고
- 요청 초입에서 같은 방식으로 실패를 돌려주겠다는 것입니다.

### 5. 이번 시퀀스에서는 어디까지 다루는가

이번 시퀀스에서는 아래까지만 가져갑니다.

- DTO 분리
- 기본 `@NotBlank`와 `@Valid`
- 검증 실패와 비즈니스 예외 분리
- 커스텀 Validation이 왜 필요한지와 어떤 코드 모양인지 이해하는 것

다만 이번 메인 구현은 여전히 기본 Validation 중심입니다.
즉 지금 단계에서는 커스텀 annotation과 validator를 starter 핵심 구현 범위에 모두 넣기보다,
**문제 입력 -> 기본 검증의 한계 -> 커스텀 validator 코드 예시**까지 설명할 수 있는 상태를 목표로 잡습니다.

## 자주 헷갈리는 포인트

- DTO 분리는 "클래스를 많이 만드는 일"이 아니라 역할을 나누는 일입니다.
- Validation이 붙었다고 Service 검증이 완전히 사라지는 것은 아닙니다.
- 검증 실패와 비즈니스 예외는 둘 다 실패지만, 발생 이유와 응답 의도가 다릅니다.
- Exception Handling은 서버 로그를 감추는 기술이 아니라 클라이언트 응답을 정리하는 기술입니다.
- 기본 Validation과 커스텀 Validation은 경쟁 관계가 아니라 역할 분담입니다.

## 직접 말해보기

- 왜 Entity를 요청/응답 모델로 그대로 쓰면 안 될까요?
- `@Valid`는 어디에서 어떤 역할을 하나요?
- 빈 제목 요청과 없는 게시글 조회 실패는 왜 다른 종류의 실패인가요?
- 실패 응답이 통일되어 있으면 어떤 점이 좋아질까요?
- `@NotBlank`만으로는 막히지 않는 입력이 있다면 어떤 커스텀 검증이 필요할까요?

## 복습 체크리스트

- [ ] 요청 DTO와 응답 DTO를 왜 나누는지 설명할 수 있습니다.
- [ ] Validation이 요청 초입에서 동작한다는 점을 설명할 수 있습니다.
- [ ] 검증 실패와 비즈니스 예외 차이를 말할 수 있습니다.
- [ ] `ErrorResponse`가 왜 필요한지 설명할 수 있습니다.
- [ ] 성공 요청과 실패 요청을 Swagger에서 직접 비교할 수 있습니다.
- [ ] 기본 Validation과 커스텀 Validation이 언제 갈리는지 설명할 수 있습니다.

## 오늘 꼭 기억할 것

이번 시퀀스의 핵심은 "기능이 된다"에서 멈추지 않는 것입니다.
백엔드 개발자는 입력을 그대로 믿지 않고, 실패했을 때도 어떤 응답을 내려줄지 함께 설계해야 합니다.
그리고 기본 검증으로 설명되지 않는 서비스 규칙이 생기면,
그때는 커스텀 Validation으로 요청 초입 검증을 확장한다는 감각까지 가져가는 것이 중요합니다.
