# 05 OAuth2와 SMTP 계정 복구 구현 가이드

## 1. 구현 기준

최신 `04-answer`의 signup, login, JWT, 오류 응답, 보호 API, 게시글 ownership과 회귀 테스트를 보존합니다. 05에서는 OAuth profile, 내부 계정 연결, redirect, 계정 복구와 SMTP adapter만 구현합니다.

```text
OAuth result -> verified profile -> internal account -> JWT -> redirect
OAuth/reset fragment -> memory -> history.replaceState -> API request
Recovery request -> LOCAL lock -> hashed token rotation -> AFTER_COMMIT event -> async SMTP
Reset confirm -> hash lookup + lock -> BCrypt update + single-use mark
```

## 2. 시작 전에 수정 범위 좁히기

`05-implementation`에서 직접 구현할 곳은 **5개 파일의 TODO 6개**입니다. 아래 표에 없는 production 파일은 먼저 수정하지 않습니다.

각 번호 Step은 같은 순서로 진행합니다. Step 4-A와 4-B는 한 production 파일 안의 두 하위 작업입니다.

1. 대응 테스트에서 입력, 호출 순서와 기대 결과를 읽습니다.
2. 지정된 production 파일의 TODO만 구현합니다.
3. Step 전용 테스트를 실행합니다.
4. 통과하면 변경 범위를 확인하고 다음 Step으로 이동합니다.

| Step | 테스트에서 먼저 읽을 계약 | 직접 수정할 파일과 메서드 | 완료 gate |
|---:|---|---|---|
| 01 | `CustomOAuthUserServiceTest` | `oauth/security/Step01CustomOAuthUserService.kt`의 `normalizePrincipal` | profile 테스트 통과 |
| 02 | `OAuthAccountServiceTest` | `oauth/service/Step02OAuthAccountService.kt`의 `handleOAuthLogin` | account 테스트 통과 |
| 03 | `OAuthLoginHandlersTest` | `oauth/security/Step03OAuthLoginHandlers.kt`의 `onAuthenticationSuccess` | handler 테스트 통과 |
| 04-A | `AccountRecoveryServiceTest`의 요청 관련 테스트 | `recovery/service/Step04AccountRecoveryService.kt`의 `requestPasswordReset` | 요청·cooldown 계약 충족 |
| 04-B | `AccountRecoveryServiceTest`의 확정 관련 테스트 | 같은 파일의 `confirmPasswordReset` | service·동시성 테스트 통과 |
| 05 | `SmtpRecoveryMailSenderTest` | `recovery/mail/Step05SmtpRecoveryMailSender.kt`의 `sendPasswordResetMail` | mail 테스트 통과 |

### Step 파일명 규칙

직접 구현하는 production 파일 5개만 `Step` + 2자리 번호 + 기존 PascalCase 파일명으로 표시합니다.

- 파일명의 Step은 학생이 수정할 순서를 안내하며 Kotlin class 이름, package, import와 Spring bean 이름은 바꾸지 않습니다.
- Step 4-A와 4-B는 같은 `AccountRecoveryService`의 두 메서드이므로 `Step04` 파일 하나에서 진행합니다.
- Step 0은 환경과 Security 경계를 확인하는 읽기 단계이므로 파일명 접두사 대상이 아닙니다.
- Controller, Repository, DTO, domain, exception, 설정, 정적 화면과 테스트 파일은 제공된 연결 계약이므로 번호를 붙이지 않습니다.

Step 4-A만 끝낸 시점에는 같은 테스트 클래스의 confirm 관련 3개가 아직 실패합니다. IDE에서 요청 관련 5개 테스트만 먼저 확인하거나, 4-B까지 같은 파일을 완성한 뒤 아래 service gate를 실행합니다.

다음은 이미 구현된 scaffold입니다. TODO 구현에 필요한 계약을 읽고 테스트하되, 처음부터 수정 대상으로 잡지 않습니다.

