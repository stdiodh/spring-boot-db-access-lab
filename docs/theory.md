# Google OAuth2와 SMTP 계정 복구 이론 정리

> 외부 로그인과 메일 기반 계정 복구가 서비스 안으로 들어올 때, 어떤 운영 정책과 보안 감각이 같이 필요한지 이해하는 문서입니다.

> 이번 시퀀스 한 줄 요약  
> Google 로그인 성공 후 사용자를 연결하고, 비밀번호 재설정 메일 요청을 보내면서 인증 확장의 실무 포인트를 함께 익히는 단계입니다.

## 먼저 이것만 기억해도 됩니다

- Google OAuth2는 외부 로그인 확장입니다.
- SMTP는 계정 복구 메일 발송에 자주 쓰입니다.
- 둘 다 결국 "외부에서 들어온 사용자/요청을 우리 서비스 정책 안에서 어떻게 다룰 것인가"로 이어집니다.

## 이 주제를 왜 배우는가

04 시퀀스에서는 우리 서비스가 직접 회원가입과 로그인을 처리했습니다.
하지만 실제 서비스는 여기서 끝나지 않습니다.

- Google 같은 외부 로그인
- 비밀번호 재설정 메일 같은 계정 복구

가 같이 붙습니다.

이번 시퀀스는 기술 두 개를 억지로 많이 구현하는 단계가 아니라,
"인증이 확장되면 운영 정책과 보안 고려도 같이 따라온다"는 감각을 잡는 단계입니다.

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

이 코드는 동작은 하지만,

- 기존 Google 사용자 재로그인
- 기존 로컬 계정과의 연결
- 진짜 신규 사용자 생성

을 구분하지 못합니다.

### 왜 운영상 문제가 되는가

- 동일 사용자가 여러 계정을 가지게 될 수 있습니다.
- 같은 email인데 사용자 레코드가 갈라질 수 있습니다.
- 나중에 권한, 활동 이력, 결제 연결이 꼬일 수 있습니다.

즉 외부 로그인은 "로그인 성공"만으로 끝나는 문제가 아니라,
`우리 서비스 사용자와 어떻게 연결할 것인가`가 핵심입니다.

### 해결 방향 코드

현재 정답 코드는 아래 순서로 분기합니다.

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

### 이 코드에서 꼭 봐야 할 값

```kotlin
val email = oauthUser.getAttribute<String>("email")
val providerId = oauthUser.getAttribute<String>("sub")
```

- `email`: 우리 서비스 사용자와 연결할 때 참고하는 값
- `providerId`: 외부 제공자가 이 사용자를 식별하는 고유 값

즉 `email`만으로도 부족하고 `providerId`만으로도 부족합니다.
둘을 함께 봐야 계정 연결 정책을 설명할 수 있습니다.

## 실무 확장 개념 2. 계정 복구 보안 관점

### 문제 상황

비밀번호 재설정 메일 요청은 단순한 편의 기능처럼 보여도,
잘못 만들면 공격자에게 계정 정보를 알려주는 입구가 될 수 있습니다.

### 문제 코드

```kotlin
fun requestPasswordReset(email: String) {
    val user = userRepository.findByEmail(email)
        .orElseThrow { IllegalArgumentException("존재하지 않는 사용자입니다.") }

    val resetLink = createResetLink(user.email)
    recoveryMailSender.sendPasswordResetMail(user.email, resetLink)
}
```

이 코드는 개발 중에는 친절해 보입니다.
하지만 실제 서비스에서는 "이 email이 가입돼 있는지"를 외부에 알려줄 수 있습니다.

### 왜 위험한가

- 공격자가 email 목록을 넣어 보며 가입 여부를 추측할 수 있습니다.
- 존재 여부가 곧 사용자 정보 노출이 될 수 있습니다.
- 계정 복구 기능이 공격 표면으로 바뀔 수 있습니다.

### 해결 방향 코드

정답 코드는 존재하지 않는 사용자를 조용히 무시합니다.

```kotlin
fun requestPasswordReset(email: String) {
    val user = userRepository.findByEmail(email).orElse(null) ?: return
    val resetLink = createResetLink(user.email)
    recoveryMailSender.sendPasswordResetMail(user.email, resetLink)
}
```

이 방식이면 외부에서 볼 때는 같은 흐름으로 보이기 때문에,
계정 존재 여부 노출을 줄일 수 있습니다.

### reset 링크는 왜 민감한가

현재 코드는 아래처럼 reset 링크를 만듭니다.

```kotlin
return UriComponentsBuilder.fromUriString(passwordResetUrl)
    .queryParam("recovery", "password-reset")
    .queryParam("email", email)
    .queryParam("token", resetToken)
    .build()
    .toUriString()
```

여기서 중요한 건 SMTP 자체보다 `token`입니다.

- 이 값은 나중에 비밀번호 변경을 허용하는 근거가 될 수 있습니다.
- 그래서 로그, 예외 메시지, 화면, 공유 링크에 함부로 노출하면 안 됩니다.

이번 시퀀스는 토큰 저장소와 만료 정책까지는 가지 않지만,
"링크 안의 token은 민감한 값"이라는 점은 반드시 이해해야 합니다.

## 자주 헷갈리는 포인트

- OAuth2와 SMTP는 같은 기술이 아닙니다.
- OAuth2는 외부 로그인, SMTP는 메일 발송입니다.
- 이번 레포에서는 로그인 아이디가 email이므로 `아이디 찾기`보다 비밀번호 재설정이 더 자연스럽습니다.
- `OAuth 로그인 성공 = 신규 사용자 생성`이 아닙니다.
- 비밀번호 재설정 메일 요청은 편의 기능이면서 동시에 보안 기능입니다.

## 직접 말해보기

- 같은 email의 로컬 계정과 Google 계정이 만나면 왜 정책이 필요한가요?
- provider id와 email은 왜 둘 다 필요한가요?
- 존재하지 않는 email 요청에 대해 왜 조용히 종료하는가요?
- reset 링크 안의 token은 왜 민감한가요?

## 복습 체크리스트

- [ ] 기존 OAuth 사용자 / 기존 로컬 사용자 / 신규 사용자를 나누는 이유를 설명할 수 있습니다.
- [ ] 같은 email의 로컬 계정과 OAuth 계정이 만나면 왜 단순 신규 생성이 위험한지 설명할 수 있습니다.
- [ ] 존재하지 않는 email 요청을 조용히 종료하는 이유를 설명할 수 있습니다.
- [ ] reset 링크 안의 token이 민감한 값이라는 점을 설명할 수 있습니다.
- [ ] 이번 시퀀스가 실제 비밀번호 변경 완료까지는 다루지 않는다는 점을 설명할 수 있습니다.

## 오늘 꼭 기억할 것

이번 시퀀스의 핵심은 기술 두 개를 많이 붙이는 것이 아닙니다.
대신 "외부 로그인과 메일 기반 계정 복구가 서비스 안으로 들어오면, 운영 정책과 보안 고려도 같이 따라온다"는 점을 이해하는 것입니다.
