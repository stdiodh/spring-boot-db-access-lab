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

## 파일별 역할 설명

- `CustomOAuthUserService.kt`: Google 응답에서 필요한 속성을 읽는 곳
- `OAuthLoginSuccessHandler.kt`: OAuth 성공 후 redirect 응답을 만드는 곳
- `OAuthAccountService.kt`: 기존 사용자와 신규 사용자를 연결하는 핵심 서비스
- `AccountRecoveryService.kt`: 비밀번호 재설정 메일 요청을 처리하는 서비스
- `SmtpRecoveryMailSender.kt`: SMTP 메일 발송을 실제로 맡는 구현체

## 단계별 구현 안내

### Step 1. provider 설정 확인

- `application.yaml`의 Google OAuth 설정을 확인합니다.

### Step 2. 로그인 성공 후 사용자 정보 읽기

- `CustomOAuthUserService.kt`에서 `email`, `sub`를 읽습니다.

### Step 3. 신규/기존 사용자 분기

- `OAuthAccountService.kt`에서 `provider + providerId`, `email` 기준으로 분기합니다.

### Step 4. 우리 서비스 사용자와 연결

- 기존 OAuth 사용자면 그대로 사용합니다.
- 기존 로컬 사용자면 OAuth 정보를 연결합니다.
- 둘 다 없으면 새 사용자를 생성합니다.

### Step 5. 성공 응답 만들기

- `OAuthLoginSuccessHandler.kt`에서 redirect 파라미터를 완성합니다.

### Step 6. SMTP 설정 확인

- `application.yaml`의 `spring.mail.*` 설정을 확인합니다.

### Step 7. 비밀번호 재설정 메일 요청 흐름 연결

- `AccountRecoveryService.kt`에서 email 기준으로 사용자를 찾습니다.
- 이번 시퀀스에서는 실제 비밀번호 변경까지는 확장하지 않습니다.

### Step 8. reset 링크와 SMTP 메일 발송 연결

- reset 링크를 만들고 `SmtpRecoveryMailSender`로 메일을 발송합니다.

## 학생 체크리스트

- [ ] Google 응답에서 어떤 값을 읽는지 설명할 수 있습니다.
- [ ] 기존 사용자와 신규 사용자를 어떤 기준으로 나누는지 설명할 수 있습니다.
- [ ] 비밀번호 재설정 메일 요청에서 왜 reset 링크를 만드는지 설명할 수 있습니다.
- [ ] SMTP 설정이 어디에 들어가는지 설명할 수 있습니다.
- [ ] 이번 시퀀스가 실제 비밀번호 변경 완료까지는 다루지 않는다는 점을 설명할 수 있습니다.

## 강사 / PPT 체크리스트

- [ ] OAuth2 흐름과 SMTP 흐름을 한 장에서 나란히 보여줄 수 있는가
- [ ] Google 로그인 성공 후 사용자 연결 과정을 코드로 설명할 수 있는가
- [ ] reset 링크 생성과 메일 발송 지점을 시연할 수 있는가
- [ ] 현재 도메인에서 email이 로그인 아이디라는 점을 먼저 설명할 수 있는가
- [ ] 범위를 넘어서 실제 비밀번호 변경까지 가지 않는다는 점을 분명히 말할 수 있는가