| 영역 | 읽기 전용 파일 | 확인할 계약 |
|---|---|---|
| OAuth 모델 | `OAuthUserProfile.kt`, `OAuthLoginResponse.kt` | 정규화 결과와 로그인 응답 |
| 사용자 저장 | `User.kt`, `UserRepository.kt` | 길이·unique 제약과 lock 조회 |
| reset token | `PasswordResetToken.kt`, `PasswordResetTokenCodec.kt`, `PasswordResetTokenRepository.kt` | hash·회전·만료와 lock 조회 |
| 복구 연결 | controller, DTO, exception, `RecoveryMailSender.kt` | 공개 HTTP 응답과 추상화 경계 |
| 비동기 발송 | `RecoveryMailDispatch.kt` | AFTER_COMMIT·bounded executor·비식별 로그 |
| 화면·보안 | `SecurityConfig.kt`, `static/auth-practice/*` | 공개 endpoint와 URL secret 소비 |

## 3. Step 0 - 설정과 Security 경계

확인할 환경변수:

- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- redirect/recovery: `APP_FRONTEND_URL`, `APP_PASSWORD_RESET_URL`, `APP_RECOVERY_MAIL_FROM`
- reset 정책: `APP_PASSWORD_RESET_TOKEN_TTL=PT15M`, `APP_PASSWORD_RESET_RESEND_COOLDOWN=PT1M`
- SMTP: `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `SPRING_MAIL_PROPERTIES_MAIL_SMTP_*`

실제 값은 `.env`나 실행 환경에만 둡니다. `application.yaml`의 optional config import가 repository root의 `.env`를 properties 형식으로 읽으므로 다음 흐름으로 실행합니다.

```bash
java -version
docker version
docker compose version
test -f .env || cp .env.example .env
docker compose config --quiet
docker compose up -d --wait --wait-timeout 120
docker compose ps
curl -fsS http://localhost:8025/readyz
./gradlew bootRun
```

기본 `.env.example`은 로컬 Mailpit(`localhost:1025`, SMTP 인증·TLS 없음)을 사용합니다. `http://localhost:8025`에서 메일과 reset link를 확인할 수 있으며 외부 SMTP credential은 필요하지 않습니다. 실제 OAuth와 Gmail 수신은 유효한 client credential, callback URI, SMTP app password와 발신 정책을 준비한 별도 수동 검증입니다.

<details>
<summary>실제 Gmail SMTP로 수동 검증할 때의 override</summary>

다음 값은 repository가 아닌 로컬 `.env`에만 넣습니다.

```properties
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=<gmail-account>
SPRING_MAIL_PASSWORD=<app-password>
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_REQUIRED=true
APP_RECOVERY_MAIL_FROM=<authorized-sender>
```

</details>

Security 확인:

- OAuth 시작·callback, `/account-recovery/password-reset`, `/account-recovery/password-reset/confirm`은 공개합니다.
- `/auth/me`와 게시글 변경은 Bearer JWT를 요구합니다.
- OAuth `state`용 임시 session은 허용하되 보호 API session 인증으로 사용하지 않습니다.

## 4. Step 1 - OAuth profile 검증

`Step01CustomOAuthUserService.kt`에서 다음을 확인합니다.

1. registration ID를 provider로 정규화합니다.
2. Google `sub`를 providerId로 읽습니다.
3. email이 있고 비어 있지 않은지 확인합니다.
4. `email_verified=true`인지 확인합니다.
5. provider, providerId, email 길이 계약을 확인합니다.
6. Handler가 읽을 정규화된 속성만 반환합니다.

필수 값이 없거나 verified가 아니면 OAuth 경계에서 거부하고 원본 오류·attributes를 외부에 노출하지 않습니다.

## 5. Step 2 - 내부 계정 연결

`Step02OAuthAccountService.kt`의 판단 순서:

1. profile을 다시 검증·정규화합니다.
2. `provider + providerId`로 기존 사용자를 찾습니다.
3. 기존 사용자는 DB의 내부 email을 유지하고 그 값으로 JWT를 발급합니다.
4. identity가 없고 같은 email 계정이 있으면 자동 연결하지 않습니다.
5. 충돌이 없을 때만 신규 OAuth 계정을 저장합니다.
6. DB unique 저장 경쟁은 내부 제약을 숨긴 도메인 실패로 바꿉니다.
7. 성공 결과에 우리 서비스 JWT와 신규 여부를 담습니다.

