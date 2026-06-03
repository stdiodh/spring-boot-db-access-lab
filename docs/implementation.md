# 구현 가이드

## 1. 구현 전에 확인할 문제

이번 구현은 메모리 CRUD를 DB 기반 CRUD로 바꾸는 작업입니다. 새 기능을 크게 늘리기보다 저장 책임을 Repository로 옮기고, Service가 계층 흐름을 조립하도록 만드는 것이 핵심입니다.

완성해야 할 흐름은 아래와 같습니다.

```text
Controller -> Service -> Repository -> MySQL -> Response DTO
```

## 2. 구현 순서

1. `PostEntity.kt`에서 테이블과 연결되는 Entity를 확인합니다.
2. `PostRepository.kt`에서 JPA Repository를 선언합니다.
3. `PostService.kt`에서 create, getAll, getById 흐름을 DB 기준으로 연결합니다.
4. `PostService.kt`에서 update, delete 흐름을 연결합니다.
5. `PostController.kt`에서 수정/삭제 API를 Service로 연결합니다.
6. Swagger와 MySQL 조회로 저장 결과를 확인합니다.

## 3. Step 1. Entity 확인

### 해야 할 일

`PostEntity.kt`에서 게시글 데이터가 DB 테이블과 연결되는 구조를 확인합니다.

### 왜 이 작업을 하는가

Entity는 DB 저장의 기준입니다. 요청 DTO나 응답 DTO와 달리 DB 테이블과 연결되는 내부 모델이라는 점을 구분해야 합니다.

### 확인 방법

- Entity가 어떤 필드를 갖는지 확인합니다.
- 이번 단계에서 관계 매핑을 추가하지 않는 이유를 설명합니다.

## 4. Step 2. Repository 선언

### 해야 할 일

`PostRepository.kt`에서 `PostEntity`와 id 타입을 기준으로 JPA Repository를 연결합니다.

### 왜 이 작업을 하는가

Repository가 DB 접근을 맡으면 Service가 저장 구현 세부사항보다 처리 흐름에 집중할 수 있습니다.

### 확인 방법

- Service가 Repository를 통해 저장과 조회를 수행하는지 확인합니다.
- Controller가 Repository를 직접 호출하지 않는지 확인합니다.

## 5. Step 3. 생성과 조회 흐름 연결

### 해야 할 일

`PostService.kt`에서 생성, 전체 조회, 단건 조회 흐름을 Repository 기반으로 연결합니다.

### 왜 이 작업을 하는가

메모리 저장과 DB 저장의 차이는 Service의 저장 지점에서 가장 잘 드러납니다. 요청 DTO를 Entity로 만들고, 저장 결과를 응답 DTO로 바꾸는 흐름을 분명히 해야 합니다.

### 확인 방법

- 생성 후 `GET /posts`에서 DB 기준 목록이 보이는지 확인합니다.
- Entity를 그대로 응답하지 않고 `PostResponse`로 변환하는지 확인합니다.

## 6. Step 4. 수정과 삭제 흐름 연결

### 해야 할 일

id로 기존 게시글을 찾고, 값을 바꾸거나 삭제하는 흐름을 연결합니다.

### 왜 이 작업을 하는가

수정과 삭제도 생성/조회와 같은 계층 흐름을 따라야 합니다. Controller에서 직접 DB 접근을 처리하면 계층 분리가 흐려집니다.

### 확인 방법

- 수정 후 다시 조회했을 때 값이 바뀌는지 확인합니다.
- 삭제 후 목록에서 데이터가 사라지는지 확인합니다.

## 7. Step 5. API 연결과 실행 확인

### 해야 할 일

`PostController.kt`에서 수정/삭제 API가 Service를 호출하도록 연결하고 Swagger에서 확인합니다.

### 왜 이 작업을 하는가

Controller는 HTTP 요청의 입구이고, 실제 처리 흐름은 Service로 넘겨야 계층 책임이 유지됩니다.

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
