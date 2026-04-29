# 안전한 요청 처리 정답 가이드

## 빠른 흐름 정리

1. 요청 DTO에 `@NotBlank`를 붙입니다.
2. Controller의 `@Valid`가 검증을 실행합니다.
3. Service는 없는 게시글을 `PostNotFoundException`으로 분리합니다.
4. `GlobalExceptionHandler`가 실패를 `ErrorResponse`로 통일합니다.

## 각 파일의 최종 형태 설명

### `PostCreateRequest.kt`, `PostUpdateRequest.kt`

- `title`, `content`, `author`에 `@field:NotBlank`
- 메시지는 학생이 바로 읽고 이해할 수 있는 수준으로 유지

### `PostResponse.kt`

- `from(entity)`에서 `id`, `title`, `content`, `author`를 꺼내 응답 DTO 생성

### `PostService.kt`

- `findPostById(...)`가 `PostNotFoundException(id)`를 던지도록 변경
- 나머지 CRUD 흐름은 `02` 구조를 유지

### `ErrorResponse.kt`

- `code`, `message`, `errors` 세 필드 유지
- `errors`는 기본값 `emptyMap()`

### `GlobalExceptionHandler.kt`

- `MethodArgumentNotValidException` -> `VALIDATION_ERROR`
- `PostNotFoundException` -> `POST_NOT_FOUND`

## 요청 DTO 검증 정답 코드

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

수정 요청 DTO도 같은 기준으로 작성합니다.

## 응답 DTO 변환 정답 코드

```kotlin
companion object {
    fun from(entity: PostEntity): PostResponse = PostResponse(
        id = entity.id,
        title = entity.title,
        content = entity.content,
        author = entity.author
    )
}
```

## 비즈니스 예외 정답 코드

```kotlin
private fun findPostById(id: Long): PostEntity {
    return postRepository.findById(id)
        .orElseThrow { PostNotFoundException(id) }
}
```

핵심은 `NoSuchElementException` 같은 일반 예외 대신
서비스 의미가 드러나는 예외를 쓰는 것입니다.

## 검증 실패 응답 정답 코드

```kotlin
@ExceptionHandler(MethodArgumentNotValidException::class)
@ResponseStatus(HttpStatus.BAD_REQUEST)
fun handleValidationException(exception: MethodArgumentNotValidException): ErrorResponse {
    val errors = exception.bindingResult.fieldErrors
        .associate { fieldError ->
            fieldError.field to (fieldError.defaultMessage ?: "잘못된 요청입니다.")
        }

    return ErrorResponse(
        code = "VALIDATION_ERROR",
        message = "입력값 검증에 실패했습니다.",
        errors = errors
    )
}
```

## 게시글 없음 응답 정답 코드

```kotlin
@ExceptionHandler(PostNotFoundException::class)
@ResponseStatus(HttpStatus.NOT_FOUND)
fun handlePostNotFoundException(exception: PostNotFoundException): ErrorResponse {
    return ErrorResponse(
        code = "POST_NOT_FOUND",
        message = exception.message ?: "게시글을 찾을 수 없습니다."
    )
}
```

## 실행 확인 예시

### 1. 정상 생성 요청

```json
{
  "title": "A&I",
  "content": "03 sequence",
  "author": "dh"
}
```

- 결과: `201 Created`

### 2. 검증 실패 요청

```json
{
  "title": "",
  "content": "03 sequence",
  "author": "dh"
}
```

- 결과: `400 Bad Request`
- 예시 응답:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "입력값 검증에 실패했습니다.",
  "errors": {
    "title": "title은 비어 있을 수 없습니다."
  }
}
```

### 3. 없는 게시글 조회 요청

- `GET /posts/9999`
- 결과: `404 Not Found`

```json
{
  "code": "POST_NOT_FOUND",
  "message": "id=9999 에 해당하는 게시글이 없습니다.",
  "errors": {}
}
```

## 학생이 자주 틀리는 포인트

- DTO에 검증을 붙이지 않고 Service에서 뒤늦게 확인하는 경우
- `PostResponse.from(...)` 대신 Entity를 그대로 반환하는 경우
- 검증 실패와 비즈니스 예외를 같은 코드로 내려주는 경우
- `errors` 맵을 만들지 않고 검증 실패 이유를 잃어버리는 경우

## 실무 확장 개념: 커스텀 Validation

이번 시퀀스의 메인 구현은 기본 `@NotBlank`와 `@Valid`입니다.
하지만 실무에서는 “비어 있지는 않지만 서비스 규칙상 허용할 수 없는 값”을 자주 만나게 됩니다.

예를 들어 제목에 `광고`, `무료`, `대출` 같은 금지어를 막아야 한다고 가정하면,
기본 `@NotBlank`만으로는 아래 입력이 그대로 통과합니다.

```json
{
  "title": "무료 대출 이벤트",
  "content": "지금 바로 신청하세요",
  "author": "marketing-bot"
}
```

처음에는 Service 안쪽에서 아래처럼 막고 싶어질 수 있습니다.

```kotlin
if (request.title.contains("무료") || request.title.contains("광고")) {
    throw IllegalArgumentException("허용되지 않는 제목입니다.")
}
```

하지만 이렇게 되면 저장 흐름과 입력 정책이 한 메서드 안에 섞입니다.
그래서 실무에서는 커스텀 annotation과 validator를 따로 두는 방식을 자주 씁니다.

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

DTO에서는 아래처럼 붙일 수 있습니다.

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

핵심은 `@NotBlank`를 버리는 것이 아니라,
기본 검증은 기본 검증대로 두고 서비스 고유 규칙은 커스텀 validator로 분리하는 것입니다.

이번 단계에서는 이 커스텀 Validation을 starter 필수 구현 범위로 넣지 않고,
`docs/theory.md`와 정답 가이드에서
문제 입력과 해결 코드 흐름을 같이 이해하는 것을 목표로 둡니다.

## 왜 지금 이 흐름이 중요한가

이번 시퀀스는 단순히 어노테이션을 붙이는 연습이 아닙니다.
"요청을 어디까지 믿을 수 있는가"와 "실패도 응답 계약인가"를 함께 익히는 단계입니다.
이 감각이 있어야 다음 인증/JWT 시퀀스에서도 회원가입, 로그인, 인증 실패를 더 자연스럽게 다룰 수 있습니다.
