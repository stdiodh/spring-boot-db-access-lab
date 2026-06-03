# 참고 구현 가이드

이 문서는 answer 브랜치에서만 사용하는 비교 가이드입니다. starter 구현을 마친 뒤 Entity, Repository, Service, Controller가 같은 계층 흐름을 만드는지 확인합니다.

## 1. 꼭 비교할 파일

- `src/main/kotlin/com/andi/rest_crud/domain/PostEntity.kt`
- `src/main/kotlin/com/andi/rest_crud/repository/PostRepository.kt`
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`
- `src/main/kotlin/com/andi/rest_crud/controller/PostController.kt`

## 2. Entity 비교 포인트

Entity는 DB 테이블과 연결되는 내부 모델입니다.

```kotlin
@Entity
@Table(name = "posts")
class PostEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,
    var title: String,
    var content: String,
    var author: String
)
```

## 3. Repository 비교 포인트

Repository는 DB 접근을 맡습니다.

```kotlin
interface PostRepository : JpaRepository<PostEntity, Long>
```

Service가 DB 접근을 직접 구현하지 않고 Repository를 호출하는지 확인합니다.

## 4. Service 비교 포인트

Service는 요청 DTO를 Entity로 바꾸고 Repository를 호출한 뒤 응답 DTO로 변환합니다.

```kotlin
fun create(request: PostCreateRequest): PostResponse {
    val entity = PostEntity(
        title = request.title,
        content = request.content,
        author = request.author
    )
    val saved = postRepository.save(entity)
    return PostResponse.from(saved)
}
```

전체 조회, 단건 조회, 수정, 삭제도 같은 계층 흐름을 유지하는지 확인합니다.

## 5. Controller 비교 포인트

Controller는 HTTP 요청을 받고 Service를 호출합니다.

```kotlin
@PutMapping("/{id}")
fun update(@PathVariable id: Long, @RequestBody request: PostUpdateRequest): PostResponse {
    return postService.update(id, request)
}
```

Controller에서 Repository를 직접 호출하지 않는 것이 핵심입니다.

## 6. 멘토 리뷰 포인트

- starter와 answer의 차이를 코드 길이가 아니라 책임 분리로 비교합니다.
- MySQL 저장 결과를 Swagger와 DB 조회로 함께 확인하게 합니다.
- 다음 시퀀스에서 Validation과 예외 처리가 필요한 이유를 현재 CRUD 흐름의 한계로 연결합니다.
