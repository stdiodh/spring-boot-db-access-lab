# 영속성 저장과 계층 분리 이론 정리

> 메모리 저장으로 익힌 CRUD를 실제 MySQL 저장으로 바꾸면서, 왜 Entity와 Repository가 필요한지, 그리고 JPA를 쓰면 어떤 실무 문제를 만나게 되는지 감을 잡는 문서입니다.

> 이번 시퀀스 한 줄 요약  
> 메모리 리스트에 넣던 글 데이터를 MySQL에 저장하도록 바꾸면서 `Controller -> Service -> Repository -> DB` 흐름을 익히는 단계입니다.

## 먼저 이것만 기억해도 됩니다

- 메모리 저장은 서버를 재시작하면 사라지지만 DB 저장은 남습니다.
- Entity는 DB 테이블과 연결되는 서버 안쪽 데이터입니다.
- Repository가 생기면 Service는 DB 접근 세부사항보다 처리 흐름에 집중할 수 있습니다.
- JPA는 CRUD를 편하게 만들지만, 관계 매핑과 조회 성능 문제는 따로 이해해야 합니다.

## 왜 이 시퀀스를 배우는가

시퀀스 01에서는 요청이 들어오고 응답이 나가는 기본 흐름을 메모리 저장으로 익혔습니다.
그런데 메모리 저장은 서버를 껐다 켜면 데이터가 사라지고, 애플리케이션 밖에서는 데이터를 오래 보관할 수 없습니다.

그래서 이번에는 저장 위치를 실제 MySQL DB로 바꿉니다.
이 과정에서 학생은 "왜 Repository가 필요한지", "왜 Entity가 따로 있는지", "왜 계층을 나누는지"를 코드와 실행 결과로 같이 확인하게 됩니다.

## 이번 실습 흐름 한눈에 보기

1. 클라이언트가 `POST /posts` 요청을 보냅니다.
2. `PostController`가 요청을 받습니다.
3. `PostService`가 요청 DTO를 `PostEntity`로 바꿉니다.
4. `PostRepository`가 MySQL에 저장합니다.
5. 다시 조회할 때도 Repository를 통해 DB에서 읽습니다.
6. `PostResponse`로 바꿔 응답을 돌려줍니다.

짧게 말하면 이번 실습은  
**요청 -> Controller -> Service -> Repository -> MySQL -> 응답 DTO** 흐름을 익히는 단계입니다.

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
이번 실습에서는 메모리 리스트 대신 MySQL을 써서 그 차이를 직접 확인할 수 있습니다.

### CRUD

CRUD는 생성, 조회, 수정, 삭제 기본 흐름입니다.
이번 시퀀스에서는 JPA를 이용해 이 흐름이 DB와 연결되는 방식을 익힙니다.

## 실무에서 한 번 더 보기

이번 시퀀스의 메인 구현은 단일 테이블 CRUD로 유지합니다.
하지만 JPA를 실무에서 쓰기 시작하면 거의 바로 만나게 되는 개념이 두 가지 있습니다.

### 1. 관계 매핑

처음에는 `Post` 하나만 저장해도 충분합니다.
그런데 실제 서비스에서는 곧 이런 구조가 생깁니다.

- 게시글 하나에 댓글이 여러 개 달린다
- 사용자 한 명이 게시글을 여러 개 작성한다
- 주문 하나에 주문 항목이 여러 개 들어간다

이때 JPA에서는 `@OneToMany`, `@ManyToOne`, `@OneToOne` 같은 관계 매핑을 사용합니다.

쉽게 말하면:

- DB에서는 테이블끼리 외래 키로 연결되고
- 코드에서는 Entity끼리 참조로 연결됩니다

예를 들면:

- `Post` 하나와 `Comment` 여러 개
- `Comment` 하나와 `Post` 하나

이런 식으로 연결됩니다.

중요한 점은 관계 매핑이 “코드를 예쁘게 만드는 문법”이 아니라,
**도메인 관계를 객체와 쿼리 양쪽에 동시에 영향을 주는 설정**이라는 점입니다.

### 2. N+1 문제

JPA를 처음 쓸 때 가장 자주 듣는 성능 문제 중 하나가 `N+1`입니다.

상황은 보통 이렇습니다.

1. 게시글 목록 10개를 조회합니다.
2. 각 게시글의 작성자나 댓글 수 같은 연관 데이터를 같이 보고 싶어집니다.
3. 그런데 JPA가 연관 데이터를 각 행마다 다시 조회합니다.

그러면

- 목록 조회 1번
- 연관 데이터 조회 N번

이렇게 쿼리가 늘어날 수 있습니다.

그래서 이름이 `N+1`입니다.

이 문제가 실무에서 중요한 이유는,
코드는 한 줄처럼 보여도 실제 DB에서는 쿼리가 많이 나갈 수 있기 때문입니다.

### 3. 이번 시퀀스에서는 어디까지 다루는가

이번 시퀀스에서는 아래까지만 가져갑니다.

- 관계 매핑이 왜 필요한지
- 관계가 생기면 조회 성능 문제도 같이 생길 수 있다는 점
- 그것이 N+1의 시작이라는 점

해결책은 이름만 소개합니다.

- fetch join
- EntityGraph

지금 단계에서는 “JPA는 편하지만, 관계가 생기면 조회 방식도 같이 봐야 한다”는 감각만 가져가면 충분합니다.

## 자주 헷갈리는 포인트

- Entity는 요청 DTO와 같은 역할이 아닙니다.
- Repository는 Service를 대신하는 것이 아니라 DB 접근만 맡습니다.
- Controller가 Repository를 직접 호출하면 계층 분리 감각이 흐려집니다.
- DB 저장으로 바뀌었다고 해서 흐름이 복잡해지는 것이 아니라, 저장 위치만 명확해진다고 보면 됩니다.
- JPA를 쓰면 자동으로 성능 문제까지 해결되는 것은 아닙니다.
- 관계가 생기면 연관 데이터 조회 방식도 같이 봐야 합니다.

## 직접 말해보기

- 메모리 저장과 DB 저장의 가장 큰 차이는 무엇인가요?
- Entity와 DTO는 왜 따로 두나요?
- Repository가 없으면 Service가 어떤 점에서 더 복잡해질까요?
- 지금 코드에서 DB 저장으로 바뀐 핵심 줄은 어디인가요?
- 게시글과 댓글 관계가 생기면 어떤 매핑이 필요할까요?
- N+1이라는 말이 왜 나올 수 있을까요?

## 복습 체크리스트

- [ ] 메모리 저장과 DB 저장 차이를 설명할 수 있습니다.
- [ ] `PostEntity`가 왜 필요한지 설명할 수 있습니다.
- [ ] `PostRepository`가 어떤 역할인지 말할 수 있습니다.
- [ ] `Controller -> Service -> Repository -> DB` 흐름을 순서대로 설명할 수 있습니다.
- [ ] 생성 / 조회 / 수정 / 삭제가 DB에 반영되는 것을 확인할 수 있습니다.
- [ ] 관계 매핑이 왜 필요한지 입문 수준에서 설명할 수 있습니다.
- [ ] N+1이 어떤 상황에서 생기는지 말할 수 있습니다.

## 오늘 꼭 기억할 것

이번 시퀀스의 핵심은 JPA 문법을 많이 외우는 것이 아닙니다.
대신 메모리 CRUD에서 익힌 흐름이 DB와 연결될 때 어떤 파일이 새로 등장하고, 그 역할이 어떻게 나뉘는지,
그리고 실무에서는 관계 매핑과 N+1 같은 문제로 이어질 수 있다는 점까지 함께 이해하는 것입니다.
