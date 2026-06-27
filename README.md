# 02 DB Access

## 이 시퀀스에서 다루는 문제

시퀀스 01의 메모리 CRUD는 서버를 재시작하면 데이터가 사라집니다. 이번 시퀀스는 게시글 데이터를 MySQL에 저장하고, `Controller -> Service -> Repository -> DB` 계층 흐름으로 CRUD를 연결하는 문제를 다룹니다.

Validation, Exception Handling, Security는 이번 구현 범위에 넣지 않습니다. 관계 매핑과 N+1은 구현하지 않고 이론에서 실무 확장 개념으로만 다룹니다.

## 학습 목표

- 메모리 저장과 DB 저장의 차이를 설명합니다.
- Entity, Repository, Service, Controller의 역할을 구분합니다.
- JPA Repository 기반 CRUD 흐름을 연결합니다.
- Swagger와 MySQL 조회로 저장 결과를 확인합니다.

## 멘티 시작 흐름

실습은 이 starter 브랜치에서 진행합니다.

```bash
git clone -b 02-implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b <이름>
```

실습 브랜치를 clone한 뒤, 본인 이름으로 개인 작업 브랜치를 만들어 진행합니다.
브랜치 이름에 `feat/` 접두어를 붙이지 않아도 됩니다.
먼저 `docs/theory.md`에서 영속 저장과 계층 분리의 이유를 읽고, `docs/implementation.md`의 순서대로 TODO를 채웁니다.

## 읽는 순서

1. [이론 정리](./docs/theory.md)
2. [구현 가이드](./docs/implementation.md)
3. [체크리스트](./docs/checklist.md)
4. [제공 자료 안내](./docs/assets.md)

핵심 파일은 아래 순서로 확인합니다.

- `src/main/kotlin/com/andi/rest_crud/domain/PostEntity.kt`
- `src/main/kotlin/com/andi/rest_crud/repository/PostRepository.kt`
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`
- `src/main/kotlin/com/andi/rest_crud/controller/PostController.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostCreateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostUpdateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostResponse.kt`

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

- MySQL 실행과 Swagger 접근이 가능한지 확인합니다.
- 시퀀스 03의 Validation/Exception Handling 설명으로 범위가 넘어가지 않도록 합니다.
- 관계 매핑과 N+1은 구현 과제가 아니라 실무 확장 개념으로만 다룹니다.

## 수업 중 질문

- 서버를 재시작해도 데이터가 남아야 하는 이유는 무엇인가요?
- Entity와 Response DTO는 왜 같은 객체가 아니어야 하나요?
- Service가 Repository를 호출하면 Controller의 책임은 어떻게 줄어드나요?

## 리뷰 기준

- 멘티가 `Controller -> Service -> Repository -> DB` 흐름을 파일 이름과 함께 설명하는지 봅니다.
- CRUD 각 흐름이 DB 저장 기준으로 동작하는지 확인합니다.
- 막힌 경우 완성 내용을 보여주기보다 Entity, Repository, Service 책임을 질문으로 좁혀갑니다.

</details>
