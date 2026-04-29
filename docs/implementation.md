# 영속성 저장과 계층 분리 구현 안내

## 오늘 학생이 완성할 최종 흐름

오늘 실습이 끝나면 학생은 아래 흐름을 직접 보여줄 수 있어야 합니다.

1. `PostEntity`를 만들어 테이블과 연결합니다.
2. `PostRepository`를 선언해 DB 접근을 맡깁니다.
3. `PostService`가 메모리 저장 대신 Repository를 사용하게 만듭니다.
4. `POST`, `GET`, `PUT`, `DELETE` 흐름을 DB 기반 CRUD로 연결합니다.
5. Swagger와 MySQL 저장 결과를 확인합니다.

여기서 한 걸음 더 나가면,
실무에서는 게시글과 댓글처럼 연관관계가 생기고 N+1 문제가 따라온다는 점까지 이론 문서에서 함께 이해해야 합니다.

## 학생이 직접 구현할 순서

1. `Entity` 핵심 필드와 어노테이션 작성
2. `Repository 인터페이스` 선언
3. `Service` 저장 흐름을 메모리 저장에서 DB 저장으로 변경
4. `findAll()` 연결
5. `findById()` 연결
6. `deleteById()` 연결
7. `update()` 핵심 로직 작성
8. Controller에서 수정 / 삭제 API 연결
9. MySQL 저장 결과 확인

## TODO를 넣을 파일

- `src/main/kotlin/com/andi/rest_crud/domain/PostEntity.kt`
- `src/main/kotlin/com/andi/rest_crud/repository/PostRepository.kt`
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`
- `src/main/kotlin/com/andi/rest_crud/controller/PostController.kt`

## 파일별 역할 설명

- `PostEntity.kt`: DB 테이블과 연결되는 핵심 데이터 구조
- `PostRepository.kt`: DB 접근을 맡는 기본 JPA Repository
- `PostService.kt`: Entity 생성, 조회, 수정, 삭제 흐름을 조립하는 곳
- `PostController.kt`: 요청을 받아 Service에 전달하고 응답을 돌려주는 입구
- `PostCreateRequest.kt`: 글 생성 요청 값
- `PostUpdateRequest.kt`: 글 수정 요청 값
- `PostResponse.kt`: 바깥으로 내보낼 응답 모양

실무 확장 메모:
이번 브랜치의 구현 메인 흐름은 단일 테이블 CRUD입니다.
관계 매핑과 N+1은 `docs/theory.md`에서 먼저 이해하고 넘어갑니다.

## 단계별 구현 안내

### Step 1. Entity 만들기

- `PostEntity.kt`를 엽니다.
- `@Entity`, `@Table`, `@Id`, `@GeneratedValue`를 연결합니다.
- title, content, author 핵심 필드를 확인합니다.

실습 힌트:
- 이번 실습에서는 단일 테이블 기준으로 단순하게 갑니다.
- 연관관계나 복잡한 매핑은 구현 메인 흐름에 넣지 않습니다.

### Step 2. Repository 선언하기

- `PostRepository.kt`를 엽니다.
- `JpaRepository<PostEntity, Long>`를 상속하도록 연결합니다.

실습 힌트:
- 구현 클래스를 직접 만들지 않아도 기본 CRUD 메서드를 바로 쓸 수 있습니다.

### Step 3. Service 저장 흐름 바꾸기

- `create()`에서 요청 DTO를 `PostEntity`로 만듭니다.
- `postRepository.save(...)`를 호출합니다.
- 저장 결과를 `PostResponse`로 바꿉니다.

실습 힌트:
- 이제 id를 직접 증가시키지 않습니다.
- DB가 생성한 id를 저장 결과에서 받아옵니다.

### Step 4. 전체 조회 연결하기

- `findAll()`로 전체 목록을 가져옵니다.
- `PostResponse` 리스트로 바꿉니다.

실습 힌트:
- Entity를 그대로 응답하지 말고 응답 DTO로 변환하세요.

### Step 5. 단건 조회 연결하기

- `findById(id)`로 하나를 찾습니다.
- `PostResponse`로 바꿔 반환합니다.

실습 힌트:
- 이번 시퀀스는 예외 처리를 깊게 다루지 않으므로, 먼저 정상 흐름이 분명하게 보이게 만드는 데 집중하세요.

### Step 6. 삭제 연결하기

- `deleteById(id)` 또는 조회 후 삭제 흐름을 만듭니다.

실습 힌트:
- 삭제 후 다시 전체 조회했을 때 목록에서 빠지는지 확인하면 됩니다.

### Step 7. 수정 로직 만들기

- id로 기존 Entity를 조회합니다.
- title, content, author 값을 바꿉니다.
- 저장 후 응답 DTO로 돌려줍니다.

실습 힌트:
- 수정도 결국 조회 -> 값 변경 -> 저장 흐름이라는 점을 먼저 보세요.

### Step 8. Controller 수정/삭제 API 연결

- `PUT /posts/{id}`
- `DELETE /posts/{id}`

실습 힌트:
- Controller에서 Repository를 직접 부르지 말고 Service를 통해 흐름을 유지하세요.

### Step 9. DB 저장 결과 확인

- `docker compose up -d`로 MySQL을 실행합니다.
- `./gradlew bootRun`으로 앱을 실행합니다.
- `http://localhost:8080/swagger`에서 API를 호출합니다.
- MySQL client나 Workbench에서 `posts` 테이블을 확인합니다.