기존 provider email을 내부 email에 자동 반영하면 JWT subject와 게시글 ownership이 흔들릴 수 있습니다. email 변경은 이번 로그인 흐름과 분리합니다.

## 6. Step 3 - OAuth redirect와 URL secret 소비

`Step03OAuthLoginHandlers.kt`:

- 성공 query에는 최소 공개 상태만 넣습니다.
- JWT는 query가 아니라 fragment의 `access_token`에만 둡니다.
- 응답에 `Cache-Control: no-store`를 설정합니다.
- link_required와 failed에는 token, fragment, email, 내부 오류를 넣지 않습니다.

정적 실습 화면은 `index.html`(LOCAL), `oauth.html`(Google OAuth), `recovery.html`(SMTP 복구)로 나뉩니다. 동기 `redirect-bootstrap.js`가 HTML 본문 파싱 전에 URL 값을 회수·제거하고, `practice-common.js`는 HTTP 증거 마스킹 helper만 공유합니다. `app.js`, `oauth.js`, `recovery.js`는 각 화면의 endpoint만 다루며 OAuth/reset payload는 bootstrap이 만든 메모리 값만 넘겨받습니다.

1. 동기 bootstrap은 OAuth 페이지에서 `#access_token`, 복구 페이지에서 `#reset_token`을 JavaScript 메모리로 옮깁니다.
2. `history.replaceState`로 query와 fragment를 즉시 제거합니다.
3. OAuth JWT는 `/auth/me`에 Bearer로 보내고 서버 응답으로 내부 신원을 확인합니다.
4. reset token은 확정 요청에만 사용하고 DOM·교환 기록에 출력하지 않습니다.
5. 둘 다 local storage, session storage, cookie에 저장하지 않습니다.

OAuth query의 provider·신규 여부는 화면 설명용 metadata이며 내부 로그인 ID의 근거는 `/auth/me` 응답입니다. Google 비밀번호는 전달되지 않습니다. OAuth JWT는 학습 목적의 명시적인 token receipt에는 보일 수 있으므로 URL 제거를 token 전체 비노출이나 운영 token 전달 설계로 표현하지 않습니다.

## 7. Step 4-A - 복구 요청과 token 발급

요청 endpoint: `POST /account-recovery/password-reset`

`Step04AccountRecoveryService.kt`:

1. email을 `Locale.ROOT` 규칙으로 소문자화합니다.
2. 계정이 없으면 조용히 종료합니다.
3. `LOCAL`이 아니면 조용히 종료합니다.
4. LOCAL 사용자를 pessimistic write lock으로 읽고 사용자당 token 행도 lock합니다.
5. 활성 token 발급 후 1분 전이면 token과 mail event를 새로 만들지 않습니다. 정확히 1분 경계에서는 재발급합니다.
6. `SecureRandom` 32-byte를 Base64URL without padding으로 인코딩한 raw token을 만듭니다.
7. raw token의 SHA-256 hash, 발급 시각, 15분 만료 시각만 저장합니다.
8. 사용자당 한 행을 새 값으로 회전해 이전 raw token을 무효화합니다.
9. raw token은 email 없는 `#reset_token` fragment에만 넣고 mail event를 발행합니다.

유효한 DTO 요청은 계정 없음, OAuth 계정, SMTP 실패 여부와 무관하게 `Cache-Control: no-store`와 202입니다. 빈 값, 잘못된 형식, 254자 초과는 400입니다. 202는 mail delivery 성공을 뜻하지 않습니다.

## 8. Step 4-B - 비밀번호 재설정 확정

확정 endpoint와 body:

```http
POST /account-recovery/password-reset/confirm
Content-Type: application/json

{"token":"<raw-token>","newPassword":"<8~64자>"}
```

`Step04AccountRecoveryService.kt`는 다음 순서를 지킵니다.

1. raw token을 SHA-256 hash로 바꿔 초기 token과 사용자 ID를 찾습니다.
2. 사용자와 token을 write lock으로 다시 읽습니다.
3. LOCAL 사용자, 같은 사용자, 미사용, `expiresAt > now`를 모두 확인합니다.
4. 새 password를 BCrypt로 encode하고 token에 `usedAt`을 기록합니다.
5. password 변경과 사용 처리를 같은 트랜잭션에서 commit합니다.

