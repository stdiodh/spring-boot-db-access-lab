# Google OAuth2와 SMTP 계정 복구 구현 안내

## 이 도메인이 필요한 이유

인증 기능은 자체 로그인에서 끝나지 않습니다.
외부 로그인 확장도 붙고, 로그인 실패 이후를 위한 계정 복구 흐름도 필요합니다.
이번 실습은 `Google OAuth2`와 `SMTP 비밀번호 재설정 메일 요청`을 아주 작게 연결해 보는 단계입니다.

## 오늘 학생이 완성할 최종 흐름

1. Google 사용자 정보를 읽습니다.
2. 기존 사용자와 신규 사용자를 분기합니다.
3. OAuth 성공 후 JWT와 redirect 응답을 만듭니다.
4. email 기준 비밀번호 재설정 메일 요청을 받습니다.
5. reset 링크를 만들고 SMTP 발송 Service를 호출합니다.

## 학생이 직접 구현할 순서

1. provider 설정을 확인합니다.
2. 로그인 성공 후 사용자 정보를 읽습니다.
3. 신규/기존 사용자를 분기합니다.
4. 우리 서비스 사용자와 연결합니다.
5. 성공 응답을 만듭니다.
6. SMTP 설정을 확인합니다.
7. 비밀번호 재설정 메일 요청 흐름을 연결합니다.
8. reset 링크를 만들고 메일 발송을 연결합니다.

## TODO를 넣을 파일

- `src/main/kotlin/com/andi/rest_crud/security/CustomOAuthUserService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/OAuthLoginSuccessHandler.kt`
- `src/main/kotlin/com/andi/rest_crud/service/OAuthAccountService.kt`
- `src/main/kotlin/com/andi/rest_crud/service/AccountRecoveryService.kt`
- `src/main/kotlin/com/andi/rest_crud/service/SmtpRecoveryMailSender.kt`
