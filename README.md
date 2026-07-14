# 03 Validation

## 이 시퀀스에서 다루는 문제

이번 answer 브랜치는 요청 DTO 검증, 비즈니스 예외, 공통 실패 응답이 연결된 비교 기준입니다. 정상 CRUD 위에 잘못된 입력과 실패 요청을 다루는 흐름을 더합니다.

Security, JWT, 테스트 확장, 복잡한 공통 응답 래퍼는 이번 범위에 넣지 않습니다. 커스텀 Validation은 구현하지 않고 확장 개념으로만 다룹니다.

## 학습 목표

- Request DTO와 Entity 역할을 분리합니다.
- `@Valid`, `@NotBlank`로 잘못된 요청을 초입에서 막습니다.
- `PostNotFoundException`으로 비즈니스 예외를 분리합니다.
- `GlobalExceptionHandler`와 `ErrorResponse`로 실패 응답을 통일합니다.

## 멘티 시작 흐름

먼저 starter 브랜치에서 직접 구현한 뒤, 이 브랜치의 문서를 비교 기준으로 사용합니다.

```bash
git fetch origin
git diff origin/03-implementation..origin/03-answer
```

비교할 때는 어떤 실패가 어디에서 막히고 어떤 응답 구조로 바뀌는지 확인합니다.

## 읽는 순서

1. [이론 정리](./docs/theory.md)
2. [구현 가이드](./docs/implementation.md)
3. [체크리스트](./docs/checklist.md)

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

- answer 브랜치에서 `./gradlew test`가 통과하는지 확인합니다.
- 커스텀 Validation은 확장 개념으로만 다룹니다.
- JWT/Security로 범위가 넘어가지 않도록 요청 검증과 실패 응답에 집중합니다.

## 수업 중 질문

- answer에서 검증 실패는 어느 파일을 거쳐 응답으로 바뀌나요?
- 없는 게시글 실패는 검증 실패와 무엇이 다른가요?
- 실패 응답 모양을 통일하면 클라이언트가 무엇을 더 안정적으로 처리할 수 있나요?

## 리뷰 기준

- 멘티가 answer 코드를 그대로 외우는 것이 아니라 요청 DTO, Validation, Service 예외, ExceptionHandler 흐름을 설명하는지 봅니다.
- 응답 구조가 실패 종류별로 일관되게 내려가는지 확인합니다.
- 다음 JWT 시퀀스에서 입력 안전성 감각이 이어진다는 연결을 남깁니다.

</details>
