# 체크리스트

## 1. 기능 확인

- [ ] `./gradlew test`가 통과합니다.
- [ ] Swagger에서 정상 생성 요청을 확인했습니다.
- [ ] 빈 제목 요청이 검증 실패 응답으로 내려갑니다.
- [ ] 존재하지 않는 게시글 요청이 게시글 없음 응답으로 내려갑니다.
- [ ] 실패 응답의 code, message, errors 구조를 확인했습니다.

## 2. 코드 구조 확인

- [ ] 요청 DTO와 Entity를 분리했습니다.
- [ ] Controller가 `@Valid`로 검증을 연결합니다.
- [ ] Service가 없는 게시글을 비즈니스 예외로 분리합니다.
- [ ] `GlobalExceptionHandler`가 실패 응답 변환을 담당합니다.
- [ ] `ErrorResponse`가 실패 응답 공통 구조를 제공합니다.

## 3. 실패 케이스 확인

- [ ] 빈 문자열 요청이 저장 로직으로 들어가지 않습니다.
- [ ] 없는 게시글 요청이 일반 예외가 아니라 도메인 의미가 있는 예외로 처리됩니다.
- [ ] 검증 실패와 비즈니스 예외의 HTTP status와 code를 구분합니다.

## 4. 설명할 수 있어야 하는 것

- [ ] Request DTO와 Entity를 분리하는 이유
- [ ] Validation이 동작하는 위치
- [ ] 검증 실패와 비즈니스 예외의 차이
- [ ] 실패 응답을 통일하는 이유
- [ ] 커스텀 Validation이 필요한 상황

## 5. 남은 한계와 다음 시퀀스 연결

- [ ] 이번 answer는 기본 요청 검증과 예외 응답 통일에 집중합니다.
- [ ] Security, JWT, 테스트 확장은 이번 범위 밖입니다.
- [ ] 다음 시퀀스에서는 회원가입, 로그인, 인증 실패를 같은 안전성 기준으로 다룹니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- 통과 기준: 멘티가 answer 구현을 보고 요청 DTO, Validation, Service 예외, ExceptionHandler 흐름을 설명합니다.
- 보완 필요 기준: 검증을 Service 조건문에 몰아넣거나 실패 응답 구조가 일관되지 않습니다.
- 질문 예시: "빈 제목 요청은 Service까지 들어가야 하나요?"
- 비교 포인트: starter 구현과 answer 구현의 차이를 DTO annotation, `@Valid`, `PostNotFoundException`, `ErrorResponse` 순서로 봅니다.

</details>
