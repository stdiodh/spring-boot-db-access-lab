# 06 테스트와 검증

## 목표와 기준선

이번 시퀀스는 최신 `05-answer`의 OAuth2, 계정 복구, JWT, 게시글 권한과 자동 테스트를 그대로 보존한 채 Service 단위 테스트 네 개를 추가합니다.

production 코드는 수정하지 않습니다. 이미 제공된 104개 회귀 테스트와 학생이 새로 완성할 네 테스트의 역할을 구분하는 것이 핵심입니다.

학습 목표:

- Given, When, Then 순서로 한 동작을 검증합니다.
- fixture로 반복 준비를 줄이되 판단에 중요한 값은 테스트 본문에 드러냅니다.
- Repository, `PasswordEncoder`, `JwtTokenProvider`를 mock으로 두고 Service 판단만 분리합니다.
- 정상 반환과 기대 예외를 각각 assertion합니다.
- 저장 결과뿐 아니라 Repository에 전달한 값과 협력자 호출도 검증합니다.
- Service 단위 테스트와 이미 제공된 HTTP 통합 테스트의 보장 범위를 구분합니다.

Google이나 SMTP credential 없이 전체 자동 테스트를 실행할 수 있습니다.

## 이번에 다루는 파일

```text
src/test/kotlin/com/andi/rest_crud/
├── auth/service/AuthServiceTest.kt
├── post/service/PostAuthorizationServiceTest.kt
├── post/service/PostServiceTest.kt
└── support/TestFixtureFactory.kt
```

`PostAuthorizationServiceTest`와 기존 테스트는 제공된 회귀 suite입니다. 삭제하거나 새 fixture로 일괄 변경하지 않습니다.

## 새 학습 테스트

| 대상 | 정상 흐름 | 실패 흐름 |
|---|---|---|
| `PostService` | 생성 입력과 principal email이 저장값·응답에 보존됨 | 없는 id 조회가 `PostNotFoundException`을 발생시킴 |
| `AuthService` | email 정규화 뒤 token과 만료 정보를 반환함 | 비밀번호 불일치가 JWT 생성 전에 중단됨 |

fixture factory는 완성본으로 제공됩니다. 학생이 완성하는 범위는 위 네 test body입니다.

## 구현 순서

1. `TestFixtureFactory`의 기본값과 override 지점을 읽습니다.
2. `PostServiceTest`의 생성 성공 테스트를 완성합니다.
3. 같은 파일의 없는 id 조회 테스트를 완성합니다.
4. `AuthServiceTest`의 로그인 성공 테스트를 완성합니다.
5. 같은 파일의 비밀번호 불일치 테스트를 완성합니다.
6. 대상 테스트를 먼저 실행한 뒤 전체 회귀 suite를 실행합니다.

세부 입력, mock과 검증 기준은 [구현 가이드](./docs/implementation.md)를 순서대로 따릅니다.

## starter의 의도된 상태

`06-implementation`은 test source가 컴파일되지만 새 test body 네 곳의 `TODO()` 때문에 전체 테스트가 실패합니다.

```bash
./gradlew testClasses
./gradlew test
```

첫 명령은 통과해야 합니다. 두 번째 명령에서는 신규 네 테스트만 `NotImplementedError`로 실패해야 하며, 빈 test body가 통과하는 상태는 허용하지 않습니다.

## 검증 순서

네 테스트를 완성한 뒤 좁은 범위부터 확인합니다.

```bash
./gradlew test \
  --tests '*AuthServiceTest' \
  --tests '*PostServiceTest'

./gradlew test
./gradlew test --rerun-tasks
git diff --check
```

전체 suite에는 기존 104개와 신규 4개, 최소 108개의 `@Test` 선언이 있어야 합니다.

## 테스트 경계

### Service 단위 테스트

- Service에 전달한 입력을 고정합니다.
- collaborator의 반환값을 mock으로 통제합니다.
- 반환 DTO, 예외, 저장 인자와 collaborator 호출을 확인합니다.
- 실제 DB, BCrypt 계산, JWT 서명과 HTTP filter chain은 실행하지 않습니다.

### 제공된 회귀 테스트

최신 05에는 이미 다음 경계를 검증하는 테스트가 있습니다.

- Validation 400
- 인증 실패 401
- 인가 실패 403
- JWT issuer, audience, algorithm과 clock 경계
- OAuth verified email과 계정 연결 정책
- 복구 token hash, 만료, 회전, 단일 사용과 동시성
- transaction commit 이후 비동기 mail dispatch

새 Service 테스트가 이 통합 증거를 대신하지 않으며, 기존 회귀 테스트도 삭제하지 않습니다.

## Visual Lab

테스트 조건을 선택해 fixture, mock, Service, assertion과 보장 범위를 비교합니다.

```bash
python3 -m http.server 8081 -d docs/visual-lab
```

```text
http://localhost:8081/sequences/06/
```

## 문서

- [이론 정리](./docs/theory.md)
- [구현 가이드](./docs/implementation.md)
- [체크리스트](./docs/checklist.md)
- [Visual Lab](./docs/visual-lab/sequences/06/index.html)

표준 문서는 이 README와 위 세 Markdown 파일만 사용합니다. 별도 answer guide, asset 목록, branch guide를 만들지 않습니다.

<details>
<summary>멘토용 진행 포인트</summary>

- production 변경 없이 최신 05 회귀가 보존됐는지 먼저 확인합니다.
- fixture 기본값과 테스트가 직접 보여줘야 하는 판단값을 구분하게 합니다.
- response assertion만으로 저장 입력까지 검증했다고 말하지 않게 합니다.
- 실제 BCrypt/JWT 대신 mock을 쓰는 이유를 Service orchestration 범위로 설명하게 합니다.
- 신규 네 TODO 실패와 환경·컴파일 실패를 구분하게 합니다.
- 단위 테스트와 기존 HTTP 통합 테스트가 서로 다른 증거를 제공한다는 점을 질문합니다.

</details>
