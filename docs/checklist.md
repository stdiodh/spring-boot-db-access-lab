# 05 OAuth2와 SMTP 계정 복구 체크리스트

## 1. 기반과 구조

- [ ] 최신 `04-answer`의 JWT·인가·오류·UI·Swagger 회귀를 보존했습니다.
- [ ] package가 `common/user/auth/oauth/recovery/post`로 나뉩니다.
- [ ] README와 구현 문서의 경로가 실제 파일과 일치합니다.
- [ ] 표준 문서는 `README.md`, `docs/theory.md`, `docs/implementation.md`, `docs/checklist.md` 네 개입니다.
- [ ] 실제 secret을 소스·문서·로그에 넣지 않았습니다.

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

## 3. redirect와 session 경계

- [ ] 성공 JWT는 query가 아니라 fragment의 `access_token`에만 있습니다.
- [ ] 현재 화면이 fragment를 자동 소비하지 않는다는 점을 확인했습니다.
- [ ] 로컬 token을 수동 복사해 curl/Postman으로 `/auth/me`를 확인한 뒤 URL을 직접 지웁니다.
- [ ] redirect에 `Cache-Control: no-store`가 있습니다.
- [ ] failed/link_required에 email, token, 원본 오류가 없습니다.
- [ ] fragment가 운영 token 전달 방식이 아님을 설명합니다.
- [ ] OAuth `state`용 임시 session과 API session 인증을 구분합니다.
- [ ] OAuth session만으로 보호 API에 접근할 수 없습니다.
- [ ] 보호 API는 계속 Bearer JWT를 요구합니다.

## 4. 계정 복구

- [ ] endpoint를 `POST /account-recovery/password-reset`으로 통일했습니다.
- [ ] email은 NotBlank, Email, 최대 254자를 검증하고 `Locale.ROOT`로 정규화합니다.
- [ ] 존재하지 않는 계정은 sender를 호출하지 않습니다.
- [ ] LOCAL 계정만 복구 메일을 보냅니다.
- [ ] OAuth 계정은 sender를 호출하지 않습니다.
- [ ] 계정 없음, OAuth 계정, SMTP 실패도 유효한 요청이면 같은 202입니다.
- [ ] 예상 가능한 mail 실패만 비노출 처리하고 다른 내부 버그를 무조건 숨기지 않습니다.
- [ ] token, email, link, SMTP 오류를 로그·응답에 넣지 않습니다.

## 5. reset link와 메일 책임

- [ ] reset link에는 email 없이 불투명 demo token만 있습니다.
- [ ] token 저장, 사용자 매핑, 만료, 단일 사용, 실제 password 변경이 없음을 설명합니다.
- [ ] 현재 link를 운영 가능한 재설정 기능이라고 표현하지 않습니다.
- [ ] `AccountRecoveryService`는 `RecoveryMailSender`에 의존합니다.
- [ ] `SmtpRecoveryMailSender`만 `JavaMailSender`를 사용합니다.
- [ ] 발신자는 `APP_RECOVERY_MAIL_FROM`으로 설정합니다.
- [ ] SMTP 설정은 `SPRING_MAIL_*`과 `SPRING_MAIL_PROPERTIES_MAIL_SMTP_*`을 사용합니다.
- [ ] 연결·읽기·쓰기 timeout이 유한합니다.
- [ ] 자동 테스트는 실제 SMTP에 연결하지 않습니다.

## 6. 자동 테스트

- [ ] OAuth 필수 값·verified email 테스트가 있습니다.
- [ ] provider identity·email 충돌·내부 email 안정성 테스트가 있습니다.
- [ ] unique 저장 경쟁과 redirect 비노출 테스트가 있습니다.
- [ ] 임시 OAuth session과 보호 API 경계 테스트가 있습니다.
- [ ] LOCAL-only recovery와 같은 202 테스트가 있습니다.
- [ ] SMTP 실패, demo link, 메시지 조립 테스트가 있습니다.
- [ ] `05-implementation`의 초기 TODO 실패가 의도된 상태임을 확인했습니다.
- [ ] `05-answer`에서 외부 credential 없이 `./gradlew test` 전체가 통과합니다.
- [ ] `git diff --check`가 통과합니다.

## 7. 외부 수동 검증

- [ ] Google callback URI를 `/login/oauth2/code/google`로 등록했습니다.
- [ ] 실제 Google redirect의 공개 query와 fragment를 수동 관찰했습니다.
- [ ] fragment token을 수동 복사해 보호 API를 확인하고 URL을 직접 지웠습니다.
- [ ] 실제 SMTP credential은 로컬 secret으로만 주입했습니다.
- [ ] LOCAL 계정 메일 수신과 없는/OAuth 계정의 같은 202를 확인했습니다.
- [ ] 외부 검증을 자동 테스트 통과 조건으로 만들지 않았습니다.
- [ ] 자동 테스트만으로 실제 Google·SMTP 성공까지 검증했다고 주장하지 않습니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- providerId 식별, verified email 충돌, 자동 연결 금지 순서를 설명하는지 봅니다.
- 내부 email 안정성과 JWT subject·ownership의 관계를 질문합니다.
- STATELESS와 OAuth state session을 구분하는지 확인합니다.
- 실제 메일보다 202 비노출, LOCAL-only, demo token 한계를 먼저 설명하게 합니다.

</details>
