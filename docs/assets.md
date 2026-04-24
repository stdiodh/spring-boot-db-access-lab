# Google OAuth2와 SMTP 계정 복구 제공 자료 안내

## 미리 제공하는 것

- `04-answer` 기반 자체 로그인 + JWT
- Google OAuth2 client 설정 자리
- SMTP 설정 자리
- MySQL 실행 설정과 테스트용 H2 설정
- `AccountRecoveryController`, `PasswordResetMailRequest`

## 학생이 직접 구현하는 것

- Google 응답에서 사용자 정보 읽기
- 기존 사용자 / 신규 사용자 분기
- OAuth 성공 후 redirect 응답 정리
- reset 링크 생성
- SMTP 메일 발송 호출
