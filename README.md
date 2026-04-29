# Spring Boot Testing And Verification Lab

> 이미 만든 Service 흐름을 테스트로 다시 신뢰하는 방법을 익히는 실습 레포입니다.

## 이 시퀀스에서 무엇을 배우나요

이번 실습은 `05-answer`까지 만든 기능을 바탕으로
Service 단위 테스트를 직접 작성해보는 단계입니다.

이번 시퀀스에서는 아래 감각을 잡는 데 집중합니다.

1. 테스트는 기능이 맞는지 확인하는 도구입니다.
2. 테스트는 변경 후에도 기존 동작을 다시 신뢰하게 도와줍니다.
3. 정상 케이스와 예외 케이스를 나눠서 보는 습관이 중요합니다.
4. 인증 흐름도 테스트 대상이 될 수 있습니다.

그리고 이번에는 구현만 따라가는 것이 아니라,
아래 실무 질문도 같이 붙잡습니다.

1. 왜 지금은 controller 나 integration 이 아니라 service test 에 집중하는가
2. mock 은 언제 도움이 되고, 어디까지 믿어야 하는가

## 브랜치 사용 방법

- `main`: 이 레포의 주제, 문서, 브랜치 구조를 안내하는 대표 브랜치
- `06-implementation`: 학생 실습용 starter 브랜치
- `06-answer`: 비교용 정답 브랜치

학생은 반드시 `06-implementation`에서 시작합니다.

```bash
git clone -b 06-implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b feat/<이름>
```

정답 비교가 필요할 때는 아래 흐름을 사용합니다.

```bash
git fetch origin
git diff origin/06-implementation..origin/06-answer
```

## 문서 안내

- [이론 문서](./docs/theory.md)
- [구현 안내](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자료 안내](./docs/assets.md)

## 파일을 어떻게 보면 좋나요

1. `docs/theory.md`에서 왜 지금 service test 를 붙이는지, 왜 mock 을 쓰는지 먼저 읽습니다.
2. `docs/implementation.md`에서 오늘 손으로 칠 순서를 확인합니다.
3. 아래 핵심 파일을 순서대로 엽니다.

- `src/test/kotlin/com/andi/rest_crud/support/TestFixtureFactory.kt`
- `src/test/kotlin/com/andi/rest_crud/service/PostServiceTest.kt`
- `src/test/kotlin/com/andi/rest_crud/service/AuthServiceTest.kt`

`06-implementation`에서는 TODO를 채우며 실습하고,
완료 후에는 `06-answer`나 `docs/answer-guide.md`로 비교하면 됩니다.

## 미리 제공되는 것

- `05-answer` 기준 CRUD, Validation, JWT, OAuth2, SMTP 계정 복구 코드
- Spring Boot Test 설정
- Mockito 사용 환경
- 기본 fixture 구조
- 테스트 패키지 구조
- MySQL 런타임 설정과 H2 테스트 설정

학생은 테스트의 핵심 흐름만 직접 작성합니다.

이번 문서는 특히 아래 코드를 기준으로 읽으면 이해가 빨라집니다.

- `PostServiceTest`
- `AuthServiceTest`
- `TestFixtureFactory`

## 실행 방법

테스트 실행:

```bash
./gradlew test
```

애플리케이션 실행이 필요하면 MySQL을 준비한 뒤 아래처럼 실행합니다.

```bash
docker compose up -d
./gradlew bootRun
```

## 이번 실습에서 직접 구현할 범위

- fixture 또는 given 데이터를 준비
- `PostService` 정상 흐름 테스트 작성
- `PostService` 예외 흐름 테스트 작성
- `AuthService` 인증 성공 테스트 작성
- `AuthService` 인증 실패 테스트 작성
- 테스트를 다시 실행하며 흐름 검증

이번 시퀀스에서는 controller 테스트, repository 테스트, e2e 테스트, TDD 이론 심화까지 넓히지 않습니다.
