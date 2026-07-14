# Google OAuth2와 SMTP 계정 복구 구현 안내

## 이 도메인이 필요한 이유

인증 기능은 자체 로그인에서 끝나지 않습니다.
외부 로그인 확장도 붙고, 로그인 실패 이후를 위한 계정 복구 흐름도 필요합니다.
이번 실습은 `Google OAuth2`와 `SMTP 비밀번호 재설정 메일 요청`을 아주 작게 연결해 보는 단계입니다.

## 오늘 실습에서 완성할 최종 흐름

1. Google 사용자 정보와 email 검증 여부를 읽습니다.
2. 기존 OAuth 사용자, 계정 연결 필요, 신규 사용자를 분기합니다.
3. OAuth 성공 후 JWT fragment와 redirect 응답을 만듭니다.
4. email 기준 비밀번호 재설정 메일 요청을 받습니다.
5. reset 링크를 만들고 SMTP 발송 Service를 호출합니다.

## 이번 실습에서 같이 봐야 하는 실무 질문

1. 같은 email의 로컬 계정과 Google 계정이 만나면 왜 자동 연결하지 않고 명시적 확인을 요구할 것인가
2. 비밀번호 재설정 메일 요청은 왜 보안 기능처럼 다뤄야 하는가

## 실습자가 직접 구현할 순서

1. provider 설정을 확인합니다.
2. 로그인 성공 후 사용자 정보를 읽습니다.
3. 기존 OAuth 사용자, 계정 연결 필요, 신규 사용자를 분기합니다.
4. 우리 서비스 사용자를 식별하거나 충돌을 거부합니다.
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
- `OAuthAccountService.kt`: 외부 사용자를 식별하고 계정 충돌 정책을 적용하는 핵심 서비스
- `AccountRecoveryService.kt`: 비밀번호 재설정 메일 요청을 처리하는 서비스
- `SmtpRecoveryMailSender.kt`: SMTP 메일 발송을 실제로 맡는 구현체

## 단계별 구현 안내

### Step 1. provider 설정 확인

- `application.yaml`의 Google OAuth 설정을 확인합니다.

### Step 2. 로그인 성공 후 사용자 정보 읽기

- `CustomOAuthUserService.kt`에서 `email`, `email_verified`, `sub`를 읽습니다.
- 검증되지 않은 email은 내부 사용자 식별에 사용하지 않습니다.

### Step 3. 신규/기존 사용자 분기

- `OAuthAccountService.kt`에서 `provider + providerId`로 외부 사용자를 식별하고 `email` 충돌을 확인합니다.
- 이 단계가 바로 계정 연결 정책입니다.

문제 코드는 보통 이런 모양입니다.

```kotlin
val newUser = userRepository.save(
    User(
        email = profile.email,
        password = passwordEncoder.encode(UUID.randomUUID().toString()),
        authProvider = provider,
        providerId = profile.providerId
    )
)
```

이렇게 하면 같은 사용자가 로컬 계정과 OAuth 계정을 따로 가지게 될 수 있습니다.

이번 구현에서는 아래 순서가 보이도록 작성합니다.

1. `provider + providerId`가 이미 있는지 확인
2. 없으면 `email` 기준 기존 로컬 사용자 충돌 확인
3. 같은 email 계정이 있으면 자동 연결하지 않고 연결 필요 오류 반환
4. 충돌이 없을 때만 신규 생성

### Step 4. 우리 서비스 사용자 식별과 충돌 처리

- 기존 OAuth 사용자면 그대로 사용합니다.
- 기존 로컬 사용자와 email이 같으면 자동 연결하지 않고 명시적 계정 연결이 필요하다고 응답합니다.
- 기존 계정 충돌이 없으면 새 사용자를 생성합니다.

이 단계에서 실습자가 말로 설명할 수 있어야 하는 문장:

- "외부 로그인은 성공했지만, 우리 서비스는 검증된 email과 providerId로 사용자를 다시 식별해야 한다."
- "같은 email만으로 기존 로컬 계정을 자동 연결하지 않는다."

