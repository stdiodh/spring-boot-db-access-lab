# 05 OAuth2와 SMTP 계정 복구 체크리스트

## 1. 기반과 구조

- [ ] 최신 `04-answer`의 JWT·인가·오류·UI·Swagger 회귀를 보존했습니다.
- [ ] package가 `common/user/auth/oauth/recovery/post`로 나뉩니다.
- [ ] 직접 구현하는 production 파일 5개만 `Step01`부터 `Step05`까지 표시되고 class·package 이름은 유지됩니다.
- [ ] README와 구현 문서의 경로가 실제 파일과 일치합니다.
- [ ] 표준 문서는 `README.md`, `docs/theory.md`, `docs/implementation.md`, `docs/checklist.md` 네 개입니다.
- [ ] 실제 secret을 소스·문서·로그에 넣지 않았습니다.
- [ ] `docker compose up -d --wait --wait-timeout 120`으로 MySQL과 Mailpit 준비 상태를 확인했습니다.
- [ ] Visual Lab의 verified·unverified·LOCAL 충돌·복구 생명주기 네 조건을 비교했습니다.
- [ ] `index.html`, `oauth.html`, `recovery.html`이 LOCAL·Google OAuth·SMTP 복구 책임으로 분리되어 있습니다.
- [ ] 세 화면의 상단 전환 링크와 현재 페이지 `aria-current`가 키보드와 모바일에서도 동작합니다.

## 2. OAuth profile과 계정 정책

- [ ] Google `sub`를 providerId로 사용합니다.
- [ ] email이 없거나 `email_verified=true`가 아니면 거부합니다.
- [ ] provider와 email을 `Locale.ROOT` 규칙으로 정규화하고 providerId를 포함한 길이를 확인합니다.
- [ ] `provider + providerId`로 기존 사용자를 먼저 찾습니다.
- [ ] 같은 email의 LOCAL·다른 외부 계정을 자동 연결하지 않습니다.
- [ ] 연결 필요 상태에 token이나 내부 정보를 넣지 않습니다.
- [ ] 기존 OAuth 사용자의 내부 email을 provider 변경값으로 자동 갱신하지 않습니다.
- [ ] 신규 저장과 DB unique 경쟁을 안전하게 처리합니다.
- [ ] 성공 뒤 우리 서비스 JWT를 발급합니다.
- [ ] Google 비밀번호가 전달되거나 LOCAL 비밀번호로 저장되지 않음을 설명합니다.
- [ ] 공식 Google G 표시와 접근 가능한 `Google로 계속하기` 링크를 사용합니다.
- [ ] OAuth 화면이 신규 내부 계정과 기존 OAuth 계정 재사용을 구분해 보여줍니다.

## 3. redirect와 session 경계

- [ ] 성공 JWT는 query가 아니라 fragment의 `access_token`에만 있습니다.
- [ ] 동기 `redirect-bootstrap.js`는 HTML 본문 파싱 전에 OAuth/reset fragment를 메모리로 소비합니다.
- [ ] 소비 직후 `history.replaceState`로 query와 fragment를 제거합니다.
- [ ] OAuth JWT로 `/auth/me`를 호출하고 서버 응답만 내부 신원 근거로 사용합니다.
- [ ] provider와 신규 여부 query는 설명용 metadata이며 권한 근거로 사용하지 않습니다.
- [ ] OAuth JWT와 reset token을 local/session storage나 cookie에 저장하지 않습니다.
- [ ] reset token을 DOM이나 HTTP 교환 기록에 표시하지 않습니다.
- [ ] OAuth JWT는 학습용 token receipt에 명시적으로 보일 수 있다는 경계를 설명합니다.
- [ ] redirect에 `Cache-Control: no-store`가 있습니다.
- [ ] failed/link_required에 email, token, 원본 오류가 없습니다.
- [ ] URL 제거가 운영 token 전달 설계나 token 전체 비노출을 뜻하지 않음을 설명합니다.
- [ ] OAuth `state`용 임시 session과 API session 인증을 구분합니다.
- [ ] OAuth session만으로 보호 API에 접근할 수 없습니다.
- [ ] 보호 API는 계속 Bearer JWT를 요구합니다.

## 4. 계정 복구

