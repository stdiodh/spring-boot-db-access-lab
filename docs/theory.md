# 이론 정리

## 1. 왜 이 개념이 필요한가

메모리 저장은 서버 프로세스 안에 데이터를 보관합니다. 서버를 재시작하면 데이터가 사라지고, 애플리케이션 밖에서 안정적으로 데이터를 관리하기 어렵습니다.

이번 answer는 저장 위치를 MySQL로 바꾸고, DB 접근을 Repository로 분리한 완성 흐름을 보여줍니다.

## 2. 기존 방식의 한계

메모리 리스트에 직접 저장하는 방식은 작은 CRUD 흐름을 배우기에는 좋지만, 실제 서비스의 저장 요구를 충족하기 어렵습니다.

- 서버 재시작 후 데이터가 남지 않습니다.
- 여러 애플리케이션 인스턴스가 같은 데이터를 공유하기 어렵습니다.
- 저장 로직이 Service 안에 섞이면 DB 접근 책임을 분리하기 어렵습니다.

## 3. 이번 시퀀스에서 선택한 접근

이번 시퀀스의 흐름은 아래와 같습니다.

1. 요청이 `PostController`로 들어옵니다.
2. `PostService`가 요청 DTO를 Entity로 바꿉니다.
3. `PostRepository`가 MySQL 저장과 조회를 담당합니다.
4. Service가 결과 Entity를 응답 DTO로 바꿉니다.
5. Controller가 응답을 반환합니다.

구현 범위는 단일 테이블 CRUD입니다. 관계 매핑과 N+1은 앞으로 마주칠 실무 개념으로만 이해합니다.

## 4. 핵심 개념

### Entity

DB 테이블과 연결되는 서버 내부 객체입니다. 이번 시퀀스에서는 `PostEntity`가 게시글 테이블과 연결됩니다.

### Repository

DB 접근을 맡는 계층입니다. Service가 DB 접근 세부사항을 직접 다루지 않도록 분리합니다.

### Service

처리 흐름을 모으는 계층입니다. 요청 DTO를 Entity로 바꾸고, Repository를 호출하고, 응답 DTO를 만듭니다.

### Controller

HTTP 요청의 입구입니다. 요청을 받고 Service를 호출한 뒤 응답을 반환합니다.

### 영속 저장

애플리케이션이 종료되어도 데이터가 저장소에 남는 방식입니다. 이번 실습에서는 MySQL을 사용해 메모리 저장과 차이를 확인합니다.

### N+1

연관 데이터를 조회할 때 예상보다 많은 SQL이 반복 실행되는 성능 문제입니다. 이번 시퀀스에서는 구현하지 않고, 관계 매핑이 생기면 이런 문제가 따라올 수 있음을 기억합니다.

## 5. 짧은 예제와 해설

Entity는 DB 테이블과 연결됩니다.

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

Repository는 DB 접근을 맡습니다.

```kotlin
interface PostRepository : JpaRepository<PostEntity, Long>
```

Service는 요청 DTO를 Entity로 바꾸고 Repository를 호출한 뒤 응답 DTO로 변환합니다.

```text
Request DTO -> Entity -> Repository -> DB -> Entity -> Response DTO
```

## 6. 다음 구현으로 연결되는 지점

answer 비교 후에는 아래 질문으로 구현을 설명할 수 있어야 합니다.

- 왜 메모리 저장 대신 DB 저장이 필요한가요?
- Entity와 Response DTO는 어떤 책임이 다른가요?
- Repository가 생기면 Service의 책임은 어떻게 달라지나요?
- 수정과 삭제도 같은 계층 흐름으로 설명할 수 있나요?

다음 시퀀스에서는 이 CRUD 흐름 위에 입력값 검증과 실패 응답 처리가 붙습니다.

<details>
<summary>멘토용 설명 포인트</summary>

- starter와 비교할 때 Entity annotation, Repository 선언, Service의 Repository 호출 흐름을 순서대로 확인하게 합니다.
- 멘티가 Entity를 API 응답 객체처럼 이해하면 DB 내부 모델과 외부 응답 모델을 분리해 설명합니다.
- 관계 매핑이나 N+1 질문이 나오면 이번 구현 범위 밖임을 명확히 하고, 왜 다음 단계에서 중요해지는지만 연결합니다.

</details>