성공은 `Cache-Control: no-store`와 204입니다. 회전·만료·재사용·존재하지 않는 token은 모두 400 `INVALID_PASSWORD_RESET_TOKEN`으로 응답하며, 정확히 만료 시각인 token도 무효입니다.

## 9. Step 5 - SMTP adapter 구현

`RecoveryMailDispatch.kt`는 수정하지 않고 다음 제공 계약을 확인합니다.

- `@TransactionalEventListener(AFTER_COMMIT)`으로 token 저장 commit 전에는 메일을 보내지 않습니다.
- core 1, max 2, queue 100의 bounded executor를 사용합니다.
- `@Async`이므로 HTTP 요청은 SMTP 연결·응답을 기다리지 않습니다.
- event의 `toString`과 실패 log는 recipient, token, link, SMTP 원인을 노출하지 않습니다.
- SMTP 또는 task 거부가 발생해도 이미 정해진 공개 202 계약을 바꾸지 않습니다.

`Step05SmtpRecoveryMailSender.kt`:

- `RecoveryMailSender`를 구현합니다.
- `APP_RECOVERY_MAIL_FROM`을 발신자로 사용합니다.
- 수신자, 제목, 본문, reset link를 구성합니다.
- `JavaMailSender`로 보내고 mail 예외를 recovery 도메인 실패로 바꿉니다. dispatcher가 이 실패를 고정된 비식별 log로 처리합니다.
- 연결·읽기·쓰기 timeout은 `SPRING_MAIL_PROPERTIES_MAIL_SMTP_*`으로 유한하게 둡니다.

Service는 `JavaMailSender`를 직접 알지 않아야 합니다. 테스트는 sender 또는 `JavaMailSender`를 mock하므로 외부 SMTP에 연결하지 않습니다.

## 10. 테스트

`05-implementation`은 TODO를 호출하는 테스트가 구현 전 실패하는 것이 정상입니다. 설정·컴파일 실패와 의도된 TODO 실패를 구분합니다.

Step 1, 2, 3, 5를 끝낼 때마다 대응 gate만 실행합니다. Step 4는 4-A와 4-B를 모두 마친 뒤 service gate를 실행합니다.

```bash
# Step 1
./gradlew test --tests '*CustomOAuthUserServiceTest'

# Step 2
./gradlew test --tests '*OAuthAccountServiceTest'

# Step 3
./gradlew test \
  --tests '*OAuthLoginHandlersTest' \
  --tests '*OAuthSessionBoundaryIntegrationTest'

# Step 4-A와 4-B를 모두 마친 뒤
./gradlew test \
  --tests '*AccountRecoveryServiceTest' \
  --tests '*AccountRecoveryConcurrencyIntegrationTest' \
  --tests '*AccountRecoveryControllerTest'

# Step 5
./gradlew test \
  --tests '*SmtpRecoveryMailSenderTest' \
  --tests '*RecoveryMailContractTest' \
  --tests '*RecoveryMailDispatchTest' \
  --tests '*RecoveryMailEventIntegrationTest'
```

제공된 scaffold를 수정하지 않아도 다음 테스트는 처음부터 통과해야 합니다.

```bash
./gradlew test --tests '*PasswordResetTokenCodecTest'
./gradlew test --tests '*PasswordResetTokenRepositoryTest'
./gradlew test --tests '*RecoveryMailDispatchTest'
./gradlew test --tests '*RecoveryMailEventIntegrationTest'
./gradlew test --tests '*AccountRecoveryController*Test'
./gradlew test --tests '*AuthPracticePageIntegrationTest'
```

모든 TODO를 구현한 뒤 먼저 다음 검색 결과가 0건인지 확인합니다. `rg`는 결과가 없으면 종료 코드 1을 반환하지만, 이 경우가 정상입니다.

```bash
rg -n 'TODO\(' src/main/kotlin
```

검색 결과가 없으면 전체 gate를 실행합니다.

