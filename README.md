# Spring Boot DB Access Lab

> 메모리 저장이 아니라 실제 DB 저장으로 바꾸면서 Controller, Service, Repository, Entity 계층이 어떻게 나뉘는지 익히는 실습 레포입니다.

## 이 시퀀스에서 무엇을 배우나요

이번 실습은 시퀀스 01의 메모리 CRUD를 이어받아,
영속 저장과 계층 분리를 가장 단순한 JPA CRUD로 익히는 단계입니다.

이번 레포에서는 아래 흐름에 집중합니다.

1. `PostEntity`가 테이블과 연결됩니다.
2. `PostRepository`가 DB 접근을 맡습니다.
3. `PostService`가 메모리 저장 대신 Repository를 사용합니다.
4. `POST /posts`, `GET /posts`, `GET /posts/{id}`, `PUT /posts/{id}`, `DELETE /posts/{id}` 흐름을 완성합니다.
5. DB에 저장된 값이 재시작 후에도 남는지 확인합니다.

## 브랜치 사용 방법

- `implementation`: 학생 실습용 starter 브랜치
- `answer`: 비교용 정답 브랜치

학생은 반드시 `implementation`에서 시작합니다.

```bash
git clone -b implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b feat/<이름>
```

정답 비교가 필요할 때는 아래 흐름을 사용합니다.

```bash
git fetch origin
git diff implementation..answer
```

## 문서 안내

- [이론 문서](./docs/theory.md)
- [구현 안내](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자료 안내](./docs/assets.md)

## 파일을 어떻게 보면 좋나요

실습은 아래 순서로 보는 것을 권장합니다.

1. `docs/theory.md`에서 왜 메모리 저장만으로는 부족한지 읽습니다.
2. `docs/implementation.md`에서 오늘 구현 순서를 확인합니다.
3. 아래 핵심 파일을 순서대로 엽니다.

- `src/main/kotlin/com/andi/rest_crud/domain/PostEntity.kt`
- `src/main/kotlin/com/andi/rest_crud/repository/PostRepository.kt`
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`
- `src/main/kotlin/com/andi/rest_crud/controller/PostController.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostCreateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostUpdateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostResponse.kt`

`implementation` 브랜치에서는 `TODO(A&I)`를 채우며 실습하고,
완료 후에는 `answer` 브랜치나 `docs/answer-guide.md`로 비교하면 됩니다.

## 미리 제공되는 것

- Kotlin + Spring Boot + Spring Data JPA 프로젝트 기본 설정
- Swagger UI 진입 설정
- H2 file DB 실행 설정과 H2 console 설정
- 테스트용 H2 in-memory 설정
- 패키지 구조와 메인 애플리케이션 클래스

학생은 영속 저장으로 바뀌는 핵심 흐름만 직접 구현합니다.

## 실행 방법

애플리케이션 실행:

```bash
./gradlew bootRun
```

Swagger UI:

```text
http://localhost:8080/swagger
```

H2 Console:

```text
http://localhost:8080/h2-console
```

테스트 실행:

```bash
./gradlew test
```

## 이번 실습에서 직접 구현할 범위

- `PostEntity` 핵심 필드와 JPA 어노테이션 이해
- `PostRepository` 선언
- `PostService`의 create / getAll / getById / update / delete 흐름을 Repository 기반으로 연결
- `PostController`에서 수정 / 삭제 API 연결
- DB 저장 결과 확인

이번 시퀀스에서는 Validation, Exception Handling, Security, 연관관계 매핑을 넣지 않습니다.
