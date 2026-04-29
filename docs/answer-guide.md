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

이 서비스는 단순 로그인 성공 처리기가 아니라,
`계정 연결 정책`이 들어 있는 코드입니다.

```kotlin
val existingOAuthUser = userRepository.findByAuthProviderAndProviderId(provider, profile.providerId)
    .orElse(null)

val existingEmailUser = userRepository.findByEmail(profile.email)
    .orElse(null)
```

정답 코드가 의도하는 정책은 이렇습니다.

1. 이미 같은 `provider + providerId` 조합이 있으면 그 사용자를 재사용
2. 같은 email의 기존 로컬 사용자가 있으면 OAuth 계정으로 연결
3. 둘 다 없을 때만 신규 생성

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

여기서는 보안 관점이 같이 들어갑니다.

```kotlin
val user = userRepository.findByEmail(email).orElse(null) ?: return
```

존재하지 않는 email에 대해 조용히 종료하는 이유는,
외부에 계정 존재 여부를 쉽게 노출하지 않기 위해서입니다.

### `SmtpRecoveryMailSender`

- `SimpleMailMessage` 생성
- 제목과 본문에 reset 링크 넣기
- `mailSender.send(...)` 호출

## 빠른 비교 포인트

- OAuth2는 외부 로그인 확장, SMTP는 계정 복구 메일 발송으로 역할이 나뉘는가
- OAuthAccountService가 계정 연결 정책을 코드로 보여주는가
- 존재하지 않는 email 요청을 조용히 종료하는가
- reset 링크가 메일 본문에 들어가는가
- 현재 도메인 특성상 email 기반 비밀번호 재설정 요청으로 정리되는가
