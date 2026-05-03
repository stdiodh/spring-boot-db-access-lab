# Google OAuth2와 SMTP 계정 복구 이론 정리

외부 로그인과 메일 기반 계정 복구가 서비스 안으로 들어올 때, 어떤 운영 정책과 보안 감각이 같이 필요한지 이해하는 문서입니다.

이번 시퀀스 한 줄 요약  
Google 로그인 성공 후 사용자를 연결하고, 비밀번호 재설정 메일 요청을 보내면서 인증 확장의 기초 흐름과 실무 포인트를 함께 익히는 단계입니다.

## 먼저 이것만 기억해도 됩니다

- Google OAuth2는 외부 로그인 확장입니다.
- SMTP는 계정 복구 메일 발송에 자주 쓰입니다.
- Google이 인증을 대신 해줘도, 우리 서비스는 이후 요청을 위해 자체 JWT를 다시 발급합니다.
- 이번 시퀀스의 핵심은 결국 "외부에서 들어온 사용자/요청을 우리 서비스 정책 안에서 어떻게 다룰 것인가"입니다.

## 이 주제를 왜 배우는가

04 시퀀스에서는 우리 서비스가 직접 회원가입과 로그인을 처리했습니다.
하지만 실제 서비스는 여기서 끝나지 않습니다.

- Google 같은 외부 로그인
- 비밀번호 재설정 메일 같은 계정 복구

가 같이 붙습니다.

이번 시퀀스는 기술 두 개를 억지로 많이 구현하는 단계가 아니라,
"인증이 확장되면 운영 정책과 보안 고려도 같이 따라온다"는 감각을 잡는 단계입니다.

## 기초 개념 먼저 잡기

### OAuth2 로그인

- 무엇인가요  
  외부 제공자가 인증을 대신 처리해주는 로그인 흐름입니다.
- 왜 필요한가요  
  사용자는 새 비밀번호를 또 만들지 않고도 Google 같은 계정으로 빠르게 로그인할 수 있습니다.
- 이번 코드에서는 어디에 보이나요  
  `CustomOAuthUserService.kt`, `OAuthLoginSuccessHandler.kt`, `OAuthAccountService.kt`

### provider 와 providerId

- 무엇인가요  
  `provider`는 어떤 외부 로그인 제공자인지, `providerId`는 그 제공자 안에서 사용자를 식별하는 값입니다.
- 왜 필요한가요  
  외부 로그인 성공만으로는 충분하지 않고, 우리 서비스 사용자를 어떤 기준으로 연결할지 판단해야 하기 때문입니다.
- 이번 코드에서는 어디에 보이나요  
  `oauthUser.getAttribute<String>("sub")`, `User.authProvider`, `User.providerId`

### SMTP

- 무엇인가요  
  메일을 보내기 위한 전송 프로토콜입니다.
- 왜 필요한가요  
  사용자가 비밀번호를 잊었을 때, reset 링크를 메일로 전달하는 가장 기본적인 수단이기 때문입니다.
- 이번 코드에서는 어디에 보이나요  
  `SmtpRecoveryMailSender.kt`, `spring.mail.*` 설정

### password reset link

- 무엇인가요  
  사용자가 메일을 통해 비밀번호 재설정 흐름으로 들어갈 수 있게 하는 링크입니다.
- 왜 필요한가요  
  단순히 "메일을 보냈다"보다, 사용자를 어디로 보내고 어떤 값으로 검증할지를 같이 설계해야 하기 때문입니다.
- 이번 코드에서는 어디에 보이나요  
  `AccountRecoveryService.createResetLink(...)`

### JWT와의 연결

- 무엇인가요  
  외부 로그인 성공 후에도, 우리 서비스는 다음 요청을 구분하기 위해 자체 토큰을 다시 발급합니다.
- 왜 필요한가요  
  Google이 인증을 대신 해줘도, 이후 `/auth/me` 같은 우리 API를 구분하는 기준은 결국 우리 서비스 안에 있어야 하기 때문입니다.
- 이번 코드에서는 어디에 보이나요  
  `OAuthAccountService.createSuccessResponse(...)`, `JwtTokenProvider.createToken(...)`

## 왜 이번 SMTP 파트는 비밀번호 재설정 메일 요청으로 가는가

