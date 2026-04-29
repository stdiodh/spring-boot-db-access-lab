# Spring Boot Safe Request Handling Lab

> DTO 분리, Validation, 예외 응답 통일을 통해 "안전한 요청 처리" 감각을 익히는 실습 레포입니다.

## 이 시퀀스에서 무엇을 배우나요

이번 실습은 `02-answer`의 DB CRUD 흐름 위에
입력 검증과 실패 응답 설계를 얹는 단계입니다.

이번 레포에서는 아래 흐름에 집중합니다.

1. 요청 DTO와 응답 DTO를 분리합니다.
2. `@Valid`, `@NotBlank`로 잘못된 입력을 초입에서 막습니다.
3. `PostNotFoundException`으로 비즈니스 예외를 분리합니다.
4. `GlobalExceptionHandler`와 `ErrorResponse`로 실패 응답을 통일합니다.
5. 정상 요청과 실패 요청이 어떻게 다르게 흘러가는지 직접 확인합니다.
6. 기본 Validation만으로 부족한 순간에는 커스텀 Validation이 왜 필요한지 이해합니다.

## 브랜치 사용 방법

- `03-implementation`: 학생 실습용 starter 브랜치
- `03-answer`: 비교용 정답 브랜치

학생은 반드시 `03-implementation`에서 시작합니다.

```bash
git clone -b 03-implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b feat/<이름>
```

정답 비교가 필요할 때는 아래 흐름을 사용합니다.

```bash
git fetch origin
git diff origin/03-implementation..origin/03-answer
```

## 문서 안내

- [이론 문서](./docs/theory.md)
- [구현 안내](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자료 안내](./docs/assets.md)

## 파일을 어떻게 보면 좋나요

실습은 아래 순서로 보는 것을 권장합니다.

1. `docs/theory.md`에서 왜 입력을 그대로 믿으면 안 되는지 읽습니다.
2. `docs/implementation.md`에서 오늘 손으로 칠 순서를 확인합니다.
3. 아래 핵심 파일을 순서대로 엽니다.

- `src/main/kotlin/com/andi/rest_crud/dto/PostCreateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostUpdateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/ErrorResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/GlobalExceptionHandler.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/PostNotFoundException.kt`

`03-implementation`에서는 TODO를 채우며 실습하고,
완료 후에는 `03-answer`나 `docs/answer-guide.md`로 비교하면 됩니다.

## 미리 제공되는 것

- Kotlin + Spring Boot + Spring Data JPA 프로젝트 기본 설정
- MySQL 실행 설정과 테스트용 H2 설정
- Swagger UI 진입 설정
- 기본 CRUD 구조와 `PostController`
- 예외 클래스 틀과 응답 포맷 틀
- 패키지 구조와 메인 애플리케이션 클래스

학생은 입력 검증과 실패 응답의 핵심 흐름만 직접 구현합니다.
커스텀 Validation은 실무 확장 개념으로 문서에서 같이 다루되,
이번 starter의 메인 구현 범위를 과하게 넓히지는 않습니다.

## 실행 방법

먼저 MySQL을 준비합니다.

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

## 이번 실습에서 직접 구현할 범위

- `PostCreateRequest`, `PostUpdateRequest`에 기본 검증 추가
- `PostResponse`로 응답 DTO 변환 연결
- `PostService`에서 비즈니스 예외 흐름 연결
- `ErrorResponse` 구조 이해
- `GlobalExceptionHandler`에서 검증 실패 / 비즈니스 예외 응답 통일

실무 확장 메모:
`docs/theory.md`와 `docs/answer-guide.md`에는
- 기본 `@NotBlank`만으로는 통과되는 문제 입력
- Service 안쪽 `if` 검증의 한계
- 커스텀 annotation / validator 해결 코드
도 함께 정리되어 있습니다.

이번 시퀀스에서는 Security, JWT, 테스트 확장, 복잡한 공통 응답 래퍼를 넣지 않습니다.