- [ ] endpoint를 `POST /account-recovery/password-reset`으로 통일했습니다.
- [ ] email은 NotBlank, Email, 최대 254자를 검증하고 `Locale.ROOT`로 정규화합니다.
- [ ] 존재하지 않는 계정은 sender를 호출하지 않습니다.
- [ ] LOCAL 계정만 복구 메일을 보냅니다.
- [ ] OAuth 계정은 sender를 호출하지 않습니다.
- [ ] SMTP 연결·인증 사전검사는 계정 조회 전에 모든 유효한 email에 같은 순서로 실행합니다.
- [ ] Gmail 앱 비밀번호 누락·오류는 `RECOVERY_MAIL_AUTHENTICATION_FAILED`의 no-store 503입니다.
- [ ] SMTP 연결 실패는 원문을 숨긴 `RECOVERY_MAIL_UNAVAILABLE`의 no-store 503입니다.
- [ ] 사전검사 통과 뒤 계정 없음, OAuth 계정과 commit 이후 비동기 발송 실패는 같은 no-store 202입니다.
- [ ] 202를 mail delivery 성공으로 표현하지 않습니다.
- [ ] LOCAL 사용자별 1분 cooldown 안에는 token과 mail event를 재발급하지 않습니다.
- [ ] 정확히 1분 경계에서는 재발급을 허용합니다.
- [ ] HTTP 요청은 SMTP 사전검사만 기다리고 실제 메시지 발송 완료는 기다리지 않습니다.
- [ ] reset token, 복구 대상 email, link, SMTP 오류를 로그·공개 응답에 넣지 않습니다.

## 5. reset token과 비밀번호 변경

- [ ] raw token은 `SecureRandom` 32-byte를 Base64URL without padding으로 인코딩합니다.
- [ ] reset link에는 email 없이 `#reset_token=<raw-token>` fragment만 있습니다.
- [ ] DB에는 raw token이 아니라 64자리 SHA-256 hex hash만 저장합니다.
- [ ] 사용자당 token 행 하나를 회전하며 새 발급이 이전 token을 무효화합니다.
- [ ] TTL 기본값은 15분이고 정확히 만료 시각이면 무효입니다.
- [ ] 확정 endpoint는 `POST /account-recovery/password-reset/confirm`입니다.
- [ ] 확정 body는 `{token,newPassword}`이고 password는 8~64자를 검증합니다.
- [ ] 유효한 확정은 `no-store`와 204를 반환합니다.
- [ ] 만료·재사용·회전·미존재 token은 같은 400 `INVALID_PASSWORD_RESET_TOKEN`입니다.
- [ ] 새 password는 BCrypt로 encode합니다.
- [ ] password 변경과 token 사용 처리를 같은 트랜잭션에서 수행합니다.
- [ ] 한 번 성공한 token은 재사용할 수 없습니다.

## 6. mail 책임과 비동기 경계

- [ ] `RecoveryMailReadiness`는 recipient·reset token 없이 `testConnection`만 호출합니다.
- [ ] 전역 SMTP 사전검사가 실패하면 `AccountRecoveryService`를 호출하지 않습니다.
- [ ] `AccountRecoveryService`는 mail event를 발행하고 SMTP 구현을 직접 알지 않습니다.
- [ ] `RecoveryMailEventDispatcher`가 `RecoveryMailSender`에 의존합니다.
- [ ] `SmtpRecoveryMailSender`만 `JavaMailSender`를 사용합니다.
- [ ] token 저장 transaction이 commit된 뒤에만 mail event를 처리합니다.
- [ ] recovery 전용 executor의 thread/queue 크기가 bounded입니다.
- [ ] event `toString`, async 실패 log, task 거부 log에 email·token·link·SMTP 원인이 없습니다.
- [ ] 발신자는 `APP_RECOVERY_MAIL_FROM`으로 설정합니다.
- [ ] SMTP 설정은 `SPRING_MAIL_*`과 `SPRING_MAIL_PROPERTIES_MAIL_SMTP_*`을 사용합니다.
- [ ] 연결·읽기·쓰기 timeout이 유한합니다.
- [ ] 자동 테스트는 실제 SMTP에 연결하지 않습니다.

