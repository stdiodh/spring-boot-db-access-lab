# 05 OAuth2와 SMTP 계정 복구

## 목표와 선수 조건

이번 시퀀스는 최신 `04-answer`의 signup, login, JWT, Security 401/403, 게시글 ownership 흐름 위에 Google OAuth2 로그인과 SMTP 계정 복구 요청을 연결합니다.

학습 목표:

- 검증된 email과 `provider + providerId`로 외부 사용자를 식별합니다.
- 같은 email의 LOCAL 계정을 자동 연결하지 않습니다.
- 기존 OAuth 사용자의 내부 email을 외부 변경값으로 자동 갱신하지 않습니다.
- OAuth 성공 뒤 우리 API용 JWT를 별도로 발급합니다.
- OAuth `state`용 임시 session과 STATELESS API 인증을 구분합니다.
- 계정 조회 전 SMTP 상태는 안전한 전역 503으로, 사전검사 통과 뒤 계정별 결과는 같은 202로 분리합니다.
- `RecoveryMailSender`와 SMTP adapter의 책임을 나눕니다.
- reset token을 hash로 저장하고 만료·단일 사용·재발급 정책을 적용해 실제 비밀번호 변경까지 연결합니다.
- 트랜잭션 commit 이후의 비동기 SMTP 발송과 HTTP 응답 경계를 구분합니다.

실제 Google·SMTP credential은 소스와 문서에 기록하지 않습니다.

## 도메인 중심 구조

```text
src/main/kotlin/com/andi/rest_crud/
├── common/
│   ├── config/SecurityConfig.kt
│   └── error/ApiExceptionHandling.kt
├── user/
│   ├── domain/User.kt
│   └── repository/UserRepository.kt
├── auth/
│   ├── controller/AuthController.kt
│   ├── dto/AuthDtos.kt
│   ├── exception/AuthExceptions.kt
│   ├── security/JwtAuthentication.kt
│   └── service/AuthService.kt
├── oauth/
│   ├── dto/OAuthLoginResponse.kt
│   ├── exception/OAuthExceptions.kt
│   ├── model/OAuthUserProfile.kt
│   ├── security/Step01CustomOAuthUserService.kt
│   ├── security/Step03OAuthLoginHandlers.kt
│   └── service/Step02OAuthAccountService.kt
├── recovery/
│   ├── controller/AccountRecoveryController.kt
│   ├── domain/PasswordResetToken.kt
│   ├── dto/PasswordResetConfirmRequest.kt
│   ├── dto/PasswordResetMailRequest.kt
│   ├── exception/RecoveryExceptions.kt
│   ├── repository/PasswordResetTokenRepository.kt
│   ├── security/PasswordResetTokenCodec.kt
│   ├── mail/RecoveryMailSender.kt
│   ├── mail/RecoveryMailReadiness.kt
│   ├── mail/RecoveryMailDispatch.kt
│   ├── mail/Step05SmtpRecoveryMailSender.kt
│   └── service/Step04AccountRecoveryService.kt
└── post/
    ├── controller/PostController.kt
    ├── domain/PostEntity.kt
    ├── dto/PostDtos.kt
    ├── exception/PostExceptions.kt
    ├── repository/PostRepository.kt
    └── service/PostService.kt
```

`common`은 전역 조립과 공통 오류, `user`는 공유 사용자 저장 계약, 나머지는 기능별 책임을 가집니다.

## 구현 순서

`05-implementation`에서 직접 수정할 범위는 **5개 파일의 TODO 6개**입니다.
각 단계에서는 테스트를 먼저 읽고, 지정된 TODO만 구현한 뒤 대상 테스트가 통과하면 다음 파일로 이동합니다.

직접 구현하는 production 파일 5개만 `Step01`부터 `Step05`까지 표시합니다. 파일명의 Step은 탐색 순서이며 Kotlin class 이름과 package는 그대로 유지합니다.

| Step | 직접 수정할 파일 | TODO |
|---:|---|---|
| 01 | `oauth/security/Step01CustomOAuthUserService.kt` | 외부 profile 검증·정규화 |
| 02 | `oauth/service/Step02OAuthAccountService.kt` | 내부 계정 연결과 JWT 발급 |
| 03 | `oauth/security/Step03OAuthLoginHandlers.kt` | OAuth 성공 redirect |
| 04-A | `recovery/service/Step04AccountRecoveryService.kt` | reset token 발급·cooldown |
| 04-B | `recovery/service/Step04AccountRecoveryService.kt` | token 확정·비밀번호 변경 |
| 05 | `recovery/mail/Step05SmtpRecoveryMailSender.kt` | SMTP 메시지 조립·발송 |

`PasswordResetTokenCodec`, `PasswordResetToken`, repository, controller, `RecoveryMailDispatch`, Security 설정과 정적 화면은 제공된 연결 계약입니다. 처음부터 고치지 말고, 위 TODO를 구현할 때 호출 순서와 기대 결과를 확인하는 용도로 읽습니다.

