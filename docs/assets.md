# 안전한 요청 처리 제공 자료 안내

## 미리 제공하는 것

| 항목 | 왜 제공하는가 | 학생이 직접 작성하지 않는 범위 |
| --- | --- | --- |
| `02-answer` 기반 CRUD 구조 | 이번 시퀀스가 저장 로직이 아니라 요청 안전성에 집중하게 하기 위해 | Entity, Repository, 기본 CRUD API |
| MySQL 실행 설정 | 로컬 실행 기준을 하나로 맞추기 위해 | datasource 기본값, 드라이버 설정 |
| 테스트용 H2 설정 | 테스트를 DB 설치와 분리하기 위해 | `src/test/resources/application.yaml` |
| Swagger UI 설정 | 정상 / 실패 요청을 빠르게 비교하게 하기 위해 | OpenAPI UI 연결 설정 |
| `PostController`의 `@Valid` 연결 | 학생이 핵심 TODO 파일에 집중하게 하기 위해 | 요청 진입점 기본 wiring |
| `PostNotFoundException` 틀 | 비즈니스 예외 개념에 집중하게 하기 위해 | 예외 클래스 기본 선언 |

## 학생이 직접 구현하는 것

- `PostCreateRequest`, `PostUpdateRequest` 검증 어노테이션
- `PostResponse.from(...)` 변환 로직
- `PostService`의 비즈니스 예외 연결
- `GlobalExceptionHandler`의 검증 실패 / 게시글 없음 응답
- 실패 응답 구조를 직접 실행해보는 과정

## 운영 메모

- 앱 런타임은 MySQL을 사용합니다.
- 테스트는 H2 in-memory DB를 사용합니다.
- 이번 시퀀스에서는 Security, JWT, 테스트 확장, 복잡한 예외 계층은 다루지 않습니다.
- 핵심은 "요청 초입에서 잘못된 값을 막고, 실패를 같은 구조로 응답한다"입니다.
