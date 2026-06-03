# 구현 가이드

## 1. 구현 전에 확인할 문제

이번 구현은 CRUD 기능을 늘리는 작업이 아닙니다. 기존 CRUD 요청이 안전하게 들어오고, 실패했을 때 일정한 응답으로 나가도록 만드는 작업입니다.

완성해야 할 흐름은 아래와 같습니다.

```text
Request DTO -> Validation -> Service -> ExceptionHandler -> ErrorResponse
```

## 2. 구현 순서

1. `PostCreateRequest.kt`, `PostUpdateRequest.kt`에 기본 검증을 붙입니다.
2. `PostResponse.kt`에서 응답 DTO 변환을 확인합니다.
3. `PostService.kt`에서 없는 게시글을 비즈니스 예외로 분리합니다.
4. `ErrorResponse.kt`에서 실패 응답 구조를 확인합니다.
5. `GlobalExceptionHandler.kt`에서 검증 실패와 게시글 없음 응답을 연결합니다.
6. Swagger에서 정상 요청과 실패 요청을 비교합니다.

## 3. Step 1. 요청 DTO 검증

### 해야 할 일

생성/수정 요청 DTO의 필드에 기본 검증을 연결합니다.

### 왜 이 작업을 하는가

빈 제목이나 빈 작성자 같은 요청은 Service까지 들어가기 전에 막아야 처리 흐름이 단순해집니다.

### 확인 방법

- 빈 문자열 요청이 검증 실패로 응답되는지 확인합니다.
- Entity에 검증을 붙이는 것이 아니라 요청 DTO에 붙이는 이유를 설명합니다.

## 4. Step 2. 응답 DTO 변환

### 해야 할 일

`PostResponse`가 Entity에서 필요한 값만 꺼내 응답 DTO를 만드는지 확인합니다.

### 왜 이 작업을 하는가

Entity를 그대로 외부에 내보내면 DB 내부 모델과 API 응답 계약이 섞입니다.

### 확인 방법

- 정상 생성/조회 응답이 `PostResponse` 형태로 내려가는지 확인합니다.

## 5. Step 3. 비즈니스 예외 분리

### 해야 할 일

없는 게시글 조회/수정/삭제 상황을 `PostNotFoundException`으로 구분합니다.

### 왜 이 작업을 하는가

일반 예외보다 도메인 의미가 드러나는 예외를 사용해야 실패 응답 코드와 메시지를 일관되게 만들 수 있습니다.

### 확인 방법

- 존재하지 않는 id 요청이 게시글 없음 응답으로 내려가는지 확인합니다.

## 6. Step 4. 실패 응답 통일

### 해야 할 일

`GlobalExceptionHandler`에서 검증 실패와 게시글 없음 실패를 `ErrorResponse`로 변환합니다.

### 왜 이 작업을 하는가

실패 응답이 제각각이면 클라이언트가 실패를 안정적으로 처리하기 어렵습니다. code, message, errors 구조를 맞추면 실패 종류와 필드별 이유를 구분할 수 있습니다.

### 확인 방법

- 빈 제목 요청의 응답 code와 errors를 확인합니다.
- 없는 게시글 요청의 응답 code와 message를 확인합니다.

## 7. Step 5. Swagger로 비교

### 해야 할 일

아래 요청을 Swagger에서 비교합니다.

1. 정상 생성 요청
2. 빈 제목 생성 요청
3. 존재하지 않는 게시글 조회 요청

### 왜 이 작업을 하는가

정상 흐름과 실패 흐름을 함께 확인해야 요청 처리 안정성을 설명할 수 있습니다.

### 확인 방법

```bash
docker compose up -d
./gradlew bootRun
```

Swagger UI:

```text
http://localhost:8080/swagger
```

자동화 테스트:

```bash
./gradlew test
```

## 마지막 확인

- 요청 DTO와 Entity 역할을 구분합니다.
- 검증 실패와 비즈니스 예외를 구분합니다.
- 실패 응답이 `ErrorResponse` 구조로 내려갑니다.
- Security/JWT 범위로 확장하지 않았습니다.

<details>
<summary>멘토용 진행 포인트</summary>

- 각 Step에서 "어디서 막는가"와 "어떤 응답으로 바꾸는가"를 말하게 합니다.
- 힌트가 필요하면 DTO annotation, Controller의 `@Valid`, Service 예외, ExceptionHandler 순서로 좁혀갑니다.
- 정답을 직접 말하지 않고 실패 요청을 하나씩 보내며 응답 차이를 관찰하게 합니다.

</details>
