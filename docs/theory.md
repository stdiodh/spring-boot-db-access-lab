# 이론 정리

> 외부 인증 결과와 메일 발송 요청을 내부 사용자, JWT, 공개 응답 정책 안으로 안전하게 연결하는 기준을 다룹니다.

## 1. Problem - 외부 성공을 그대로 사용할 수 없는 이유

Google 인증이 성공해도 우리 서비스는 내부 사용자를 식별하고 자체 JWT를 발급해야 합니다. 복구 메일 요청도 내부 결과가 달라졌다는 이유로 계정 존재나 인증 방식을 외부에 드러내면 안 됩니다.

이번 시퀀스는 다음 경계를 분리합니다.

- Google 사용자 정보 검증 / 내부 계정 연결
- OAuth 외부 인증 / 우리 API JWT
- OAuth `state` 임시 저장 / API session 인증
- 계정 복구 정책 / SMTP 구현
- 자동 정책 테스트 / 실제 외부 연결 검증
- raw reset token 전달 / hash 저장과 실제 비밀번호 변경

## 2. OAuth 사용자 식별

| 값 | 역할 |
|---|---|
| `provider` | 외부 제공자를 구분합니다. |
| `providerId` | 제공자 안의 고유 사용자 ID이며 Google `sub`를 사용합니다. |
| `email` | 내부 계정 충돌을 확인합니다. |
| `emailVerified` | `true`인 email만 내부 판단에 사용합니다. |

판단 순서:

1. profile의 필수 값, 길이, verified 여부를 검증하고 정규화합니다.
2. `provider + providerId`로 기존 OAuth 사용자를 찾습니다.
3. 기존 사용자는 DB의 내부 email을 유지합니다.
4. 기존 identity가 없고 같은 email 계정이 있으면 자동 연결하지 않습니다.
5. 충돌이 없을 때만 신규 사용자를 저장하고 DB unique 제약으로 저장 경쟁을 막습니다.

같은 email의 LOCAL 계정은 외부 인증 결과만으로 소유권과 연결 동의를 증명할 수 없으므로 `link_required`로 끝냅니다.

기존 OAuth 사용자의 provider email도 자동 갱신하지 않습니다. 내부 email은 현재 JWT subject와 게시글 작성자 식별값이므로 변경하려면 별도 소유 확인, 충돌 검사, 데이터 migration이 필요합니다.

## 3. OAuth 흐름

```mermaid
sequenceDiagram
    participant Browser
    participant Google
    participant Security
    participant Profile as CustomOAuthUserService
    participant Account as OAuthAccountService
    participant Handler as OAuthLoginSuccessHandler

    Browser->>Security: /oauth2/authorization/google
    Security->>Google: request + state
    Google-->>Security: callback + state
    Security->>Profile: load user
    Profile-->>Security: verified provider identity
    Security->>Account: connect internal user
    alt existing identity
        Account-->>Handler: internal user + JWT
    else same email exists
        Account-->>Handler: link_required
    else new identity
        Account-->>Handler: saved user + JWT
    end
    Handler-->>Browser: minimal public redirect
```

실패와 연결 필요 redirect에는 provider 원본 오류, 내부 예외, email, token을 넣지 않습니다.

## 4. STATELESS API와 임시 OAuth session

`SessionCreationPolicy.STATELESS`는 보호 API가 HTTP session Authentication을 사용하지 않는다는 뜻입니다. 신원은 매 요청의 Bearer JWT로 만듭니다.

OAuth 시작과 callback은 같은 흐름인지 `state`로 확인해야 하므로 OAuth client의 authorization-request 저장소가 짧은 session을 사용할 수 있습니다. 이 임시 session은 보호 API 권한이 아닙니다. OAuth 과정의 session만으로 `/auth/me`에 접근할 수 없어야 합니다.

## 5. fragment 소비와 브라우저 경계

성공 Handler는 우리 API JWT를 query가 아니라 fragment에 둡니다.

```text
/auth-practice/index.html?oauth=success#access_token=<jwt>
```

fragment는 서버 request target에 포함되지 않아 일반적인 access log와 referrer 전달 범위를 줄이지만 브라우저 JavaScript는 읽을 수 있습니다. 인증 실습 화면은 가장 먼저 `access_token`을 메모리로 옮기고 `history.replaceState`로 query와 fragment를 제거합니다. 그 JWT를 Bearer token으로 `/auth/me`에 보내고, 서버가 돌려준 내부 사용자 정보만 신원 근거로 사용합니다.

JWT는 local storage, session storage, cookie에 저장하지 않습니다. 다만 이 화면은 token 구조를 학습하는 실습이므로 명시적인 token receipt에 JWT가 보일 수 있습니다. URL을 지운 것과 화면·메모리에서 secret이 사라진 것은 같은 의미가 아닙니다.

복구 link도 같은 원칙으로 `#reset_token=<raw-token>`을 사용합니다. 화면은 raw token을 메모리로 소비하고 URL을 먼저 지운 다음 확정 요청에만 사용하며, DOM이나 HTTP 교환 기록에 값을 출력하지 않습니다.

운영에서는 일회용 code 교환 또는 HttpOnly cookie를 검토하고, cookie를 쓰면 CSRF 정책도 다시 설계합니다.

## 6. 계정 복구 공개 정책

형식이 유효한 `POST /account-recovery/password-reset`은 `Cache-Control: no-store`와 함께 다음 경우 모두 같은 202를 반환합니다.

- 계정이 없음
- LOCAL 계정이 있음
- OAuth 계정이 있음
- SMTP 발송이 실패함

요청 형식이 잘못됐거나 email이 254자를 넘으면 400입니다.

