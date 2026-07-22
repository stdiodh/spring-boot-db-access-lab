# 06 테스트와 검증 구현 가이드

## 1. 구현 기준

최신 `05-answer`의 production, 설정, 정적 화면, Visual Lab과 기존 104개 테스트를 보존합니다. 이번 실습에서 직접 완성하는 곳은 Service test body 네 개뿐입니다.

```text
fixture + mock result -> Service method -> response or exception -> assertion
```

production 동작을 테스트에 맞춰 바꾸지 않습니다. 테스트가 현재 계약과 다르면 먼저 production 코드와 기존 회귀 테스트를 읽고 가정을 확인합니다.

## 2. 수정 범위

| 파일 | 제공/수정 범위 |
|---|---|
| `support/TestFixtureFactory.kt` | 완성본 제공, 읽기 |
| `post/service/PostServiceTest.kt` | 신규 test body 2개 완성 |
| `auth/service/AuthServiceTest.kt` | 기존 signup 4개 보존, login test body 2개 완성 |
| `post/service/PostAuthorizationServiceTest.kt` | 기존 회귀, 수정하지 않음 |

`src/main/**`, Gradle dependency, application 설정과 기존 test method는 이번 TODO 범위가 아닙니다.

## 3. Step 0 - starter 상태 확인

먼저 test source가 컴파일되는지 확인합니다.

```bash
./gradlew testClasses
```

이 명령은 통과해야 합니다. 다음 전체 실행에서는 신규 네 테스트의 `TODO()`만 실패하는 것이 정상입니다.

```bash
./gradlew test
```

확인할 것:

- `NotImplementedError`가 정확히 네 신규 test method를 가리킵니다.
- 기존 테스트 실패, context 시작 실패, dependency 오류가 없습니다.
- 비어 있거나 assertion 없이 통과하는 신규 테스트가 없습니다.

## 4. 제공 fixture 읽기

`TestFixtureFactory`는 현재 feature package의 DTO와 Entity를 사용합니다.

| 함수 | 기본 역할 | 테스트에서 override할 값 예시 |
|---|---|---|
| `postCreateRequest` | title·content 요청 생성 | 생성 테스트의 명시적 title·content |
| `postEntity` | 저장 결과 Entity 생성 | id·author |
| `loginRequest` | email·raw password 요청 생성 | mixed-case email·wrong password |
| `user` | 저장 사용자 생성 | normalized email·encoded password |

factory 기본값을 늘리거나 기존 suite를 factory 기반으로 일괄 변경하지 않습니다.

## 5. Step 1 - 게시글 생성 성공

파일: `src/test/kotlin/com/andi/rest_crud/post/service/PostServiceTest.kt`

Given:

1. title과 content를 명시한 `PostCreateRequest`를 준비합니다.
2. 인증된 작성자 email을 별도 값으로 둡니다.
3. Repository가 id를 가진 저장 결과를 반환하도록 설정합니다.

When:

1. `PostService.create(request, authorEmail)`을 한 번 실행합니다.

Then:

1. `ArgumentCaptor<PostEntity>`로 `postRepository.save` 인자를 잡습니다.
2. 저장 인자의 title, content, author를 요청과 principal 값에 비교합니다.
3. 반환 response의 id, title, content, author를 저장 결과에 비교합니다.

response만 확인하지 않습니다. 저장 입력과 응답 mapping을 각각 검증해야 합니다.

## 6. Step 2 - 없는 게시글 조회

같은 `PostServiceTest`에서 진행합니다.

Given:

1. `postRepository.findById(999L)`이 `Optional.empty()`를 반환하도록 설정합니다.

When/Then:

1. `postService.getById(999L)`을 실행합니다.
2. `PostNotFoundException` 타입을 기대합니다.
3. Repository가 같은 id로 조회됐는지 확인합니다.

실제 DB를 띄우거나 임의의 다른 예외로 넓히지 않습니다.

먼저 Post 테스트만 실행합니다.

```bash
./gradlew test --tests '*PostServiceTest'
```

## 7. Step 3 - 로그인 성공

파일: `src/test/kotlin/com/andi/rest_crud/auth/service/AuthServiceTest.kt`

기존 signup 테스트 네 개는 그대로 둡니다.

Given:

1. 대소문자가 섞인 email과 raw password를 가진 요청을 준비합니다.
2. Repository가 정규화된 email과 encoded password를 가진 사용자를 반환하게 합니다.
3. `PasswordEncoder.matches(raw, encoded)`가 `true`를 반환하게 합니다.
4. `JwtTokenProvider.createToken(normalizedEmail)`과 `expirationSeconds`를 고정합니다.

When:

1. `authService.login(request)`을 실행합니다.

Then:

1. access token, 기본 token type `Bearer`, 만료 초를 확인합니다.
2. Repository가 소문자 email로 호출됐는지 확인합니다.
3. encoder가 raw password와 저장 hash로 호출됐는지 확인합니다.
4. JWT provider가 정규화된 내부 email로 token을 만들고 만료 값을 읽었는지 확인합니다.

`expirationSeconds`는 mock에서 설정하지 않으면 `0L`입니다. 성공 시나리오가 의도한 값을 검증하도록 명시적으로 stub합니다.

## 8. Step 4 - 비밀번호 불일치

같은 `AuthServiceTest`에서 진행합니다.

Given:

1. 사용자는 조회되도록 합니다.
2. `PasswordEncoder.matches`가 `false`를 반환하게 합니다.

When/Then:

1. `authService.login(request)`에서 `InvalidCredentialsException`을 기대합니다.
2. Repository 조회와 password 비교 인자를 확인합니다.
3. `JwtTokenProvider`가 전혀 호출되지 않았는지 확인합니다.

실제 BCrypt hash를 만들거나 실제 JWT를 서명하지 않습니다. 그 구현 자체의 계약은 기존 테스트가 담당합니다.

Auth 테스트만 실행합니다.

```bash
./gradlew test --tests '*AuthServiceTest'
```

## 9. 전체 검증

네 body를 완성한 뒤 테스트 TODO가 없는지 확인합니다.

```bash
rg -n 'TODO\(' \
  src/test/kotlin/com/andi/rest_crud/auth/service/AuthServiceTest.kt \
  src/test/kotlin/com/andi/rest_crud/post/service/PostServiceTest.kt
```

검색 결과가 0건이면 다음 순서로 실행합니다. `rg`가 결과 없이 종료 코드 1을 반환하는 것은 정상입니다.

```bash
./gradlew test \
  --tests '*AuthServiceTest' \
  --tests '*PostServiceTest'

./gradlew test
./gradlew test --rerun-tasks
git diff --check
```

검증 기준:

- targeted test가 통과합니다.
- 기존 104개와 신규 4개를 포함한 전체 suite가 통과합니다.
- 반복 실행도 같은 결과입니다.
- Google·SMTP credential을 요구하지 않습니다.
- production과 runtime 설정 변경이 없습니다.

## 10. 테스트가 보장하지 않는 것

신규 네 테스트는 다음을 직접 실행하지 않습니다.

- HTTP request serialization과 Validation
- Spring Security filter chain과 400·401·403 응답 mapping
- 실제 MySQL query와 transaction isolation
- 실제 BCrypt 비용과 JWT 서명·검증
- 실제 Google callback과 SMTP 수신

최신 05의 기존 integration/component test가 앞의 HTTP·보안 회귀를 맡습니다. 실제 외부 연결은 credential을 준비한 수동 E2E로 남습니다.

## 11. 완료 기준

- 기존 test source와 104개 테스트 선언을 보존했습니다.
- 신규 네 test body를 완성했습니다.
- 게시글 생성에서 save 인자와 response를 모두 검증했습니다.
- 로그인 성공에서 정규화와 세 collaborator의 협력을 검증했습니다.
- 로그인 실패에서 JWT 미호출을 검증했습니다.
- targeted, 전체, `--rerun-tasks` 실행이 통과했습니다.
- 단위 테스트와 기존 HTTP 통합 테스트의 증거 범위를 설명할 수 있습니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- 기존 signup·권한·OAuth·복구 테스트를 약화하거나 fixture로 일괄 변경하지 않았는지 봅니다.
- 테스트를 통과시키려고 production을 수정하지 않았는지 확인합니다.
- create의 저장 인자와 response assertion이 둘 다 있는지 확인합니다.
- login 성공에서 `expirationSeconds` stub과 getter 검증을 놓치지 않았는지 봅니다.
- login 실패에서 token 문자열만 비었다고 보지 않고 JWT collaborator 미호출을 확인하게 합니다.

</details>
