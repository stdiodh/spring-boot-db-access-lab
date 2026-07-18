# 05 OAuth2와 SMTP 계정 복구 구현 가이드

## 1. 구현 기준

최신 `04-answer`의 signup, login, JWT, 오류 응답, 보호 API, 게시글 ownership과 회귀 테스트를 보존합니다. 05에서는 OAuth profile, 내부 계정 연결, redirect, 계정 복구와 SMTP adapter만 구현합니다.

```text
OAuth result -> verified profile -> internal account -> JWT -> redirect
Recovery request -> LOCAL policy -> demo link -> mail port -> SMTP
```

## 2. 구현 파일 순서

| 순서 | 파일 | 책임 |
|---:|---|---|
| 1 | `src/main/kotlin/com/andi/rest_crud/oauth/security/CustomOAuthUserService.kt` | 외부 속성 검증·정규화 |
| 2 | `src/main/kotlin/com/andi/rest_crud/oauth/service/OAuthAccountService.kt` | 내부 사용자 연결과 JWT |
| 3 | `src/main/kotlin/com/andi/rest_crud/oauth/security/OAuthLoginHandlers.kt` | 공개 redirect |
| 4 | `src/main/kotlin/com/andi/rest_crud/recovery/service/AccountRecoveryService.kt` | LOCAL 복구 정책 |
| 5 | `src/main/kotlin/com/andi/rest_crud/recovery/mail/SmtpRecoveryMailSender.kt` | SMTP 메시지와 발송 |

연결 파일:

- `common/config/SecurityConfig.kt`
- `user/domain/User.kt`, `user/repository/UserRepository.kt`
- `oauth/model/OAuthUserProfile.kt`, `oauth/dto/OAuthLoginResponse.kt`
- `recovery/controller/AccountRecoveryController.kt`
- `recovery/dto/PasswordResetMailRequest.kt`
- `recovery/mail/RecoveryMailSender.kt`

## 3. Step 1 - 설정과 Security 경계

확인할 환경변수:

- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- redirect/recovery: `APP_FRONTEND_URL`, `APP_PASSWORD_RESET_URL`, `APP_RECOVERY_MAIL_FROM`
- SMTP: `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `SPRING_MAIL_PROPERTIES_MAIL_SMTP_*`

실제 값은 `.env`나 실행 환경에만 둡니다.

Security 확인:

- OAuth 시작·callback과 `/account-recovery/password-reset`은 공개합니다.
- `/auth/me`와 게시글 변경은 Bearer JWT를 요구합니다.
- OAuth `state`용 임시 session은 허용하되 보호 API session 인증으로 사용하지 않습니다.

## 4. Step 2 - OAuth profile 검증

`CustomOAuthUserService.kt`에서 다음을 확인합니다.

1. registration ID를 provider로 정규화합니다.
2. Google `sub`를 providerId로 읽습니다.
3. email이 있고 비어 있지 않은지 확인합니다.
4. `email_verified=true`인지 확인합니다.
5. provider, providerId, email 길이 계약을 확인합니다.
6. Handler가 읽을 정규화된 속성만 반환합니다.

필수 값이 없거나 verified가 아니면 OAuth 경계에서 거부하고 원본 오류·attributes를 외부에 노출하지 않습니다.

## 5. Step 3 - 내부 계정 연결

`OAuthAccountService.kt`의 판단 순서:

1. profile을 다시 검증·정규화합니다.
2. `provider + providerId`로 기존 사용자를 찾습니다.
3. 기존 사용자는 DB의 내부 email을 유지하고 그 값으로 JWT를 발급합니다.
4. identity가 없고 같은 email 계정이 있으면 자동 연결하지 않습니다.
5. 충돌이 없을 때만 신규 OAuth 계정을 저장합니다.
6. DB unique 저장 경쟁은 내부 제약을 숨긴 도메인 실패로 바꿉니다.
7. 성공 결과에 우리 서비스 JWT와 신규 여부를 담습니다.

기존 provider email을 내부 email에 자동 반영하면 JWT subject와 게시글 ownership이 흔들릴 수 있습니다. email 변경은 이번 로그인 흐름과 분리합니다.

## 6. Step 4 - OAuth redirect

`OAuthLoginHandlers.kt`:

- 성공 query에는 최소 공개 상태만 넣습니다.
- JWT는 query가 아니라 fragment의 `access_token`에만 둡니다.
- 응답에 `Cache-Control: no-store`를 설정합니다.
- link_required와 failed에는 token, fragment, email, 내부 오류를 넣지 않습니다.

현재 화면은 fragment를 자동으로 읽거나 제거하거나 API에 사용하지 않습니다. 주소에서 로컬 token을 수동으로 복사해 curl 또는 Postman의 `Authorization: Bearer <token>`으로 `/auth/me`를 확인하고 URL을 직접 지웁니다. 이 방식은 운영 token 전달 설계가 아닙니다.

## 7. Step 5 - 계정 복구

실제 endpoint: `POST /account-recovery/password-reset`

`AccountRecoveryService.kt`:

1. email을 `Locale.ROOT` 규칙으로 소문자화합니다.
2. 계정이 없으면 조용히 종료합니다.
3. `LOCAL`이 아니면 조용히 종료합니다.
4. LOCAL 사용자만 email 없는 demo reset link를 만듭니다.
5. `RecoveryMailSender`로 발송합니다.
6. 예상 가능한 메일 전송 실패는 외부로 전파하지 않습니다.
7. email, token, link, SMTP 내부 오류를 로그에 넣지 않습니다.

유효한 DTO 요청은 내부 결과와 무관하게 202입니다. 빈 값, 잘못된 형식, 254자 초과는 400입니다.

구현하지 않는 것: token 저장·hash·사용자 매핑·만료·단일 사용·실제 password 변경·rate limit.

## 8. Step 6 - SMTP adapter

`SmtpRecoveryMailSender.kt`:

- `RecoveryMailSender`를 구현합니다.
- `APP_RECOVERY_MAIL_FROM`을 발신자로 사용합니다.
- 수신자, 제목, 본문, demo link를 구성합니다.
- `JavaMailSender`로 보내고 mail 예외를 recovery 도메인 실패로 바꿉니다.
- 연결·읽기·쓰기 timeout은 `SPRING_MAIL_PROPERTIES_MAIL_SMTP_*`으로 유한하게 둡니다.

Service는 `JavaMailSender`를 직접 알지 않아야 합니다. 테스트는 sender 또는 `JavaMailSender`를 mock하므로 외부 SMTP에 연결하지 않습니다.

## 9. 테스트

`05-implementation`은 TODO를 호출하는 테스트가 구현 전 실패하는 것이 정상입니다. 설정·컴파일 실패와 의도된 TODO 실패를 구분합니다.

```bash
./gradlew test --tests '*CustomOAuthUserServiceTest'
./gradlew test --tests '*OAuthAccountServiceTest'
./gradlew test --tests '*OAuthLoginHandler*Test'
./gradlew test --tests '*OAuth*IntegrationTest'
./gradlew test --tests '*AccountRecoveryServiceTest'
./gradlew test --tests '*SmtpRecoveryMailSenderTest'
./gradlew test --tests '*AccountRecoveryController*Test'
./gradlew test
```

실제 클래스 이름은 현재 `src/test/kotlin/com/andi/rest_crud` 트리에서 확인합니다. `05-answer`은 외부 credential 없이 전체 테스트가 통과해야 합니다.

자동 테스트는 OAuth 검증·계정 정책·redirect·session 경계, LOCAL recovery·202·SMTP 실패, 메시지 조립과 최신 04 회귀를 확인합니다.

## 10. 외부 수동 검증

Google:

1. `/login/oauth2/code/google`을 callback URI로 등록합니다.
2. `/oauth2/authorization/google`에서 로그인합니다.
3. 공개 query와 fragment를 주소에서 관찰합니다.
4. 로컬 token을 수동 복사해 curl/Postman으로 `/auth/me`를 호출합니다.
5. URL을 직접 지우고 OAuth session만으로 보호 API가 열리지 않는지 확인합니다.

SMTP:

1. LOCAL 테스트 계정을 준비합니다.
2. `SPRING_MAIL_*`과 `APP_RECOVERY_MAIL_FROM`을 로컬 secret으로 주입합니다.
3. 복구 endpoint가 202를 반환하고 메일이 도착하는지 확인합니다.
4. 없는 계정과 OAuth 계정도 같은 공개 응답인지 확인합니다.
5. credential, email, token, link가 로그에 없는지 확인합니다.

실제 provider 성공은 자동 테스트와 별도 증거입니다.

## 11. 완료 기준

- 최신 04 회귀를 유지했습니다.
- package가 `common/user/auth/oauth/recovery/post` 역할과 맞습니다.
- provider identity, 자동 연결 금지, 내부 email 안정성을 설명합니다.
- STATELESS API와 임시 OAuth state session을 구분합니다.
- fragment를 수동 관찰용 데모로 한정합니다.
- recovery 202, LOCAL-only, mail port 분리를 지킵니다.
- reset link의 미구현 보안 범위를 설명합니다.
- `./gradlew test`와 `git diff --check`를 확인합니다.

<details>
<summary>멘토용 진행 포인트</summary>

- profile -> account -> redirect -> recovery -> SMTP 순서로 테스트를 좁힙니다.
- 편의를 이유로 자동 연결·내부 email 변경을 추가하지 않게 합니다.
- demo fragment와 reset token을 운영 설계로 일반화하지 않게 합니다.
- 실제 메일보다 sender 조건과 공개 응답을 먼저 확인합니다.

</details>
