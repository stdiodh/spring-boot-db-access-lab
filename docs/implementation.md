# 안전한 요청 처리 구현 안내

## 이 도메인이 필요한 이유

`02`까지의 CRUD는 동작하지만,
아직은 잘못된 입력과 실패 응답을 체계적으로 다루지 못합니다.
이번 시퀀스에서는 같은 CRUD를 더 안전하게 만드는 쪽에 집중합니다.

## 학생이 완성할 최종 흐름

오늘 실습이 끝나면 학생은 아래 흐름을 직접 보여줄 수 있어야 합니다.

1. 요청 DTO와 응답 DTO를 분리합니다.
2. `@Valid`와 `@NotBlank`로 잘못된 입력을 초입에서 막습니다.
3. 없는 게시글은 `PostNotFoundException`으로 구분합니다.
4. `GlobalExceptionHandler`가 실패를 `ErrorResponse`로 통일합니다.
5. 정상 요청과 실패 요청을 Swagger에서 직접 비교합니다.

## 학생이 직접 구현할 순서

1. `PostCreateRequest`, `PostUpdateRequest`에 기본 검증을 붙입니다.
2. `PostResponse`에서 Entity -> Response DTO 변환을 완성합니다.
3. `PostService`에서 없는 게시글 조회를 비즈니스 예외로 바꿉니다.
4. `ErrorResponse` 구조를 확인합니다.
5. `GlobalExceptionHandler`에서 검증 실패 응답을 만듭니다.
6. `GlobalExceptionHandler`에서 게시글 조회 실패 응답을 만듭니다.
7. Swagger에서 성공 / 검증 실패 / 게시글 없음 요청을 각각 확인합니다.

## TODO를 넣을 파일

- `src/main/kotlin/com/andi/rest_crud/dto/PostCreateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostUpdateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/PostResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/service/PostService.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/ErrorResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/exception/GlobalExceptionHandler.kt`

## 미리 제공할 것

- `02-answer` 기반 CRUD 구조
- MySQL 실행 설정과 테스트용 H2 설정
- Swagger UI 진입 설정
- `PostController`의 `@Valid` 연결
- `PostNotFoundException` 기본 틀
- `ErrorResponse` 기본 틀
- 실행 가능한 starter 환경

## 파일별 역할 설명

- `PostCreateRequest.kt`: 글 생성 요청의 입력 검증 기준
- `PostUpdateRequest.kt`: 글 수정 요청의 입력 검증 기준
- `PostResponse.kt`: 바깥으로 내려줄 응답 DTO
- `PostService.kt`: DTO -> Entity 흐름과 비즈니스 예외 분기
- `ErrorResponse.kt`: 실패 응답의 공통 모양
- `GlobalExceptionHandler.kt`: 검증 실패 / 비즈니스 예외를 응답으로 정리하는 곳

## 단계별 구현 안내

### Step 1. 요청 DTO에 검증 붙이기

- `PostCreateRequest.kt`를 엽니다.
- `title`, `content`, `author`에 `@NotBlank`를 붙입니다.
- 같은 기준을 `PostUpdateRequest.kt`에도 적용합니다.

확인 포인트:
- 빈 문자열 요청이 Service까지 들어가기 전에 막힐 준비가 되었는가

### Step 2. 응답 DTO 변환 완성하기

- `PostResponse.kt`를 엽니다.
- `from(entity)`에서 필요한 필드만 꺼내 응답 DTO를 만듭니다.

확인 포인트:
- Entity를 그대로 반환하지 않고 `PostResponse`로 감싸는가

### Step 3. 비즈니스 예외 연결하기

- `PostService.kt`를 엽니다.
- `findPostById(...)`가 `NoSuchElementException` 대신 `PostNotFoundException`을 던지게 바꿉니다.

확인 포인트:
- 없는 게시글 상황을 서비스 의미가 있는 예외로 설명할 수 있는가

### Step 4. 실패 응답 구조 보기

- `ErrorResponse.kt`를 엽니다.
- `code`, `message`, `errors` 세 칸이 어떤 역할인지 먼저 읽습니다.

확인 포인트:
- 검증 실패와 게시글 없음 실패를 같은 틀로 담을 수 있는가

### Step 5. 검증 실패 응답 만들기

- `GlobalExceptionHandler.kt`를 엽니다.
- `MethodArgumentNotValidException`에서 `fieldErrors`를 읽습니다.
- `VALIDATION_ERROR` 코드와 `errors` 맵을 담아 반환합니다.

확인 포인트:
- 어떤 필드가 왜 실패했는지 응답에서 바로 보이는가

### Step 6. 게시글 없음 응답 만들기

- `GlobalExceptionHandler.kt`에서 `PostNotFoundException` 핸들러를 완성합니다.
- `POST_NOT_FOUND` 코드와 메시지를 담아 반환합니다.

확인 포인트:
- 검증 실패와 다른 응답 코드로 내려가는가

### Step 7. Swagger로 결과 확인하기

- `docker compose up -d`로 MySQL을 실행합니다.
- `./gradlew bootRun`으로 앱을 실행합니다.
- Swagger에서 아래 세 요청을 비교합니다.

1. 정상 생성 요청
2. 빈 제목 생성 요청
3. 존재하지 않는 게시글 조회 요청

확인 포인트:
- 성공 응답과 실패 응답의 모양 차이를 설명할 수 있는가

## 학생 체크리스트

- [ ] `PostCreateRequest`, `PostUpdateRequest`에 기본 검증을 붙일 수 있습니다.
- [ ] `PostResponse.from(...)`가 왜 필요한지 설명할 수 있습니다.
- [ ] 없는 게시글 조회를 `PostNotFoundException`으로 분리할 수 있습니다.
- [ ] 검증 실패 응답과 게시글 없음 응답을 Swagger에서 직접 확인할 수 있습니다.
- [ ] 실패 응답을 왜 통일하는지 설명할 수 있습니다.

## 강사 / PPT 체크리스트

- [ ] 요청 DTO -> Validation -> Service -> ExceptionHandler 흐름 그림이 있는가
- [ ] 빈 값 요청과 없는 게시글 요청을 각각 시연할 수 있는가
- [ ] `@Valid`, `@NotBlank`, `ErrorResponse` 역할을 코드와 함께 설명할 수 있는가
- [ ] 검증 실패와 비즈니스 예외 차이를 학생이 말로 설명하게 만들 수 있는가
- [ ] 다음 시퀀스의 인증/JWT에서도 같은 입력 안전성 감각이 이어진다는 점을 연결할 수 있는가

## 다음 도메인 연결 포인트

다음 시퀀스에서는 사용자 인증과 JWT를 다룹니다.
이번에 입력 검증과 실패 응답 감각이 잡혀 있어야,
회원가입과 로그인처럼 더 민감한 요청도 같은 기준으로 설계할 수 있습니다.