## 7. 자동 테스트

- [ ] OAuth 필수 값·verified email 테스트가 있습니다.
- [ ] provider identity·email 충돌·내부 email 안정성 테스트가 있습니다.
- [ ] unique 저장 경쟁과 redirect 비노출 테스트가 있습니다.
- [ ] 임시 OAuth session과 보호 API 경계 테스트가 있습니다.
- [ ] HTML 정적 진입점에 fragment 소비·URL 제거·memory-only 코드가 연결되어 있습니다.
- [ ] 계정 조회 전 SMTP 인증·연결 503과 service 미호출 테스트가 있습니다.
- [ ] 사전검사 통과 뒤 LOCAL-only recovery, 같은 202와 cooldown 경계 테스트가 있습니다.
- [ ] raw token 길이·Base64URL 형식·매번 새 값·SHA-256 hash 테스트가 있습니다.
- [ ] token 회전·15분 만료 경계·단일 사용·BCrypt 변경 테스트가 있습니다.
- [ ] AFTER_COMMIT·async dispatch·개별 SMTP 전송 실패 비노출 테스트가 있습니다.
- [ ] reset link fragment와 SMTP 메시지 조립 테스트가 있습니다.
- [ ] `05-implementation`의 초기 TODO 실패가 의도된 상태임을 확인했습니다.
- [ ] `05-answer`에서 외부 credential 없이 `./gradlew test` 전체가 통과합니다.
- [ ] `git diff --check`가 통과합니다.

## 8. 외부 수동 검증

- [ ] 기본 Mailpit(`http://localhost:8025`)에서 reset 메일과 fragment link를 확인했습니다.
- [ ] Google callback URI를 `/login/oauth2/code/google`로 등록했습니다.
- [ ] `APP_OAUTH_RESULT_URL`은 callback URI가 아니라 `oauth.html` 영수증 화면을 가리킵니다.
- [ ] OAuth 결과는 `oauth.html`, reset link는 `recovery.html`로 돌아옵니다.
- [ ] 실제 Google redirect 뒤 query·fragment가 즉시 지워지는지 확인했습니다.
- [ ] `/auth/me`가 내부 신원을 표시하고 browser storage/cookie에 JWT가 없는지 확인했습니다.
- [ ] 실제 SMTP credential은 로컬 secret으로만 주입했습니다.
- [ ] 앱 비밀번호 누락·오류와 SMTP 연결 실패가 email과 무관한 같은 전역 503인지 확인했습니다.
- [ ] LOCAL 계정 메일 수신, reset 성공과 token 재사용 거부를 확인했습니다.
- [ ] 사전검사 통과 뒤 없는/OAuth 계정의 같은 202와 HTTP가 실제 메시지 전송 완료를 기다리지 않는지 확인했습니다.
- [ ] 실제 MySQL에서 발급·확정 lock 경계를 별도로 점검했습니다.
- [ ] 외부 검증을 자동 테스트 통과 조건으로 만들지 않았습니다.
- [ ] 자동 테스트만으로 실제 Google·Gmail 성공까지 검증했다고 주장하지 않습니다.

## 9. 남은 운영 보안 범위

- [ ] password reset 뒤 기존 JWT가 자동 폐기되지 않음을 설명합니다.
- [ ] token version, revoke 시각 또는 denylist를 후속 과제로 구분합니다.
- [ ] 사용자별 cooldown이 IP·장치·distributed rate limiter를 대신하지 않음을 설명합니다.
- [ ] JPA `ddl-auto=update`가 Flyway migration을 대신하지 않음을 설명합니다.
- [ ] H2 테스트가 실제 MySQL lock·격리 동작의 완전한 증거가 아님을 설명합니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- providerId 식별, verified email 충돌, 자동 연결 금지 순서를 설명하는지 봅니다.
- 내부 email 안정성과 JWT subject·ownership의 관계를 질문합니다.
- STATELESS와 OAuth state session을 구분하는지 확인합니다.
- 실제 메일보다 202 비노출, LOCAL-only, token commit과 async 경계를 먼저 설명하게 합니다.
- 기존 JWT·rate limit·schema migration·실제 provider E2E를 남은 운영 범위로 구분하게 합니다.

</details>
