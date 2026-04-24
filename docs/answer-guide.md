# Google OAuth2와 SMTP 계정 복구 정답 가이드

## OAuth2 정답 포인트

- Google 응답에서 `email`, `sub`를 읽습니다.
- 기존 OAuth 사용자, 기존 로컬 사용자, 신규 사용자로 분기합니다.
- OAuth 성공 후 JWT와 redirect 파라미터를 정리합니다.

## SMTP 정답 포인트

- email 기준으로 사용자를 찾습니다.
- reset 링크를 만듭니다.
- `SimpleMailMessage`를 만들어 SMTP로 발송합니다.
