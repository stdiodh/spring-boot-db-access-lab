# 구현 가이드

## 1. 구현 전에 확인할 문제

이번 answer는 메모리 CRUD를 DB 기반 CRUD로 바꾸는 비교 기준입니다. 저장 책임을 Repository로 옮기고, Service가 계층 흐름을 조립하는 구조를 확인합니다.

완성 흐름은 아래와 같습니다.

```text
Controller -> Service -> Repository -> MySQL -> Response DTO
```

## 2. 구현 순서

1. `PostEntity.kt`에서 테이블과 연결되는 Entity를 확인합니다.
2. `PostRepository.kt`에서 JPA Repository 선언을 확인합니다.
3. `PostService.kt`에서 create, getAll, getById 흐름을 확인합니다.
4. `PostService.kt`에서 update, delete 흐름을 확인합니다.
5. `PostController.kt`에서 수정/삭제 API가 Service로 연결되는지 확인합니다.
6. Swagger와 MySQL 조회로 저장 결과를 확인합니다.

## 3. Step 1. Entity 확인

### 해야 할 일

`PostEntity.kt`가 DB 테이블과 연결되는 구조를 확인합니다.

### 왜 이 작업을 하는가

Entity는 DB 저장의 기준입니다. 요청 DTO나 응답 DTO와 달리 DB 테이블과 연결되는 내부 모델이라는 점을 구분해야 합니다.

### 확인 방법

- Entity annotation과 id 생성 전략을 확인합니다.
- 이번 단계에서 관계 매핑을 추가하지 않는 이유를 설명합니다.

## 4. Step 2. Repository 선언 확인

### 해야 할 일

`PostRepository.kt`가 `PostEntity`와 id 타입을 기준으로 JPA Repository를 연결하는지 확인합니다.

### 왜 이 작업을 하는가

Repository가 DB 접근을 맡으면 Service가 저장 구현 세부사항보다 처리 흐름에 집중할 수 있습니다.

### 확인 방법

- Service가 Repository를 통해 저장과 조회를 수행하는지 확인합니다.
- Controller가 Repository를 직접 호출하지 않는지 확인합니다.

## 5. Step 3. 생성과 조회 흐름 확인

### 해야 할 일

`PostService.kt`에서 생성, 전체 조회, 단건 조회 흐름이 Repository 기반인지 확인합니다.

### 왜 이 작업을 하는가

요청 DTO를 Entity로 만들고, 저장 결과를 응답 DTO로 바꾸는 흐름이 메모리 저장과 DB 저장의 차이를 보여줍니다.

### 확인 방법

- 생성 후 `GET /posts`에서 DB 기준 목록이 보이는지 확인합니다.
- Entity를 그대로 응답하지 않고 `PostResponse`로 변환하는지 확인합니다.

## 6. Step 4. 수정과 삭제 흐름 확인

### 해야 할 일

id로 기존 게시글을 찾고, 값을 바꾸거나 삭제하는 흐름을 확인합니다.

### 왜 이 작업을 하는가

수정과 삭제도 생성/조회와 같은 계층 흐름을 따라야 합니다. Controller에서 직접 DB 접근을 처리하면 계층 분리가 흐려집니다.

### 확인 방법

- 수정 후 다시 조회했을 때 값이 바뀌는지 확인합니다.
- 삭제 후 목록에서 데이터가 사라지는지 확인합니다.

## 7. Step 5. API 연결과 실행 확인

### 해야 할 일

`PostController.kt`에서 수정/삭제 API가 Service를 호출하도록 연결되어 있는지 확인하고 Swagger에서 확인합니다.

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

- starter와 비교할 때 Entity annotation, Repository 선언, Service 저장/조회 흐름을 순서대로 확인합니다.
- 힌트가 필요하면 Entity와 DTO 차이, Repository 선언, Service의 Repository 호출 순서로 좁혀갑니다.
- 다음 시퀀스의 Validation/Exception Handling으로 넘어가기 전 저장 흐름 설명이 가능한지 확인합니다.

</details>