현재 이 레포의 로그인 아이디는 `email`입니다.
즉 별도의 username을 찾는 `아이디 찾기` 흐름보다,
`비밀번호 재설정 메일 요청`이 현재 도메인과 더 자연스럽게 맞습니다.

그래서 이번 SMTP 파트는
`email 입력 -> reset 링크 생성 -> SMTP 메일 발송`
흐름만 대표로 다룹니다.

## 이번 실습 흐름을 먼저 한눈에 보기

### OAuth2 흐름

1. 사용자가 Google 로그인 버튼을 누릅니다.
2. Google이 인증을 처리합니다.
3. 우리 서버가 Google 사용자 정보를 읽습니다.
4. 기존 사용자와 신규 사용자를 분기합니다.
5. JWT와 사용자 정보를 담아 프론트로 redirect 합니다.

### SMTP 흐름

1. 사용자가 비밀번호 재설정 메일 요청을 보냅니다.
2. 서버가 email 기준으로 사용자를 확인합니다.
3. reset 링크를 만듭니다.
4. SMTP로 메일을 발송합니다.

## 현재 코드 흐름에서 어디를 보면 되는가

이번 시퀀스는 기술 이름만 이해하면 충분하지 않습니다.
현재 레포에서 어떤 파일이 어떤 역할을 하는지 같이 봐야 합니다.

1. `CustomOAuthUserService.kt`
   Google 응답에서 `email`, `sub`를 읽는 시작점입니다.
2. `OAuthLoginSuccessHandler.kt`
   외부 로그인 성공 후 우리 서비스 흐름으로 다시 연결하는 지점입니다.
3. `OAuthAccountService.kt`
   기존 사용자 연결 / 신규 사용자 생성 정책이 모이는 핵심 서비스입니다.
4. `AccountRecoveryService.kt`
   비밀번호 재설정 메일 요청을 받고 reset 링크를 만드는 서비스입니다.
5. `SmtpRecoveryMailSender.kt`
   실제 SMTP 발송을 맡는 구현체입니다.

짧게 말하면 이번 시퀀스는

- `외부 로그인 성공 -> 우리 사용자 연결 -> 우리 JWT 발급`
- `비밀번호 재설정 요청 -> reset 링크 생성 -> SMTP 메일 발송`

두 줄기의 흐름을 함께 보는 단계입니다.

## 중요한 코드 먼저 보기

### 1. Google 사용자 정보를 읽는 코드

```kotlin
val email = oauthUser.getAttribute<String>("email")
val providerId = oauthUser.getAttribute<String>("sub")
// Google 응답에서 우리 서비스가 다시 써야 하는 핵심 값입니다.
```

### 2. 외부 로그인 사용자를 우리 사용자와 연결하는 코드

```kotlin
val existingOAuthUser = userRepository.findByAuthProviderAndProviderId(provider, profile.providerId)
val existingEmailUser = userRepository.findByEmail(profile.email)
// 외부 로그인도 결국 우리 DB 사용자와 연결해야 합니다.
```

### 3. 외부 로그인 이후 우리 JWT를 발급하는 코드

```kotlin
return OAuthLoginResponse(
    email = email,
    accessToken = jwtTokenProvider.createToken(email),
    provider = requireNotNull(user.authProvider),
    isNewUser = isNewUser
)
```

### 4. 비밀번호 재설정 링크를 만드는 코드

```kotlin
return UriComponentsBuilder.fromUriString(passwordResetUrl)
    .queryParam("recovery", "password-reset")
    .queryParam("email", email)
    .queryParam("token", resetToken)
    .build()
    .toUriString()
```

## 실무 확장 개념 1. 계정 연결 정책

### 문제 상황

사용자가 이미 우리 서비스에 `email/password`로 가입해 둔 상태인데,
같은 email로 Google 로그인을 시도할 수 있습니다.

이때 정책 없이 "OAuth 로그인 성공 = 신규 사용자 생성"으로 가면,
같은 사람에게 계정이 두 개 생길 수 있습니다.

### 문제 코드

```kotlin
fun handleOAuthLogin(profile: OAuthUserProfile): OAuthLoginResponse {
    val newUser = userRepository.save(
        User(
            email = profile.email,
            password = passwordEncoder.encode(UUID.randomUUID().toString()),
            authProvider = profile.provider,
            providerId = profile.providerId
        )
    )

    return createSuccessResponse(newUser, true)
}
```

