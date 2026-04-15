# Spring Boot DB Access Lab

> Spring Data JPA를 이용해 메모리 저장을 실제 DB 저장 흐름으로 바꿔보는 실습 레포입니다.

## 브랜치 안내

- `implementation`: 학생 실습용 starter
- `answer`: 수업 후 공개되는 완성본

학생은 반드시 `implementation` 브랜치에서 시작합니다.

```bash
git clone -b implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b feat/<이름>
```

## 이론 문서

실습에 필요한 용어와 이론은 아래 문서에 정리합니다.

- [JPA Theory Notes](./docs/jpa-theory.md)

## 학습 목표

- 메모리 저장과 DB 저장의 차이를 이해합니다.
- Entity, Repository, Service가 어떻게 연결되는지 익힙니다.
- JPA를 통해 CRUD 흐름이 어떻게 바뀌는지 직접 확인합니다.

## 이번 실습 직접 구현 범위

- `Idol`을 JPA Entity로 다루는 감각 익히기
- `IdolRepository` 사용
- `findAll`, `findById`, `save`, `delete` 흐름 구현
- Service가 메모리 리스트 대신 DB를 바라보도록 바꾸기

## 미리 제공된 코드

- REST CRUD 기본 흐름
- Controller 코드
- DTO 구조
- JPA 의존성 및 기본 datasource 설정

## TODO 위치

- `src/main/kotlin/com/andi/rest_crud/service/IdolService.kt`

코드에서 아래 키워드를 검색하면 빠르게 찾을 수 있습니다.

- `TODO(A&I)`
- `HINT(A&I)`
- `CHECK(A&I)`

## 실행 방법

먼저 로컬 MySQL을 준비합니다.

예시 기준:

- database: `idol_db`
- username: `root`
- password: `1234`

애플리케이션 실행:

```bash
./gradlew bootRun
```

테스트 실행:

```bash
./gradlew test
```

## 체크 포인트

- 왜 메모리 저장으로는 부족한지 설명할 수 있는가
- Repository가 어떤 역할을 맡는지 말할 수 있는가
- `save`, `findById`, `findAll`, `delete` 흐름을 코드에서 찾을 수 있는가

## 정답 브랜치 안내

정답은 수업 종료 후 `answer` 브랜치로 공개됩니다.

비교가 필요하면 아래 명령을 사용할 수 있습니다.

```bash
git fetch origin
git diff implementation..answer
```
