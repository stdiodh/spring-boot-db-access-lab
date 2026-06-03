# 03 Validation

## 이 시퀀스에서 다루는 문제

SEQ02의 DB 기반 CRUD는 동작하지만, 빈 제목이나 존재하지 않는 게시글 같은 실패 상황을 아직 일관되게 설명하지 못합니다. 이번 시퀀스는 요청 DTO 검증과 비즈니스 예외, 공통 실패 응답을 연결해 안전한 요청 처리 흐름을 만듭니다.

Security, JWT, 테스트 확장, 복잡한 공통 응답 래퍼는 이번 범위에 넣지 않습니다. 커스텀 Validation은 구현하지 않고 확장 개념으로만 다룹니다.

## 학습 목표

- Request DTO와 Entity 역할을 분리합니다.
- `@Valid`, `@NotBlank`로 잘못된 요청을 초입에서 막습니다.
- `PostNotFoundException`으로 비즈니스 예외를 분리합니다.
- `GlobalExceptionHandler`와 `ErrorResponse`로 실패 응답을 통일합니다.

## 멘티 시작 흐름

실습은 이 starter 브랜치에서 진행합니다.

```bash
git clone -b 03-implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b feat/<이름>
```

먼저 `docs/theory.md`에서 왜 요청값을 그대로 믿으면 안 되는지 읽고, `docs/implementation.md`의 순서대로 TODO를 채웁니다.

## 읽는 순서

1. [이론 정리](./docs/theory.md)
2. [구현 가이드](./docs/implementation.md)
3. [체크리스트](./docs/checklist.md)
4. [제공 자료 안내](./docs/assets.md)

핵심 파일은 아래 순서로 확인합니다.

- `src/main/kotlin/com/andi/rest_crud/dto/PostCreateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostUpdateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/ErrorResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/GlobalExceptionHandler.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/PostNotFoundException.kt`

## 실행 / 테스트 방법

```bash
docker compose up -d
./gradlew bootRun
```

Swagger UI:

```text
http://localhost:8080/swagger
```

테스트 실행:

```bash
./gradlew test
```

## 완료 기준

- 빈 요청값이 Service까지 들어가기 전에 검증 실패로 처리됩니다.
- 없는 게시글 요청이 비즈니스 예외로 분리됩니다.
- 검증 실패와 게시글 없음 실패가 같은 `ErrorResponse` 구조를 사용합니다.
- 정상 요청과 실패 요청을 Swagger에서 비교해 설명합니다.
- `./gradlew test`가 통과합니다.

<details>
<summary>멘토용 진행 포인트</summary>

## 수업 전 확인

- SEQ02의 CRUD 흐름이 전제임을 확인합니다.
- 커스텀 Validation은 확장 개념으로만 다루고 starter 필수 구현에 넣지 않습니다.
- JWT/Security로 범위가 넘어가지 않도록 요청 검증과 실패 응답에 집중합니다.

## 수업 중 질문

- Entity를 요청 DTO로 그대로 쓰면 어떤 문제가 생기나요?
- 검증 실패와 없는 게시글 실패는 왜 다른 종류의 실패인가요?
- 실패 응답 모양을 통일하면 클라이언트가 무엇을 더 안정적으로 처리할 수 있나요?

## 리뷰 기준

- 멘티가 요청 DTO, Validation, Service, ExceptionHandler 흐름을 순서대로 설명하는지 봅니다.
- 응답 구조가 실패 종류별로 일관되게 내려가는지 확인합니다.
- 막힌 경우 완성 내용을 보여주기보다 요청 초입, 비즈니스 규칙, 응답 변환 위치를 질문합니다.

</details>
