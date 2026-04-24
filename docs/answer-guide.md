# Google OAuth2와 SMTP 계정 복구 정답 가이드

## 정답을 보기 전에 먼저 확인할 것

- `05-implementation`에서 직접 손으로 끝까지 작성했는지 먼저 확인합니다.
- 정답은 흐름 비교용으로 사용합니다.

## OAuth2 정답 포인트

### `CustomOAuthUserService`

- 기본 `DefaultOAuth2UserService` 호출
- `email`, `sub` 읽기
- `provider`, `providerId`, `email` 속성 재구성

### `OAuthAccountService`

- 기존 OAuth 사용자 찾기
- 기존 로컬 사용자 연결
- 신규 사용자 생성
- 마지막에 JWT 포함 응답 정리

### `OAuthLoginSuccessHandler`

- `OAuth2AuthenticationToken` 읽기
- `OAuthUserProfile` 만들기
- `OAuthAccountService` 호출
- `auth-demo.html` redirect URL 만들기

## SMTP 정답 포인트

### `AccountRecoveryService`

- email 기준 사용자 찾기
- reset 링크 만들기
- `RecoveryMailSender` 호출

### `SmtpRecoveryMailSender`

- `SimpleMailMessage` 생성
- 제목과 본문에 reset 링크 넣기
- `mailSender.send(...)` 호출

## 빠른 비교 포인트

- OAuth2는 외부 로그인 확장, SMTP는 계정 복구 메일 발송으로 역할이 나뉘는가
- reset 링크가 메일 본문에 들어가는가
- 현재 도메인 특성상 email 기반 비밀번호 재설정 요청으로 정리되는가
