# 영속성 저장과 계층 분리 제공 자료 안내

## 미리 제공하는 것

| 항목 | 왜 제공하는가 | 학생이 직접 작성하지 않는 범위 |
| --- | --- | --- |
| Kotlin + Spring Boot + Spring Data JPA 설정 | 환경 설정보다 저장 흐름 이해에 집중하게 하기 위해 | Gradle, 플러그인, 메인 클래스 |
| MySQL 실행 설정과 Compose 예시 | 실무에 더 가까운 DB 환경에서 영속 저장 차이를 바로 보여주기 위해 | datasource, Docker Compose 예시 |
| 테스트 격리 실행을 위한 MySQL 호환 테스트 설정 | 테스트를 독립적으로 실행하게 하기 위해 | test application 설정 |
| Swagger UI 진입 설정 | API를 바로 실행하며 흐름을 확인하게 하기 위해 | OpenAPI UI 연결 설정 |
| DTO 기본 틀 | 학생이 Entity/Repository/Service 핵심 흐름에 집중하게 하기 위해 | 요청/응답 기본 구조 |

## 학생이 직접 구현하는 것

- `PostEntity` 핵심 어노테이션과 필드
- `PostRepository` 선언
- `PostService`의 create / getAll / getById / update / delete
- `PostController`의 수정 / 삭제 API 연결

## 운영 메모

- 이번 시퀀스에서는 Validation, Exception Handling, Security를 넣지 않습니다.
- 관계 매핑과 N+1은 구현 메인 흐름이 아니라 이론 문서의 실무 확장 개념으로 다룹니다.
- 학생이 "메모리 저장이 DB 저장으로 바뀌는 지점"을 눈으로 찾을 수 있게 유지합니다.