환경 설정을 포함한 파일별 테스트와 세부 완료 조건은 [구현 가이드](./docs/implementation.md)의 Step 0부터 순서대로 따릅니다.

## 핵심 계약

### OAuth2

- `email_verified=true`인 email만 사용합니다.
- 기존 외부 사용자는 `provider + providerId`로 찾습니다.
- 같은 email의 LOCAL 또는 다른 외부 계정은 자동 연결하지 않고 `link_required`로 끝냅니다.
- 기존 OAuth 사용자는 DB에 저장된 내부 email로 JWT를 발급합니다. provider의 변경 email은 별도 계정 변경 절차 없이 반영하지 않습니다.
- 성공 Handler는 JWT를 query가 아닌 fragment의 `access_token`에 둡니다.
- 인증 실습 화면은 초기 script에서 fragment를 메모리로 소비한 직후 `history.replaceState`로 query와 fragment를 제거하고, JWT로 `/auth/me`를 호출해 내부 신원을 확인합니다.
- JWT는 local/session storage나 cookie에 저장하지 않습니다. 학습용 token receipt에는 명시적으로 표시될 수 있으므로 운영 UI의 token 처리 방식으로 일반화하지 않습니다.
- fragment도 브라우저 JavaScript와 history 처리 전에는 노출되는 경계입니다. 운영에서는 일회용 code 또는 HttpOnly cookie와 CSRF 정책을 별도로 설계합니다.

### Security session 경계

OAuth client는 authorization request와 callback의 `state`를 확인하려고 임시 session을 사용할 수 있습니다. 보호 API는 이 session을 로그인으로 사용하지 않으며 계속 `Authorization: Bearer <token>`을 요구합니다.

### 계정 복구

- 요청 endpoint는 `POST /account-recovery/password-reset`, 확정 endpoint는 `POST /account-recovery/password-reset/confirm`입니다.
- email을 검증·정규화하고 `LOCAL` 계정에만 메일을 보냅니다.
- 계정 조회 전에 SMTP 연결·인증 사전검사를 실행합니다. 전역 설정이 없거나 올바르지 않으면 모든 유효한 email에 `Cache-Control: no-store`와 같은 503을 반환합니다.
- 사전검사를 통과한 뒤에는 계정 없음, OAuth 계정, LOCAL 계정과 commit 이후 비동기 발송 결과를 구분하지 않고 같은 202를 반환합니다. HTTP 요청은 실제 메일 발송 완료를 기다리지 않습니다.
- OAuth 컬럼 추가 전에 생성된 계정은 `data.sql`이 `auth_provider = ''`이고 `provider_id`가 없을 때만 시작 시 `LOCAL`로 보정합니다. 외부 식별자가 있는 계정은 자동 변경하지 않습니다.
- raw token은 32-byte 난수를 Base64URL(no padding)로 인코딩해 메일의 `#reset_token` fragment에만 넣고, DB에는 SHA-256 hash만 저장합니다.
- token은 15분 뒤 만료되며 정확히 만료 시각부터 무효입니다. 사용자당 한 행을 회전하므로 재발급하면 이전 token이 무효가 되고, 성공한 token은 한 번만 사용할 수 있습니다.
- 확정 요청 `{ "token": "...", "newPassword": "..." }`은 BCrypt password 변경과 사용 처리를 같은 트랜잭션에서 수행하고 성공 시 204를 반환합니다.
- LOCAL 사용자별 1분 재요청 제한을 적용합니다. 정확히 1분이 되면 새 요청을 허용합니다.
- Service는 mail event를 발행하고, dispatcher는 commit 이후 bounded executor에서 `RecoveryMailSender`를 호출합니다. SMTP 메시지 조립은 adapter가 담당합니다.

### 현재 범위와 한계

- 비밀번호를 바꿔도 이미 발급된 JWT는 만료 전까지 폐기되지 않습니다. token version 또는 denylist는 다음 보안 과제입니다.
- 1분 cooldown은 LOCAL 사용자 단위이며 IP·장치·분산 rate limiter를 대신하지 않습니다.
- 학습 환경은 JPA `ddl-auto=update`를 사용하고 Flyway 같은 명시적 schema migration을 포함하지 않습니다.
- 실제 Google·Gmail E2E는 credential과 외부 설정이 필요한 수동 검증입니다.

## 브랜치와 검증

- `05-implementation`: TODO를 호출하는 테스트는 구현 전 실패하는 것이 정상입니다.
- `05-answer`: 외부 Google·SMTP 연결 없이 `./gradlew test` 전체가 통과해야 합니다.
- 자동 테스트는 내부 정책과 04 회귀를 확인합니다.
- 실제 Google callback과 SMTP 수신은 credential을 준비한 경우에만 별도 수동 검증합니다.

