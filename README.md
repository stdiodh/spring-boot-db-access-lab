# Spring Boot DB Access Lab

> 메모리 저장이 아니라 실제 MySQL 저장으로 바꾸면서 Controller, Service, Repository, Entity 계층이 어떻게 나뉘는지 익히는 정답 브랜치입니다.

## 이 시퀀스에서 무엇을 배우나요

이번 실습은 시퀀스 01의 메모리 CRUD를 이어받아,
영속 저장과 계층 분리를 가장 단순한 JPA CRUD로 익히는 단계입니다.

이번 레포에서는 아래 흐름에 집중합니다.

1. `PostEntity`가 테이블과 연결됩니다.
2. `PostRepository`가 DB 접근을 맡습니다.
3. `PostService`가 메모리 저장 대신 Repository를 사용합니다.
4. `POST /posts`, `GET /posts`, `GET /posts/{id}`, `PUT /posts/{id}`, `DELETE /posts/{id}` 흐름을 완성합니다.
5. MySQL에 저장된 값이 재시작 후에도 남는지 확인합니다.
6. 실무 확장 개념으로 관계 매핑과 N+1 문제의 출발점을 이론 문서에서 함께 봅니다.

## 브랜치 사용 방법

- `02-implementation`: 학생 실습용 starter 브랜치
- `02-answer`: 비교용 정답 브랜치

학생은 반드시 `02-implementation`에서 시작하고,
정답 비교는 `02-answer`에서 합니다.

## 문서 안내

- [이론 문서](./docs/theory.md)
- [구현 안내](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자료 안내](./docs/assets.md)

## 실행 방법

MySQL 실행:

```bash
docker compose up -d
```

애플리케이션 실행:

```bash
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

## 이 브랜치에서 특히 볼 것

- DTO에서 Entity로 바뀌는 지점
- `postRepository.save(...)`가 메모리 저장을 대체하는 지점
- 수정과 삭제도 같은 계층 흐름으로 유지되는지
- 관계 매핑과 N+1이 왜 “다음에 바로 마주칠 실무 개념”인지
