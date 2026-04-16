# 영속성 저장과 계층 분리 제공 자료 안내

## 미리 제공하는 것

| 항목 | 왜 제공하는가 | 학생이 직접 작성하지 않는 범위 |
| --- | --- | --- |
| Kotlin + Spring Boot + Spring Data JPA 설정 | 환경 설정보다 저장 흐름 이해에 집중하게 하기 위해 | Gradle, 플러그인, 메인 클래스 |
| H2 file DB 설정 | 외부 DB 설치 없이 영속 저장 차이를 바로 보여주기 위해 | datasource, H2 console 설정 |
| 테스트용 H2 in-memory 설정 | 테스트를 독립적으로 실행하게 하기 위해 | test application 설정 |
| Swagger UI 진입 설정 | API를 바로 실행하며 흐름을 확인하게 하기 위해 | OpenAPI UI 연결 설정 |
| DTO 기본 틀 | 학생이 Entity/Repository/Service 핵심 흐름에 집중하게 하기 위해 | 요청/응답 기본 구조 |

## 학생이 직접 구현하는 것

- `PostEntity` 핵심 어노테이션과 필드
- `PostRepository` 선언
- `PostService`의 create / getAll / getById / update / delete
- `PostController`의 수정 / 삭제 API 연결

## 운영 메모

- 이번 시퀀스에서는 Validation, Exception Handling, Security를 넣지 않습니다.
- 연관관계 매핑, N+1, fetch 전략 같은 고급 JPA 주제는 제외합니다.
- 학생이 "메모리 저장이 DB 저장으로 바뀌는 지점"을 눈으로 찾을 수 있게 유지합니다.