### Step 5. 성공 응답 만들기

- `OAuthLoginSuccessHandler.kt`에서 성공 시 JWT를 URL fragment의 `access_token`에 담습니다.
- 명시적 계정 연결이 필요하면 JWT 없이 query의 `oauth=link_required`로 redirect합니다.

### Step 6. SMTP 설정 확인

- `application.yaml`의 `spring.mail.*` 설정을 확인합니다.

### Step 7. 비밀번호 재설정 메일 요청 흐름 연결

- `AccountRecoveryService.kt`에서 email 기준으로 사용자를 찾습니다.
- 이번 시퀀스에서는 실제 비밀번호 변경까지는 확장하지 않습니다.

여기서 중요한 보안 포인트가 하나 있습니다.

문제 코드:

```kotlin
val user = userRepository.findByEmail(email)
    .orElseThrow { IllegalArgumentException("존재하지 않는 사용자입니다.") }
```

이 코드는 개발할 때는 편하지만,
운영에서는 존재하지 않는 email 여부를 외부에 알려줄 수 있습니다.

이번 시퀀스에서는 아래처럼 조용히 종료하는 쪽이 더 안전하다는 점을 이해합니다.

```kotlin
val user = userRepository.findByEmail(email).orElse(null) ?: return
```

### Step 8. reset 링크와 SMTP 메일 발송 연결

- reset 링크를 만들고 `SmtpRecoveryMailSender`로 메일을 발송합니다.
- 이때 메일 전송 자체보다 `resetLink` 안의 `token`을 민감한 값으로 보는 시각이 중요합니다.

```kotlin
return UriComponentsBuilder.fromUriString(passwordResetUrl)
    .queryParam("recovery", "password-reset")
    .queryParam("email", email)
    .queryParam("token", resetToken)
    .build()
    .toUriString()
```

## 실습자 체크리스트

- [ ] Google 응답에서 어떤 값을 읽는지 설명할 수 있습니다.
- [ ] 검증된 email만 사용하는 이유를 설명할 수 있습니다.
- [ ] 기존 OAuth 사용자, 계정 연결 필요, 신규 사용자를 어떤 기준으로 나누는지 설명할 수 있습니다.
- [ ] 같은 email의 로컬 계정을 자동 연결하지 않는 이유를 설명할 수 있습니다.
- [ ] JWT를 redirect URL의 query가 아닌 fragment로 전달하는 이유를 설명할 수 있습니다.
- [ ] 비밀번호 재설정 메일 요청에서 왜 reset 링크를 만드는지 설명할 수 있습니다.
- [ ] 존재하지 않는 email 요청을 조용히 종료하는 이유를 설명할 수 있습니다.
- [ ] reset 링크의 token이 왜 민감한지 설명할 수 있습니다.
- [ ] SMTP 설정이 어디에 들어가는지 설명할 수 있습니다.
- [ ] 이번 시퀀스가 실제 비밀번호 변경 완료까지는 다루지 않는다는 점을 설명할 수 있습니다.

## 리뷰어 / PPT 체크리스트

- [ ] OAuth2 흐름과 SMTP 흐름을 한 장에서 나란히 보여줄 수 있는가
- [ ] Google 로그인 성공 후 사용자 연결 과정을 코드로 설명할 수 있는가
- [ ] 동일 email의 로컬 계정과 Google 계정 충돌 시나리오를 설명할 수 있는가
- [ ] reset 링크 생성과 메일 발송 지점을 시연할 수 있는가
- [ ] 존재하지 않는 email 요청을 왜 조용히 처리하는지 설명할 수 있는가
- [ ] 현재 도메인에서 email이 로그인 아이디라는 점을 먼저 설명할 수 있는가
- [ ] 범위를 넘어서 실제 비밀번호 변경까지 가지 않는다는 점을 분명히 말할 수 있는가
