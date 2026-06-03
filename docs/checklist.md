# 체크리스트

## 1. 기능 확인

- [ ] MySQL을 실행했습니다.
- [ ] `./gradlew bootRun`으로 애플리케이션을 실행했습니다.
- [ ] Swagger에서 생성, 조회, 수정, 삭제를 확인했습니다.
- [ ] 서버 재시작 후에도 저장된 데이터가 남는지 확인했습니다.
- [ ] `./gradlew test`가 통과합니다.

## 2. 코드 구조 확인

- [ ] `PostEntity`가 DB 테이블과 연결되는 내부 모델입니다.
- [ ] `PostRepository`가 DB 접근을 맡습니다.
- [ ] `PostService`가 DTO, Entity, Repository 흐름을 조립합니다.
- [ ] `PostController`는 Service를 호출하는 HTTP 입구 역할을 유지합니다.
- [ ] Entity를 그대로 응답하지 않고 Response DTO로 변환합니다.

## 3. 실패 케이스 확인

- [ ] MySQL이 실행되지 않았을 때 애플리케이션이 왜 실패할 수 있는지 설명합니다.
- [ ] id가 없는 게시글을 조회/수정/삭제할 때 다음 시퀀스에서 예외 처리가 필요함을 설명합니다.
- [ ] Entity와 DTO를 섞으면 어떤 변경 위험이 생기는지 설명합니다.

## 4. 설명할 수 있어야 하는 것

- [ ] 메모리 저장과 DB 저장의 차이
- [ ] Entity와 DTO의 차이
- [ ] Repository가 필요한 이유
- [ ] `Controller -> Service -> Repository -> DB` 흐름
- [ ] 관계 매핑과 N+1이 이번 구현 범위 밖인 이유

## 5. 남은 한계와 다음 시퀀스 연결

- [ ] 이번 시퀀스는 단일 테이블 CRUD에 집중합니다.
- [ ] Validation, Exception Handling, Security는 다음 시퀀스 이후에 다룹니다.
- [ ] 관계 매핑과 N+1은 실무 확장 개념으로만 확인했습니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- 통과 기준: 멘티가 answer 구현을 보고 CRUD 흐름을 파일 이름과 계층 책임으로 설명합니다.
- 보완 필요 기준: Controller에서 Repository를 직접 호출하거나 Entity와 Response DTO 역할을 섞고 있습니다.
- 질문 예시: "이 요청이 DB에 저장될 때 어떤 파일을 어떤 순서로 지나가나요?"
- 비교 포인트: starter 구현과 answer 구현의 차이를 Entity annotation, Repository 선언, Service 저장/조회 흐름 순서로 봅니다.

</details>
