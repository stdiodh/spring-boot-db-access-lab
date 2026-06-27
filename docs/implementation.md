# 구현 가이드

## 1. 구현 전에 풀 문제

이번 구현은 메모리 CRUD를 DB 기반 CRUD로 바꾸는 작업입니다. 새 기능을 크게 늘리기보다 저장 책임을 Repository로 옮기고, Service가 계층 흐름을 조립하도록 만드는 것이 핵심입니다.

직접 작성해야 할 흐름은 아래와 같습니다.

```text
Controller -> Service -> Repository -> MySQL -> Response DTO
```

## 2. 구현 순서

1. `PostEntity.kt`를 직접 작성합니다.
2. `PostRepository.kt`를 직접 작성합니다.
3. `PostCreateRequest`, `PostUpdateRequest`, `PostResponse`를 직접 작성합니다.
4. `PostService.kt`에서 Repository 기반 CRUD 흐름을 구현합니다.
5. `PostController.kt`에서 HTTP API와 Service를 연결합니다.
6. Swagger와 MySQL 조회로 저장 결과를 확인합니다.

## 3. Step 1. Entity 작성

### 해야 할 일

`PostEntity.kt`에서 게시글 데이터가 DB 테이블과 연결되는 구조를 작성합니다.

### 왜 이 작업을 하는가

Entity는 DB 저장의 기준입니다. 요청 DTO나 응답 DTO와 달리 DB 테이블과 연결되는 내부 모델이라는 점을 구분해야 합니다.

### 작성 기준

- JPA Entity임을 나타내는 어노테이션을 붙입니다.
- `posts` 테이블과 연결합니다.
- `id`, `title`, `content`, `author` 필드를 둡니다.
- 이번 단계에서는 관계 매핑을 추가하지 않습니다.

## 4. Step 2. Repository 작성

### 해야 할 일

`PostRepository.kt`에서 `PostEntity`와 id 타입을 기준으로 JPA Repository를 작성합니다.

### 왜 이 작업을 하는가

Repository가 DB 접근을 맡으면 Service가 저장 구현 세부사항보다 처리 흐름에 집중할 수 있습니다.
Spring Data JPA는 Repository 인터페이스를 보고 기본 CRUD 구현체를 만들어주기 때문에 구현 클래스를 직접 만들지 않습니다.

### 작성 기준

- `PostEntity`를 대상으로 합니다.
- 기본 키 타입은 `Long`을 사용합니다.
- Controller가 Repository를 직접 호출하지 않게 합니다.

## 5. Step 3. DTO 작성

### 해야 할 일

생성 요청, 수정 요청, 응답에 사용할 DTO를 작성합니다.

### 왜 이 작업을 하는가

요청 DTO는 클라이언트가 서버로 보내는 값을 담고, 응답 DTO는 서버가 클라이언트에 돌려줄 값을 담습니다.
Entity를 그대로 노출하지 않으면 DB 내부 구조가 API 응답 형태에 직접 묶이지 않습니다.

### 작성 기준

- `PostCreateRequest`에는 생성에 필요한 값을 둡니다.
- `PostUpdateRequest`에는 수정에 필요한 값을 둡니다.
- `PostResponse`에는 응답에 필요한 값과 Entity를 응답으로 바꾸는 변환 메서드를 둡니다.

## 6. Step 4. Service CRUD 구현

### 해야 할 일

`PostService.kt`에서 생성, 전체 조회, 단건 조회, 수정, 삭제 흐름을 Repository 기반으로 구현합니다.

### 왜 이 작업을 하는가

메모리 저장과 DB 저장의 차이는 Service의 저장 지점에서 가장 잘 드러납니다. 요청 DTO를 Entity로 만들고, 저장 결과를 응답 DTO로 바꾸는 흐름을 분명히 해야 합니다.

### 작성 기준

- 생성은 요청 DTO를 Entity로 바꾸고 Repository로 저장합니다.
- 조회는 Repository 결과를 Response DTO로 변환합니다.
- 수정은 id로 기존 Entity를 찾고 요청 DTO 값으로 바꿉니다.
- 삭제는 Repository를 통해 DB 데이터를 삭제합니다.

## 7. Step 5. Controller API 연결

### 해야 할 일

`PostController.kt`에서 HTTP API가 Service를 호출하도록 연결합니다.

### 왜 이 작업을 하는가

Controller는 HTTP 요청의 입구이고, 실제 처리 흐름은 Service로 넘겨야 계층 책임이 유지됩니다.

### 작성 기준

- `GET /posts`
- `GET /posts/{id}`
- `POST /posts`
- `PUT /posts/{id}`
- `DELETE /posts/{id}`
- Controller에서 Repository를 직접 호출하지 않습니다.

## 8. Step 6. 실행 확인

### 해야 할 일

Swagger와 MySQL에서 직접 작성한 DB CRUD 흐름을 확인합니다.

### 왜 이 작업을 하는가

API 응답만 보면 메모리 저장과 DB 저장을 구분하기 어렵습니다. Swagger 실행 결과와 MySQL 저장 결과를 함께 봐야 영속 저장 흐름을 확인할 수 있습니다.

### 확인 방법

```bash
docker compose up -d
./gradlew bootRun
```

Swagger UI에서 생성, 조회, 수정, 삭제를 실행합니다.

```text
http://localhost:8080/swagger
```

자동화 테스트도 실행합니다.

```bash
./gradlew test
```

## 마지막 확인

- Entity, Repository, Service, Controller 역할을 구분합니다.
- 생성/조회/수정/삭제가 DB 기준으로 동작합니다.
- MySQL 저장 결과를 확인했습니다.
- Validation, Exception Handling, Security를 이번 범위에 추가하지 않았습니다.

<details>
<summary>멘토용 진행 포인트</summary>

- 각 Step에서 파일 이름과 계층 책임을 함께 말하게 합니다.
- 힌트가 필요하면 Entity와 DTO 차이, Repository 선언, Service의 Repository 호출 순서로 좁혀갑니다.
- 정답을 직접 말하지 않고 "이 파일의 책임이 무엇인가요?"로 유도합니다.

</details>
