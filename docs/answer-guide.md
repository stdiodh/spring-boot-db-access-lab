# 영속성 저장과 계층 분리 정답 가이드

## 빠른 흐름 정리

1. `PostController`가 요청을 받습니다.
2. `PostService`가 DTO를 `PostEntity`로 바꿉니다.
3. `PostRepository`가 DB에 저장하거나 조회합니다.
4. `PostResponse`로 다시 감싸 응답합니다.

## 각 파일의 최종 형태 설명

### `PostEntity.kt`

- `@Entity`, `@Table(name = "posts")`
- `@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- `id`, `title`, `content`, `author`

### `PostRepository.kt`

- `JpaRepository<PostEntity, Long>` 상속
- 구현 클래스 없이 기본 CRUD 메서드 사용

### `PostService.kt`

- `create`: DTO -> Entity -> `save` -> Response
- `getAll`: `findAll` -> Response list
- `getById`: `findById` -> Response
- `update`: 조회 -> 값 변경 -> `save`
- `delete`: `deleteById`

### `PostController.kt`

- `POST /posts`
- `GET /posts`
- `GET /posts/{id}`
- `PUT /posts/{id}`
- `DELETE /posts/{id}`

## Entity 핵심 정답 코드

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

## Repository 선언 정답 코드

```kotlin
interface PostRepository : JpaRepository<PostEntity, Long>
```

## Service 정답 흐름

### create

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

### findAll

```kotlin
fun getAll(): List<PostResponse> {
    return postRepository.findAll()
        .map(PostResponse::from)
}
```

### findById

```kotlin
fun getById(id: Long): PostResponse {
    val entity = postRepository.findById(id)
        .orElseThrow { NoSuchElementException("ID $id 에 해당하는 글이 없습니다.") }
    return PostResponse.from(entity)
}
```

### update

```kotlin
fun update(id: Long, request: PostUpdateRequest): PostResponse {
    val entity = postRepository.findById(id)
        .orElseThrow { NoSuchElementException("ID $id 에 해당하는 글이 없습니다.") }
    entity.title = request.title
    entity.content = request.content
    entity.author = request.author
    val saved = postRepository.save(entity)
    return PostResponse.from(saved)
}
```

### delete

```kotlin
fun delete(id: Long) {
    postRepository.deleteById(id)
}
```

## Controller 수정 / 삭제 API 정답 코드

```kotlin
@PutMapping("/{id}")
fun update(@PathVariable id: Long, @RequestBody request: PostUpdateRequest): PostResponse {
    return postService.update(id, request)
}

@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
fun delete(@PathVariable id: Long) {
    postService.delete(id)
}
```

## DB 저장 결과 확인 예시

1. `POST /posts`로 글을 생성합니다.
2. `GET /posts`로 목록을 확인합니다.
3. MySQL client나 Workbench에서 `select * from posts;`를 실행합니다.
4. 앱 재시작 후 다시 조회해도 데이터가 남는지 확인합니다.

## 학생이 자주 틀리는 포인트

- Entity와 Response DTO를 같은 역할로 생각하는 경우
- Controller에서 Repository를 직접 호출하려는 경우
- 수정 로직에서 조회 없이 새 Entity를 만들어 덮어쓰려는 경우
- 메모리 저장 때처럼 id를 직접 만들려고 하는 경우

## 왜 Repository가 필요한가

Repository가 생기면 Service는 DB 세부 접근보다 처리 흐름에 집중할 수 있습니다.
즉, "어떻게 저장하느냐"보다 "무엇을 처리하느냐"가 더 잘 보이게 됩니다.

## 왜 계층 분리가 읽기 쉬운 구조를 만드는가

Controller는 입구, Service는 흐름, Repository는 DB 접근으로 역할이 나뉘면 파일을 읽을 때도 시선이 덜 섞입니다.
학생 입장에서는 어디서 요청을 받고, 어디서 저장하고, 어디서 DB와 연결되는지 더 빨리 찾을 수 있습니다.

## 실무 확장 개념: 관계 매핑과 N+1

이번 시퀀스의 구현 메인 흐름은 단일 테이블 CRUD지만,
실무에서는 곧 `Post - Comment`, `User - Post` 같은 관계가 생깁니다.

이때 JPA에서는 `@OneToMany`, `@ManyToOne` 같은 관계 매핑을 사용합니다.
문제는 관계가 생기면 조회할 때 연관 데이터를 각 행마다 다시 읽어와서 쿼리가 많아질 수 있다는 점입니다.
이것이 N+1의 시작입니다.

이번 단계에서는 해결 코드를 바로 구현하지 않고,
`fetch join`, `EntityGraph` 같은 해결 방향이 있다는 정도만 알고 넘어가면 충분합니다.

## 다음 시퀀스 연결

다음 시퀀스에서는 지금 만든 CRUD 흐름에 DTO, Validation, Exception Handling이 붙습니다.
즉, 저장 흐름이 잡힌 뒤에야 "잘못된 입력을 어떻게 막을까"를 자연스럽게 다룰 수 있습니다.