OAuth 계정에는 사용자가 입력한 로컬 비밀번호가 없으므로 `LOCAL` 계정에만 메일 발송 event를 만듭니다. 외부 응답은 계정 존재, provider 종류, SMTP 결과를 구분하지 않습니다. SMTP는 commit 이후 bounded executor에서 비동기로 실행되므로 HTTP 요청은 메일 서버 응답을 기다리지 않습니다.

```mermaid
flowchart LR
    A["AccountRecoveryController"] --> B["AccountRecoveryService"]
    B --> C["UserRepository"]
    B --> D["PasswordResetTokenRepository"]
    B --> E["AFTER_COMMIT event"]
    E --> F["bounded async executor"]
    F --> G["RecoveryMailSender"]
    G --> H["SmtpRecoveryMailSender"]
    H --> I["JavaMailSender"]
```

Service는 email 정규화, LOCAL 판단, token 회전과 event 발행을 담당합니다. dispatcher는 commit 이후 실행과 발송 실패 비노출을 담당하고, SMTP adapter는 발신자·수신자·제목·본문과 외부 호출만 담당합니다.

## 7. reset token 수명 주기

token 생성과 저장:

1. `SecureRandom`의 32-byte 난수를 Base64URL without padding 문자열로 만듭니다.
2. raw token은 email 없는 reset link의 fragment에만 넣습니다.
3. DB에는 raw token이 아니라 64자리 SHA-256 hex hash를 저장합니다.
4. LOCAL 사용자당 token 행은 하나이며 새 발급 시 같은 행을 회전합니다. 그러면 이전 raw token은 즉시 매칭되지 않습니다.
5. 기본 TTL은 15분입니다. `expiresAt > now`일 때만 유효하므로 정확히 만료 시각이면 실패합니다.

확정 endpoint는 다음 계약을 사용합니다.

```http
POST /account-recovery/password-reset/confirm
Content-Type: application/json

{"token":"<raw-token>","newPassword":"<8~64자>"}
```

유효하면 새 password를 BCrypt로 바꾸고 token의 `usedAt`을 같은 트랜잭션에서 기록한 뒤 `Cache-Control: no-store`와 204를 반환합니다. 만료·재사용·회전된 token 등 수명 주기 실패는 같은 400 `INVALID_PASSWORD_RESET_TOKEN`으로 처리합니다.

LOCAL 사용자별 기본 재요청 cooldown은 1분입니다. 활성 token을 발급한 뒤 1분 전까지는 새 token과 메일을 만들지 않으며 정확히 1분 경계에서는 다시 허용합니다.

## 8. 남아 있는 보안 범위

- 비밀번호 변경은 이미 발급된 JWT를 폐기하지 않습니다. token version, 사용자별 revoke 시각 또는 denylist가 필요합니다.
- 사용자별 cooldown은 IP·장치별 공격과 여러 instance를 아우르는 distributed rate limiter가 아닙니다.
- 학습 환경의 JPA `ddl-auto=update`는 Flyway 같은 versioned migration을 대신하지 않습니다.
- H2 기반 자동 테스트는 MySQL의 실제 lock·격리 동작을 완전히 증명하지 않습니다.
- 실제 Google consent/callback과 Gmail SMTP 인증·수신은 credential을 넣은 수동 E2E가 필요합니다.

reset token, 복구 대상 email, reset link, credential, SMTP 내부 오류는 로그나 공개 응답에 남기지 않습니다.

## 9. 검증 경계

자동 테스트:

- OAuth 필수 값과 verified email
- provider identity, email 충돌, 내부 email 안정성
- unique 저장 경쟁과 자체 JWT
- redirect의 fragment/no-store와 HTML 정적 진입점의 URL 제거 코드 연결
- 임시 OAuth session과 보호 API 경계
- LOCAL-only recovery, 같은 202, 1분 cooldown
- token 난수·hash·회전·만료 경계·단일 사용·BCrypt 변경
- AFTER_COMMIT·bounded async dispatch와 SMTP 실패 비노출
- sender 메시지와 최신 04 회귀

외부 수동 검증:

- 실제 Google consent와 callback URI
- 실제 SMTP 인증, TLS, 발신자 정책과 수신함 도착

자동 테스트는 외부 서버에 접속하지 않습니다. 단위 테스트 통과와 실제 provider 연결 성공을 서로 대신하지 않습니다.

## 10. 완료 후 설명할 수 있어야 하는 것

- providerId와 verified email의 역할 차이
- LOCAL 동일 email을 자동 연결하지 않는 이유
- 내부 email을 안정적으로 유지하는 이유
- OAuth state session과 STATELESS API의 차이
- fragment를 즉시 지워도 메모리·화면 노출 경계를 별도로 봐야 하는 이유
- 복구 요청이 같은 202를 반환하는 이유
- LOCAL-only recovery와 `RecoveryMailSender` 분리
- raw token과 DB hash를 분리하는 이유
- 만료·회전·단일 사용과 BCrypt 변경의 트랜잭션 경계
- AFTER_COMMIT 비동기 SMTP가 HTTP 결과와 분리되는 이유
- 기존 JWT 폐기와 distributed rate limit이 별도 과제인 이유

<details>
<summary>멘토용 설명 포인트</summary>

- email 동일성과 계정 소유권이 같은 개념인지 질문합니다.
- 외부 email 자동 변경이 JWT subject와 ownership에 미칠 영향을 묻습니다.
- STATELESS를 이유로 OAuth state 검증까지 제거하지 않게 합니다.
- SMTP 성공보다 202 비노출과 LOCAL-only 정책을 먼저 설명하게 합니다.
- URL 제거만으로 token 노출 위험이 모두 사라진다고 설명하지 않게 합니다.
- 실제 MySQL·Google·Gmail 검증과 자동 테스트의 증거 범위를 구분하게 합니다.

</details>
