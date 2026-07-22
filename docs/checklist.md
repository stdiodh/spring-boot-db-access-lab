# 06 테스트와 검증 체크리스트

## 1. 기준선과 범위

- [ ] 최신 `05-answer`의 production, 설정, 정적 화면과 Visual Lab을 보존했습니다.
- [ ] 기존 104개 `@Test` 선언과 test source를 삭제하지 않았습니다.
- [ ] 신규 범위가 `PostService` 2개, `AuthService` 2개 test body로 제한됩니다.
- [ ] `PostAuthorizationServiceTest`와 기존 signup 테스트 네 개를 유지했습니다.
- [ ] production 코드를 테스트에 맞춰 수정하지 않았습니다.
- [ ] 표준 문서는 `README.md`, `docs/theory.md`, `docs/implementation.md`, `docs/checklist.md` 네 개뿐입니다.
- [ ] 과거 flat package 경로와 별도 answer/assets/branch guide가 없습니다.

## 2. starter 실패 계약

- [ ] `./gradlew testClasses`가 통과합니다.
- [ ] 미완성 상태에서는 신규 네 test만 명시적 `TODO()`로 실패합니다.
- [ ] 네 TODO가 서로 어떤 테스트인지 알 수 있는 메시지를 가집니다.
- [ ] 빈 body나 assertion 없는 거짓 green test가 없습니다.
- [ ] 기존 회귀 test, context, dependency 실패가 없습니다.

## 3. fixture

- [ ] `TestFixtureFactory`가 현재 `auth/post/user` feature package를 import합니다.
- [ ] `postCreateRequest`, `postEntity`, `loginRequest`, `user` 네 함수만 제공합니다.
- [ ] 기본 email과 author가 `tester@example.com`으로 일치합니다.
- [ ] mixed-case email, wrong password, 저장 id와 author 같은 판단값은 호출부에 드러납니다.
- [ ] fixture를 production helper로 옮기지 않았습니다.
- [ ] 기존 테스트를 fixture 사용으로 일괄 변경하지 않았습니다.

## 4. PostService 테스트

- [ ] 생성 성공에서 request title과 content를 명시합니다.
- [ ] 작성자 email을 인증된 principal 값으로 별도 준비합니다.
- [ ] Repository 저장 결과에 명시적인 id가 있습니다.
- [ ] `ArgumentCaptor`로 save 입력의 title, content, author를 확인합니다.
- [ ] response의 id, title, content, author를 확인합니다.
- [ ] 없는 id 조회에서 `Optional.empty()`를 stub합니다.
- [ ] `PostNotFoundException`을 확인합니다.
- [ ] Repository가 같은 id로 조회됐는지 확인합니다.

## 5. AuthService 테스트

- [ ] 로그인 성공 요청의 mixed-case email이 소문자로 조회됩니다.
- [ ] raw password와 저장 hash가 `PasswordEncoder.matches`에 전달됩니다.
- [ ] `JwtTokenProvider.createToken`이 정규화된 내부 email로 호출됩니다.
- [ ] `expirationSeconds`를 명시적으로 stub하고 읽힌 값을 검증합니다.
- [ ] access token, `Bearer`, expiry를 확인합니다.
- [ ] 비밀번호 불일치에서 `InvalidCredentialsException`을 확인합니다.
- [ ] 실패 뒤 `JwtTokenProvider`가 전혀 호출되지 않았음을 확인합니다.
- [ ] 실제 BCrypt나 실제 JWT를 Service 단위 테스트에서 생성하지 않습니다.

## 6. 증거 범위

- [ ] 신규 테스트가 Service 입력·협력·반환·예외를 보장한다고 설명합니다.
- [ ] Service 단위 테스트가 HTTP 400·401·403을 직접 보장한다고 표현하지 않습니다.
- [ ] 최신 05의 기존 HTTP·보안 integration test를 보존했습니다.
- [ ] 실제 MySQL, Google callback과 SMTP 수신을 자동 테스트 결과로 과장하지 않습니다.
- [ ] Google·SMTP credential 없이 자동 테스트가 끝납니다.

## 7. 최종 검증

- [ ] 대상 `AuthServiceTest`, `PostServiceTest`가 통과합니다.
- [ ] 전체 `./gradlew test`가 통과합니다.
- [ ] `./gradlew test --rerun-tasks`가 다시 통과합니다.
- [ ] 최소 108개의 `@Test` 선언이 있습니다.
- [ ] 완성된 두 test file에 `TODO()`가 없습니다.
- [ ] `git diff --check`가 통과합니다.
- [ ] 구현·완성 브랜치의 문서와 fixture가 동일합니다.
- [ ] 두 브랜치의 학습 diff가 두 test file의 body로 제한됩니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- fixture와 mock을 많이 쓰는 것이 목적이 아니라 실패 원인을 Service로 좁히는지 봅니다.
- create에서 잘못된 save 입력을 response assertion이 가릴 수 있음을 설명하게 합니다.
- login 성공의 정규화·matches·token·expiry 순서를 질문합니다.
- login 실패 뒤 token 생성이 차단됐다는 협력 증거를 확인합니다.
- 기존 400·401·403 회귀와 신규 Service test의 보장 범위를 구분하게 합니다.

</details>
