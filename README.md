# 02 DB Access

## 이 시퀀스에서 다루는 문제

이번 answer 브랜치는 메모리 CRUD를 MySQL 기반 CRUD로 바꾸는 비교 기준입니다. `Controller -> Service -> Repository -> DB` 흐름이 완성된 상태에서 Entity, Repository, DTO 변환이 어떻게 연결되는지 확인합니다.

Validation, Exception Handling, Security는 이번 구현 범위에 넣지 않습니다. 관계 매핑과 N+1은 구현하지 않고 이론에서 실무 확장 개념으로만 다룹니다.

## 학습 목표

- 메모리 저장과 DB 저장의 차이를 설명합니다.
- Entity, Repository, Service, Controller의 역할을 구분합니다.
- JPA Repository 기반 CRUD 흐름을 비교합니다.
- Swagger와 MySQL 조회로 저장 결과를 확인합니다.

## 멘티 시작 흐름

먼저 starter 브랜치에서 직접 구현한 뒤, 이 브랜치의 문서를 비교 기준으로 사용합니다.

```bash
git fetch origin
git diff origin/02-implementation..origin/02-answer
```

비교할 때는 코드 줄 수보다 Entity, Repository, Service, Controller 책임이 같은 방향을 가리키는지 확인합니다.

## 읽는 순서

1. [이론 정리](./docs/theory.md)
2. [구현 가이드](./docs/implementation.md)
3. [참고 구현 가이드](./docs/answer-guide.md)
4. [체크리스트](./docs/checklist.md)
5. [제공 자료 안내](./docs/assets.md)

## 실행 / 테스트 방법

MySQL을 실행합니다.

```bash
docker compose up -d
```

애플리케이션을 실행합니다.

```bash
./gradlew bootRun
```

Swagger UI에서 API를 확인합니다.

```text
http://localhost:8080/swagger
```

자동화 테스트는 아래 명령으로 실행합니다.

```bash
./gradlew test
```

## 완료 기준

- `PostEntity`가 테이블과 연결되는 역할을 설명합니다.
- `PostRepository`가 DB 접근을 맡는 이유를 설명합니다.
- 생성, 조회, 수정, 삭제가 DB 기준으로 동작합니다.
- Entity를 그대로 응답하지 않고 응답 DTO로 변환하는 이유를 설명합니다.
- `./gradlew test`가 통과합니다.

<details>
<summary>멘토용 진행 포인트</summary>

## 수업 전 확인

- answer 브랜치에서 `./gradlew test`가 통과하는지 확인합니다.
- MySQL 실행과 Swagger 접근이 가능한지 확인합니다.
- 관계 매핑과 N+1은 구현 과제가 아니라 실무 확장 개념으로만 다룹니다.

## 수업 중 질문

- answer에서 메모리 저장을 대체하는 지점은 어디인가요?
- Entity와 Response DTO는 왜 같은 객체가 아니어야 하나요?
- 수정과 삭제도 같은 계층 흐름을 따르고 있나요?

## 리뷰 기준

- 멘티가 answer 코드를 그대로 외우는 것이 아니라 계층 책임을 설명하는지 봅니다.
- CRUD 각 흐름이 DB 저장 기준으로 동작하는지 확인합니다.
- 다음 시퀀스의 Validation/Exception Handling 필요성을 자연스럽게 연결합니다.

</details>