### 왜 운영상 문제가 되는가

- 동일 사용자가 여러 계정을 가지게 될 수 있습니다.
- 같은 email인데 사용자 레코드가 갈라질 수 있습니다.
- 나중에 권한, 활동 이력, 결제 연결이 꼬일 수 있습니다.

### 해결 방향 코드

```kotlin
val existingOAuthUser = userRepository.findByAuthProviderAndProviderId(provider, profile.providerId)
    .orElse(null)

if (existingOAuthUser != null) {
    existingOAuthUser.email = profile.email
    return OAuthLinkResult(userRepository.save(existingOAuthUser), false)
}

val existingEmailUser = userRepository.findByEmail(profile.email)
    .orElse(null)

if (existingEmailUser != null) {
    existingEmailUser.authProvider = provider
    existingEmailUser.providerId = profile.providerId
    return OAuthLinkResult(userRepository.save(existingEmailUser), false)
}
```

이 흐름이면

1. 이미 같은 `provider + providerId` 사용자가 있으면 재사용하고
2. 같은 email의 로컬 사용자가 있으면 OAuth 계정으로 연결하고
3. 둘 다 없을 때만 신규 생성

이라는 정책이 코드로 드러납니다.

## 실무 확장 개념 2. 계정 복구 보안 관점

### 문제 코드

```kotlin
fun requestPasswordReset(email: String) {
    val user = userRepository.findByEmail(email)
        .orElseThrow { IllegalArgumentException("존재하지 않는 사용자입니다.") }

    val resetLink = createResetLink(user.email)
    recoveryMailSender.sendPasswordResetMail(user.email, resetLink)
}
```

이 코드는 개발 중에는 편하지만,
실무에서는 "이 email이 가입돼 있는지"를 외부에 알려줄 수 있습니다.

### 해결 방향 코드

```kotlin
fun requestPasswordReset(email: String) {
    val user = userRepository.findByEmail(email).orElse(null) ?: return
    val resetLink = createResetLink(user.email)
    recoveryMailSender.sendPasswordResetMail(user.email, resetLink)
}
```

이 방식이면 계정 존재 여부 노출을 줄일 수 있습니다.

### reset 링크는 왜 민감한가

```kotlin
return UriComponentsBuilder.fromUriString(passwordResetUrl)
    .queryParam("recovery", "password-reset")
    .queryParam("email", email)
    .queryParam("token", resetToken)
    .build()
    .toUriString()
```

SMTP 자체보다 `token`이 민감한 값입니다.
이 값은 나중에 비밀번호 변경을 허용하는 근거가 될 수 있기 때문입니다.

## 자주 헷갈리는 포인트

- OAuth2와 SMTP는 같은 기술이 아닙니다.
- OAuth2는 외부 로그인, SMTP는 메일 발송입니다.
- `OAuth 로그인 성공 = 신규 사용자 생성`이 아닙니다.
- 비밀번호 재설정 메일 요청은 편의 기능이면서 동시에 보안 기능입니다.
- Google이 인증을 대신 해줘도, 우리 서비스는 이후 요청을 위해 자체 JWT를 다시 발급합니다.

## 복습 체크리스트

- [ ] OAuth2, providerId, SMTP, password reset link가 각각 무엇인지 설명할 수 있습니다.
- [ ] 기존 OAuth 사용자 / 기존 로컬 사용자 / 신규 사용자를 나누는 이유를 설명할 수 있습니다.
- [ ] 같은 email의 로컬 계정과 OAuth 계정이 만나면 왜 단순 신규 생성이 위험한지 설명할 수 있습니다.
- [ ] 존재하지 않는 email 요청을 조용히 종료하는 이유를 설명할 수 있습니다.
- [ ] reset 링크 안의 token이 민감한 값이라는 점을 설명할 수 있습니다.
- [ ] Google 로그인 이후에도 왜 우리 서비스 JWT가 다시 필요한지 설명할 수 있습니다.
- [ ] 이번 시퀀스가 실제 비밀번호 변경 완료까지는 다루지 않는다는 점을 설명할 수 있습니다.