실습 힌트:
- 서버를 껐다 켠 뒤에도 데이터가 남는지 보면 메모리 저장과 차이가 더 선명해집니다.

## 각 단계의 확인 포인트

- Step 1: Entity가 테이블과 연결되는 어노테이션이 보이는가
- Step 2: Repository가 기본 CRUD 메서드를 사용할 수 있는 구조인가
- Step 3: create가 `save(...)`를 호출하는가
- Step 4: 전체 조회가 DB 값을 기준으로 동작하는가
- Step 5: 단건 조회가 id 기준으로 연결되는가
- Step 6: 삭제 후 목록에서 데이터가 빠지는가
- Step 7: 수정 후 다시 조회했을 때 값이 바뀌는가
- Step 8: 수정 / 삭제 API가 Controller에 연결되어 있는가
- Step 9: Swagger와 MySQL 조회 결과를 눈으로 확인했는가

## 학생 체크 질문

- 왜 메모리 저장 대신 DB 저장이 필요한가요?
- `PostEntity`와 `PostResponse`는 무엇이 다른가요?
- Repository가 생기면 Service는 어떤 점이 더 읽기 쉬워지나요?
- 수정 흐름은 어떤 순서로 동작하나요?
- 게시글과 댓글 관계가 생기면 어떤 매핑이 필요할까요?
- N+1은 왜 생길 수 있을까요?

## 강사용 확인 포인트

- 학생이 Entity와 DTO 역할을 구분해서 설명하는지 확인합니다.
- 학생이 Service에서 Repository를 호출하는 이유를 말할 수 있는지 확인합니다.
- 학생이 DB 저장 결과를 Swagger와 MySQL 조회 도구에서 함께 확인했는지 확인합니다.
- 학생이 수정과 삭제도 같은 계층 흐름으로 설명할 수 있는지 확인합니다.
- 학생이 관계 매핑과 N+1을 “이번엔 구현하지 않지만 곧 마주치는 실무 개념”으로 설명할 수 있는지 확인합니다.

## 다음 시퀀스 연결 포인트

다음 시퀀스에서는 지금 만든 CRUD 흐름에 입력값 검증과 실패 응답 처리가 붙습니다.
이번 시퀀스에서 계층 분리와 DB 저장 흐름이 선명해야, 다음에는 DTO와 Validation이 왜 필요한지 자연스럽게 이어집니다.
