# 영속성 저장과 계층 분리 이론 정리

> 메모리 저장으로 익힌 CRUD를 실제 DB 저장으로 바꾸면서, 왜 Entity와 Repository가 필요한지 감을 잡는 문서입니다.

> 이번 시퀀스 한 줄 요약  
> 메모리 리스트에 넣던 글 데이터를 DB에 저장하도록 바꾸면서 `Controller -> Service -> Repository -> DB` 흐름을 익히는 단계입니다.

## 먼저 이것만 기억해도 됩니다

- 메모리 저장은 서버를 재시작하면 사라지지만 DB 저장은 남습니다.
- Entity는 DB 테이블과 연결되는 서버 안쪽 데이터입니다.
- Repository가 생기면 Service는 DB 접근 세부사항보다 처리 흐름에 집중할 수 있습니다.

## 왜 이 시퀀스를 배우는가

시퀀스 01에서는 요청이 들어오고 응답이 나가는 기본 흐름을 메모리 저장으로 익혔습니다.
그런데 메모리 저장은 서버를 껐다 켜면 데이터가 사라지고, 애플리케이션 밖에서는 데이터를 오래 보관할 수 없습니다.

그래서 이번에는 저장 위치를 실제 DB로 바꿉니다.
이 과정에서 학생은 "왜 Repository가 필요한지", "왜 Entity가 따로 있는지", "왜 계층을 나누는지"를 코드와 실행 결과로 같이 확인하게 됩니다.

## 이번 실습 흐름 한눈에 보기

1. 클라이언트가 `POST /posts` 요청을 보냅니다.
2. `PostController`가 요청을 받습니다.
3. `PostService`가 요청 DTO를 `PostEntity`로 바꿉니다.
4. `PostRepository`가 DB에 저장합니다.
5. 다시 조회할 때도 Repository를 통해 DB에서 읽습니다.
6. `PostResponse`로 바꿔 응답을 돌려줍니다.

짧게 말하면 이번 실습은  
**요청 -> Controller -> Service -> Repository -> DB -> 응답 DTO** 흐름을 익히는 단계입니다.

## 중요한 코드 먼저 보기

### 1. Entity가 테이블과 연결되는 지점

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

- 이 코드는 "이 객체가 DB 테이블과 연결된다"는 지점을 보여줍니다.
- 여기서 가장 먼저 볼 포인트는 `@Entity`, `@Table`, `@Id`입니다.
- 학생은 "아, 이제 메모리 리스트가 아니라 테이블로 가는구나"를 여기서 느끼면 됩니다.

### 2. Repository가 DB 접근을 맡는 지점

```kotlin
interface PostRepository : JpaRepository<PostEntity, Long>
```

- 이 코드는 직접 SQL을 쓰지 않아도 기본 CRUD 메서드를 사용할 수 있게 해줍니다.
- 이번 실습에서는 `save`, `findAll`, `findById`, `deleteById`를 자주 보게 됩니다.

### 3. Service가 저장 흐름을 연결하는 지점

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

- 이 코드는 메모리 저장이 DB 저장으로 바뀐 핵심 장면입니다.
- Service는 요청을 받아 Entity를 만들고, Repository를 호출하고, 응답 DTO로 다시 바꿉니다.

## 핵심 개념 쉬운 설명

### Entity

Entity는 DB 테이블과 연결되는 객체입니다.
이번 코드에서는 `PostEntity`가 `posts` 테이블과 연결됩니다.

### Repository

Repository는 DB 접근을 맡는 역할입니다.
Service가 직접 SQL이나 DB 세부 작업을 다루지 않도록 분리해줍니다.

### Service

Service는 처리 흐름을 모읍니다.
요청 DTO를 Entity로 바꾸고, Repository를 호출하고, 응답 DTO를 만드는 흐름이 여기에 있습니다.

### Controller

Controller는 요청의 입구입니다.
이번 시퀀스에서도 Controller는 요청을 받고 Service를 호출하는 역할만 유지합니다.

### 영속 저장

영속 저장은 애플리케이션이 꺼져도 데이터가 남는 저장 방식을 뜻합니다.
이번 실습에서는 메모리 리스트 대신 H2 file DB를 써서 그 차이를 직접 확인할 수 있습니다.

### CRUD

CRUD는 생성, 조회, 수정, 삭제 기본 흐름입니다.
이번 시퀀스에서는 JPA를 이용해 이 흐름이 DB와 연결되는 방식을 익힙니다.

## 자주 헷갈리는 포인트

- Entity는 요청 DTO와 같은 역할이 아닙니다.
- Repository는 Service를 대신하는 것이 아니라 DB 접근만 맡습니다.
- Controller가 Repository를 직접 호출하면 계층 분리 감각이 흐려집니다.
- DB 저장으로 바뀌었다고 해서 흐름이 복잡해지는 것이 아니라, 저장 위치만 명확해진다고 보면 됩니다.

## 직접 말해보기

- 메모리 저장과 DB 저장의 가장 큰 차이는 무엇인가요?
- Entity와 DTO는 왜 따로 두나요?
- Repository가 없으면 Service가 어떤 점에서 더 복잡해질까요?
- 지금 코드에서 DB 저장으로 바뀐 핵심 줄은 어디인가요?

## 복습 체크리스트

- [ ] 메모리 저장과 DB 저장 차이를 설명할 수 있습니다.
- [ ] `PostEntity`가 왜 필요한지 설명할 수 있습니다.
- [ ] `PostRepository`가 어떤 역할인지 말할 수 있습니다.
- [ ] `Controller -> Service -> Repository -> DB` 흐름을 순서대로 설명할 수 있습니다.
- [ ] 생성 / 조회 / 수정 / 삭제가 DB에 반영되는 것을 확인할 수 있습니다.

## 오늘 꼭 기억할 것

이번 시퀀스의 핵심은 JPA 문법을 많이 외우는 것이 아닙니다.
대신 메모리 CRUD에서 익힌 흐름이 DB와 연결될 때 어떤 파일이 새로 등장하고, 그 역할이 어떻게 나뉘는지를 이해하는 것입니다.
