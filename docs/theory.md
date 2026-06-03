# 이론 정리

## 1. 왜 이 개념이 필요한가

DB CRUD가 동작해도 잘못된 입력과 실패 상황을 다루지 않으면 API 사용자는 무엇이 잘못됐는지 알기 어렵습니다. 빈 제목, 빈 작성자, 존재하지 않는 게시글 같은 요청은 정상 흐름과 다르게 처리되어야 합니다.

이번 시퀀스에서는 요청 DTO에서 기본 입력을 검증하고, Service에서 비즈니스 예외를 분리하며, ExceptionHandler에서 실패 응답을 통일합니다.

## 2. 기존 방식의 한계

검증을 Service 안쪽 `if`로만 처리하면 요청 검증과 비즈니스 처리가 섞입니다. 예외가 파일마다 다른 모양으로 응답되면 클라이언트도 실패를 안정적으로 처리하기 어렵습니다.

입력 검증은 요청 초입에서, 비즈니스 실패는 서비스 의미가 드러나는 예외로, 응답 변환은 ExceptionHandler에서 처리하는 편이 역할이 분명합니다.

## 3. 이번 시퀀스에서 선택한 접근

이번 시퀀스의 흐름은 아래와 같습니다.

1. Controller가 `@Valid`와 함께 요청 DTO를 받습니다.
2. DTO 필드의 `@NotBlank`가 빈 값을 막습니다.
3. Service는 없는 게시글을 `PostNotFoundException`으로 구분합니다.
4. `GlobalExceptionHandler`가 검증 실패와 비즈니스 예외를 `ErrorResponse`로 변환합니다.
5. Swagger에서 정상 요청과 실패 요청을 비교합니다.

## 4. 핵심 개념

### Request DTO

외부 요청에서 필요한 값만 받는 객체입니다. Entity와 분리되어야 DB 내부 구조가 요청 계약에 직접 노출되지 않습니다.

### Validation

요청값이 최소 조건을 만족하는지 확인하는 과정입니다. 이번 시퀀스에서는 `@Valid`와 `@NotBlank`를 사용합니다.

### 비즈니스 예외

서비스 규칙이 깨졌을 때 도메인 의미를 담아 던지는 예외입니다. 없는 게시글은 `PostNotFoundException`으로 표현합니다.

### ExceptionHandler

발생한 예외를 HTTP 응답으로 바꾸는 역할입니다. 실패 응답을 한 곳에서 정리하면 응답 계약이 안정됩니다.

### ErrorResponse

실패 응답의 공통 구조입니다. `code`, `message`, `errors`를 통해 실패 종류와 필드별 이유를 설명합니다.

## 5. 짧은 예제와 해설

이번 흐름은 아래처럼 읽습니다.

```text
Request DTO -> Validation -> Service -> Exception -> ErrorResponse
```

검증 실패는 요청 초입에서 막히고, 게시글 없음은 Service에서 비즈니스 예외로 분리됩니다. 두 실패는 원인은 다르지만 `ErrorResponse`라는 같은 틀로 응답됩니다.

## 6. 다음 구현으로 연결되는 지점

구현 단계에서는 아래 질문에 답할 수 있어야 합니다.

- Entity와 Request DTO는 왜 분리해야 하나요?
- `@Valid`와 `@NotBlank`는 어디서 동작하나요?
- 검증 실패와 비즈니스 예외는 무엇이 다른가요?
- 실패 응답을 같은 모양으로 내려주는 이유는 무엇인가요?

다음 시퀀스에서는 회원가입과 로그인처럼 더 민감한 입력을 JWT 인증 흐름과 함께 다룹니다.

<details>
<summary>멘토용 설명 포인트</summary>

- 멘티가 Validation을 Service 내부 조건문으로만 이해하면 요청 초입에서 막는다는 관점으로 되돌립니다.
- 커스텀 Validation 질문이 나오면 이번 필수 구현 범위 밖임을 설명하고, 기본 검증으로 막기 어려운 규칙이 생길 때 확장한다고 연결합니다.
- answer 비교 단계에서는 DTO annotation, `@Valid`, ExceptionHandler 응답 변환을 순서대로 확인하게 합니다.

</details>
