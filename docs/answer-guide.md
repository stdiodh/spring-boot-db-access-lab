# 참고 구현 가이드

이 문서는 answer 브랜치에서만 사용하는 비교 가이드입니다. starter 구현을 마친 뒤 Validation, 비즈니스 예외, 실패 응답 변환이 같은 흐름으로 이어지는지 확인합니다.

## 1. 꼭 비교할 파일

- `src/main/kotlin/com/andi/rest_crud/dto/PostCreateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostUpdateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/ErrorResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/GlobalExceptionHandler.kt`

## 2. 요청 DTO 비교 포인트

요청 DTO는 빈 값을 초입에서 막습니다.

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

수정 요청 DTO도 같은 기준인지 확인합니다.

## 3. 비즈니스 예외 비교 포인트

없는 게시글은 서비스 의미가 드러나는 예외로 분리합니다.

```kotlin
private fun findPostById(id: Long): PostEntity {
    return postRepository.findById(id)
        .orElseThrow { PostNotFoundException(id) }
}
```

검증 실패와 게시글 없음 실패를 같은 종류로 처리하지 않는 것이 핵심입니다.

## 4. 실패 응답 비교 포인트

검증 실패는 필드별 오류를 `errors`에 담습니다.

```kotlin
return ErrorResponse(
    code = "VALIDATION_ERROR",
    message = "입력값 검증에 실패했습니다.",
    errors = errors
)
```

게시글 없음 실패는 별도 code와 message를 갖습니다.

```kotlin
return ErrorResponse(
    code = "POST_NOT_FOUND",
    message = exception.message ?: "게시글을 찾을 수 없습니다."
)
```

## 5. 멘토 리뷰 포인트

- starter와 answer의 차이를 코드 길이가 아니라 실패가 어디서 막히고 어디서 응답으로 변환되는지로 비교합니다.
- 빈 제목 요청과 없는 게시글 요청을 Swagger에서 함께 확인하게 합니다.
- 다음 JWT 시퀀스에서 인증 실패도 같은 실패 응답 설계 감각으로 다룬다는 연결을 남깁니다.
