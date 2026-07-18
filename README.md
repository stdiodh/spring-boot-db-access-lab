# 05 OAuth2와 SMTP 계정 복구

## 목표와 선수 조건

이번 시퀀스는 최신 `04-answer`의 signup, login, JWT, Security 401/403, 게시글 ownership 흐름 위에 Google OAuth2 로그인과 SMTP 계정 복구 요청을 연결합니다.

학습 목표:

- 검증된 email과 `provider + providerId`로 외부 사용자를 식별합니다.
- 같은 email의 LOCAL 계정을 자동 연결하지 않습니다.
- 기존 OAuth 사용자의 내부 email을 외부 변경값으로 자동 갱신하지 않습니다.
- OAuth 성공 뒤 우리 API용 JWT를 별도로 발급합니다.
- OAuth `state`용 임시 session과 STATELESS API 인증을 구분합니다.
- LOCAL 계정만 복구 메일을 보내고, 유효한 요청은 내부 결과와 무관하게 202를 반환합니다.
- `RecoveryMailSender`와 SMTP adapter의 책임을 나눕니다.
- reset link가 저장·만료·사용 검증이 없는 데모임을 설명합니다.

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
│   ├── security/CustomOAuthUserService.kt
│   ├── security/OAuthLoginHandlers.kt
│   └── service/OAuthAccountService.kt
├── recovery/
│   ├── controller/AccountRecoveryController.kt
│   ├── dto/PasswordResetMailRequest.kt
│   ├── mail/RecoveryMailSender.kt
│   ├── mail/SmtpRecoveryMailSender.kt
│   └── service/AccountRecoveryService.kt
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

1. `oauth/security/CustomOAuthUserService.kt`
2. `oauth/service/OAuthAccountService.kt`
3. `oauth/security/OAuthLoginHandlers.kt`
4. `recovery/service/AccountRecoveryService.kt`
5. `recovery/mail/SmtpRecoveryMailSender.kt`

Controller, DTO, repository와 최신 04 회귀 코드는 제공된 연결 계약입니다.

## 핵심 계약

### OAuth2

- `email_verified=true`인 email만 사용합니다.
- 기존 외부 사용자는 `provider + providerId`로 찾습니다.
- 같은 email의 LOCAL 또는 다른 외부 계정은 자동 연결하지 않고 `link_required`로 끝냅니다.
- 기존 OAuth 사용자는 DB에 저장된 내부 email로 JWT를 발급합니다. provider의 변경 email은 별도 계정 변경 절차 없이 반영하지 않습니다.
- 성공 Handler는 JWT를 query가 아닌 fragment의 `access_token`에 둡니다.
- 현재 인증 실습 화면은 fragment를 자동으로 읽거나 제거하거나 API 요청에 사용하지 않습니다. 주소에서 로컬 token을 수동으로 복사해 curl 또는 Postman으로 `/auth/me`를 확인한 뒤 URL을 직접 지웁니다.
- fragment는 브라우저에 노출되는 데모 경계입니다. 운영에서는 일회용 code 또는 HttpOnly cookie와 CSRF 정책을 별도로 설계합니다.

### Security session 경계

OAuth client는 authorization request와 callback의 `state`를 확인하려고 임시 session을 사용할 수 있습니다. 보호 API는 이 session을 로그인으로 사용하지 않으며 계속 `Authorization: Bearer <token>`을 요구합니다.

### 계정 복구

- 실제 endpoint는 `POST /account-recovery/password-reset`입니다.
- email을 검증·정규화하고 `LOCAL` 계정에만 메일을 보냅니다.
- 계정 없음, OAuth 계정, SMTP 실패도 유효한 요청이면 같은 202를 반환합니다.
- Service는 `RecoveryMailSender`에 의존하고 SMTP 메시지 조립은 adapter가 담당합니다.
- reset link에는 불투명 데모 token만 넣고 email은 넣지 않습니다.
- token 저장, 사용자 매핑, 만료, 일회성 사용, 실제 password 변경은 구현하지 않습니다.

## 브랜치와 검증

- `05-implementation`: TODO를 호출하는 테스트는 구현 전 실패하는 것이 정상입니다.
- `05-answer`: 외부 Google·SMTP 연결 없이 `./gradlew test` 전체가 통과해야 합니다.
- 자동 테스트는 내부 정책과 04 회귀를 확인합니다.
- 실제 Google callback과 SMTP 수신은 credential을 준비한 경우에만 별도 수동 검증합니다.

## 로컬 설정과 실행

```bash
cp .env.example .env
docker compose up -d
./gradlew bootRun
```

주요 환경변수:

- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- redirect/recovery: `APP_FRONTEND_URL`, `APP_PASSWORD_RESET_URL`, `APP_RECOVERY_MAIL_FROM`
- SMTP: `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `SPRING_MAIL_PROPERTIES_MAIL_SMTP_*`
- 기존 계약: `DB_*`, `JWT_*`

확인 위치:

- 인증 실습: `http://localhost:8080/auth-practice/`
- Swagger: `http://localhost:8080/swagger`
- OAuth 시작: `http://localhost:8080/oauth2/authorization/google`
- Google callback: `http://localhost:8080/login/oauth2/code/google`

## 문서

- [이론 정리](./docs/theory.md)
- [구현 가이드](./docs/implementation.md)
- [체크리스트](./docs/checklist.md)

표준 문서는 이 README와 위 세 파일만 사용합니다.

<details>
<summary>멘토용 진행 포인트</summary>

- 최신 04 회귀가 보존됐는지 먼저 확인합니다.
- provider identity, verified email, 자동 연결 금지 순서를 질문합니다.
- 임시 OAuth state session과 API session 인증을 구분하게 합니다.
- fragment 수동 관찰과 demo reset token을 운영 보안 완성으로 표현하지 않게 합니다.
- starter의 TODO 실패와 설정·컴파일 실패를 구분합니다.

</details>