## 로컬 설정과 실행

```bash
test -f .env || cp .env.example .env
docker compose config --quiet
docker compose up -d --wait --wait-timeout 120
docker compose ps
./gradlew bootRun
```

주요 환경변수:

- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- redirect/recovery: `APP_OAUTH_RESULT_URL=http://localhost:8080/auth-practice/oauth.html`, `APP_PASSWORD_RESET_URL=http://localhost:8080/auth-practice/recovery.html`, `APP_RECOVERY_MAIL_FROM`
- reset 정책: `APP_PASSWORD_RESET_TOKEN_TTL=PT15M`, `APP_PASSWORD_RESET_RESEND_COOLDOWN=PT1M`
- SMTP: `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `SPRING_MAIL_PROPERTIES_MAIL_SMTP_*`
- 기존 계약: `DB_*`, `JWT_*`

`application.yaml`이 로컬 `.env`를 optional properties 파일로 읽습니다. 기본값은 로컬 Mailpit(`localhost:1025`, SMTP 인증·TLS 없음)을 사용하므로 Gmail credential 없이 계정 복구 메일을 확인할 수 있습니다. 실제 Gmail은 host `smtp.gmail.com`, port `587`, SMTP 인증·STARTTLS `true`, Gmail 계정과 앱 비밀번호를 한 묶음으로 바꿉니다. 복구 요청은 계정 조회 전에 이 연결·인증만 확인하므로 앱 비밀번호 누락·오류를 안전한 503으로 표시하지만, 발신자 허용이나 수신함 도착까지 증명하지는 않습니다. OAuth 성공·실패는 `APP_OAUTH_RESULT_URL`의 Google OAuth 화면으로 돌아오고, server는 `APP_PASSWORD_RESET_URL`의 SMTP 복구 화면에 `#reset_token` fragment를 덧붙입니다. 예전 `APP_FRONTEND_URL`도 fallback으로 읽지만 기존 `.env`는 전용 키로 바꿔 callback URI와 결과 화면을 혼동하지 않습니다.

인증 실습 화면은 한 페이지가 한 trust boundary만 다루도록 분리합니다. 상단 버튼으로 이동할 수 있지만 access/reset token은 메모리에만 있으므로 페이지를 바꾸면 사라집니다.

확인 위치:

- 자체 로그인·JWT·게시글: `http://localhost:8080/auth-practice/index.html`
- Google OAuth·내부 계정 영수증: `http://localhost:8080/auth-practice/oauth.html`
- SMTP 계정 복구·reset 확정: `http://localhost:8080/auth-practice/recovery.html`
- Swagger: `http://localhost:8080/swagger`
- 로컬 메일함: `http://localhost:8025`
- OAuth 시작: `http://localhost:8080/oauth2/authorization/google`
- Google callback: `http://localhost:8080/login/oauth2/code/google`

Google 로그인은 `sub`, 검증된 email 같은 profile을 내부 계정 판단에 사용하고 우리 JWT를 따로 발급합니다. Google 비밀번호는 전달되지 않으며 LOCAL 로그인 비밀번호로 저장되지 않습니다. 화면의 Google 표시는 [Google Identity 브랜딩 가이드](https://developers.google.com/identity/branding-guidelines?hl=en)와 Google이 배포한 [공식 G 이미지](https://developers.google.com/static/identity/images/g-logo.png)를 기준으로, 원본 PNG를 색상·비율 변경 없이 로컬 SVG wrapper에 포함합니다(확인일: 2026-07-24).

## Visual Lab

OAuth 계정 판단과 reset token의 발급·비동기 메일·확정 생명주기를 네 가지 조건으로 비교합니다. 애플리케이션과 함께 띄울 때는 다른 port를 사용합니다.

```bash
python3 -m http.server 8081 -d docs/visual-lab
```

```text
http://localhost:8081/sequences/05/
```

## 문서

- [이론 정리](./docs/theory.md)
- [구현 가이드](./docs/implementation.md)
- [체크리스트](./docs/checklist.md)
- [Visual Lab](./docs/visual-lab/sequences/05/index.html)

표준 문서는 이 README와 위 세 파일만 사용합니다.

<details>
<summary>멘토용 진행 포인트</summary>

- 최신 04 회귀가 보존됐는지 먼저 확인합니다.
- provider identity, verified email, 자동 연결 금지 순서를 질문합니다.
- 임시 OAuth state session과 API session 인증을 구분하게 합니다.
- URL 제거 시점, 메모리 보관, token receipt 노출 경계를 구분하게 합니다.
- hash 저장·만료·단일 사용과 비동기 SMTP 경계를 설명하게 합니다.
- 기존 JWT 미폐기, IP/distributed rate limiter 부재, `ddl-auto=update` 한계를 운영 보안 완성으로 표현하지 않게 합니다.
- starter의 TODO 실패와 설정·컴파일 실패를 구분합니다.

</details>