```bash
./gradlew test
node --check src/main/resources/static/auth-practice/redirect-bootstrap.js
node --check src/main/resources/static/auth-practice/practice-common.js
node --check src/main/resources/static/auth-practice/app.js
node --check src/main/resources/static/auth-practice/oauth.js
node --check src/main/resources/static/auth-practice/recovery.js
git diff --check
```

`rg` 결과는 0건이고 전체 테스트가 모두 통과해야 합니다. `05-answer`도 외부 credential 없이 같은 전체 gate를 통과해야 합니다.

자동 테스트는 OAuth 검증·계정 정책·redirect·session 경계, HTML 정적 진입점과 URL 처리 코드 연결, LOCAL recovery·202·cooldown, token hash·회전·만료·단일 사용, AFTER_COMMIT async dispatch, SMTP 실패·메시지 조립과 최신 04 회귀를 확인합니다. 실제 URL 제거 동작은 브라우저에서도 확인합니다.

## 11. 외부 수동 검증

Google:

1. `/login/oauth2/code/google`을 callback URI로 등록합니다.
2. `http://localhost:8080/auth-practice/oauth.html`에서 공식 Google 버튼으로 로그인합니다.
3. redirect 직후 URL의 query·fragment가 즉시 제거되는지 확인합니다.
4. 가입 영수증에서 Google 비밀번호가 전달되지 않았고, 신규 내부 OAuth 계정 생성 또는 기존 계정 재사용 여부가 표시되는지 확인합니다.
5. 화면이 우리 JWT로 `/auth/me`를 호출해 내부 로그인 ID를 표시하는지 확인합니다.
6. browser storage와 cookie에 JWT가 저장되지 않았는지 확인합니다.
7. OAuth session만으로 보호 API가 열리지 않는지 확인합니다.

SMTP:

1. `http://localhost:8080/auth-practice/recovery.html`을 열고 LOCAL 테스트 계정을 준비합니다.
2. `SPRING_MAIL_*`과 `APP_RECOVERY_MAIL_FROM`을 로컬 secret으로 주입합니다.
3. 복구 endpoint가 즉시 202를 반환하고 메일이 비동기로 도착하는지 확인합니다.
4. reset link를 열자마자 fragment가 URL에서 제거되고 실제 password가 변경되는지 확인합니다.
5. 같은 token의 재사용, 만료 token, 재발급 전 token이 같은 400으로 거부되는지 확인합니다.
6. 없는 계정과 OAuth 계정도 같은 공개 응답인지 확인합니다.
7. credential, 복구 대상 email, reset token, link, SMTP 내부 오류가 로그에 없는지 확인합니다.

실제 Google·Gmail 성공은 credential이 필요한 수동 E2E이며 자동 테스트 통과와 별도 증거입니다.

## 12. 완료 기준

- 최신 04 회귀를 유지했습니다.
- package가 `common/user/auth/oauth/recovery/post` 역할과 맞습니다.
- provider identity, 자동 연결 금지, 내부 email 안정성을 설명합니다.
- STATELESS API와 임시 OAuth state session을 구분합니다.
- fragment를 즉시 지우고 token을 메모리에만 유지하며 receipt 노출 경계를 설명합니다.
- recovery 202, LOCAL-only, 1분 cooldown, AFTER_COMMIT async mail 경계를 지킵니다.
- raw token/hash 분리, 15분 만료, 회전, 단일 사용, BCrypt 변경을 확인합니다.
- 기존 JWT 미폐기, IP/distributed rate limiter 부재, JPA `ddl-auto=update`와 Flyway 부재를 한계로 남깁니다.
- 실제 Google·Gmail E2E를 credential이 필요한 수동 검증으로 구분합니다.
- `./gradlew test`와 `git diff --check`를 확인합니다.

<details>
<summary>멘토용 진행 포인트</summary>

- profile -> account -> redirect -> recovery -> SMTP 순서로 테스트를 좁힙니다.
- 편의를 이유로 자동 연결·내부 email 변경을 추가하지 않게 합니다.
- URL 제거와 memory/receipt 노출을 서로 다른 경계로 설명하게 합니다.
- 실제 메일보다 token commit, sender 조건과 공개 응답을 먼저 확인합니다.
- H2 테스트와 실제 MySQL lock, 자동 테스트와 실제 provider E2E의 증거 범위를 구분합니다.

</details>
