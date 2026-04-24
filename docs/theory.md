# Google OAuth2 로그인 이론 정리

> 자체 로그인 이후, 외부 인증이 우리 서비스 안으로 어떻게 들어오는지 감을 잡는 문서입니다.

> 이번 시퀀스 한 줄 요약  
> Google 로그인 성공 후 받은 사용자 정보를 우리 서비스 사용자와 연결하고, 다시 우리 서비스 기준 응답으로 정리하는 단계입니다.

## 먼저 이것만 기억해도 됩니다

- 이번 시퀀스의 메인 주제는 `Google OAuth2` 하나입니다.
- Google이 인증을 해주고, 우리 서비스는 사용자 연결과 후처리를 맡습니다.
- 외부 로그인도 결국 "우리 서비스 사용자로 정리하는 단계"가 있어야 합니다.

## 이 주제를 왜 배우는가

04 시퀀스에서는 우리 서비스가 직접 회원가입과 로그인을 처리했습니다.
그런데 실제 서비스에서는 Google 같은 외부 제공자를 통해 로그인하는 경우도 많습니다.

이때 중요한 것은 OAuth 용어를 많이 외우는 것이 아니라,
"외부에서 인증이 끝난 뒤 우리 서비스 안에서는 어떤 처리가 남는가"를 이해하는 것입니다.
그래서 이번 시퀀스에서는 Google 로그인 성공 후 사용자 정보를 읽고, 기존 사용자와 연결하거나 새 사용자를 만드는 가장 작은 확장 흐름만 다룹니다.

## 왜 이번에는 Email Verification을 같이 하지 않는가

이번 05 시퀀스에서는 메인 주제를 하나만 끝까지 연결하는 것이 더 중요합니다.
OAuth2와 Email Verification은 둘 다 인증 확장처럼 보이지만, 학생이 이해해야 할 흐름이 꽤 다릅니다.

그래서 이번에는 `Google OAuth2`만 다루고,
`SMTP`를 이용한 아이디 찾기 / 비밀번호 재설정 / 계정 복구는 이후 별도 트랙에서 다룹니다.
이렇게 나누면 지금은 외부 로그인 흐름에만 집중할 수 있습니다.

## 이번 실습 흐름을 먼저 한눈에 보기

1. 사용자가 `/oauth2/authorization/google`로 이동합니다.
2. Google이 로그인과 동의 과정을 처리합니다.
3. Spring Security가 Google 사용자 정보를 받아옵니다.
4. `CustomOAuthUserService`가 `email`, `sub` 같은 값을 읽어 우리 쪽에서 쓰기 쉬운 속성으로 정리합니다.
5. `OAuthLoginSuccessHandler`가 그 정보를 `OAuthAccountService`로 넘깁니다.
6. `OAuthAccountService`가 기존 사용자 연결 또는 신규 사용자 생성을 처리합니다.
7. 마지막에 JWT와 사용자 정보를 담아 `auth-demo.html`로 redirect 합니다.

짧게 말하면 이번 실습은  
**Google 로그인 -> 사용자 정보 읽기 -> 우리 서비스 사용자 연결 -> 성공 응답 정리** 흐름을 익히는 과정입니다.

## 오늘 꼭 잡아야 할 질문

- Google이 해주는 일과 우리 서비스가 해줘야 하는 일은 무엇이 다른가요?
- 외부 로그인 성공 후 왜 우리 DB 사용자를 다시 확인해야 하나요?
- 신규 사용자와 기존 사용자를 어떤 기준으로 나누나요?
- OAuth 로그인 결과를 왜 다시 JWT나 redirect 응답으로 정리하나요?

## 중요한 코드 먼저 보기

### 1. Google 사용자 정보를 읽는 코드

```kotlin
override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
    val oauthUser = delegate.loadUser(userRequest)
    val email = oauthUser.getAttribute<String>("email")
    val providerId = oauthUser.getAttribute<String>("sub")
    // Google 응답에서 우리에게 필요한 핵심 값만 다시 읽습니다.
}
```

### 2. 우리 서비스 사용자와 연결하는 코드

```kotlin
val existingOAuthUser = userRepository.findByAuthProviderAndProviderId(provider, profile.providerId)
if (existingOAuthUser != null) {
    return existingOAuthUser
}

val existingEmailUser = userRepository.findByEmail(profile.email)
if (existingEmailUser != null) {
    // 기존 로컬 사용자를 OAuth 사용자로 연결합니다.
}
```

### 3. 성공 후 프론트로 돌려보내는 코드

```kotlin
val redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl)
    .queryParam("oauth", "success")
    .queryParam("email", loginResponse.email)
    .queryParam("token", loginResponse.accessToken)
    .build()
    .toUriString()
```

## 핵심 용어를 쉬운 말로 정리하기

### OAuth2 로그인

- **뜻**  
  Google 같은 외부 제공자를 통해 로그인하는 흐름입니다.
- **왜 중요한가**  
  우리 서비스가 비밀번호를 직접 받지 않아도 사용자를 인증할 수 있습니다.
- **이번 코드에서는 어디에 보이는가**  
  `SecurityConfig.oauth2Login(...)`, `CustomOAuthUserService`

### Provider ID

- **뜻**  
  외부 제공자가 그 사용자를 식별하는 고유 값입니다.
- **왜 중요한가**  
  같은 Google 사용자라면 다시 로그인해도 같은 사람으로 연결할 수 있습니다.
- **이번 코드에서는 어디에 보이는가**  
  Google 응답의 `sub`, `profile.providerId`

### 사용자 연결

- **뜻**  
  외부 로그인 결과를 우리 서비스 사용자와 이어 붙이는 과정입니다.
- **왜 중요한가**  
  외부 인증이 끝나도 우리 서비스 안에서는 "이 사용자가 누구인가"가 다시 정리되어야 합니다.
- **이번 코드에서는 어디에 보이는가**  
  `OAuthAccountService.handleOAuthLogin(...)`

## 핵심 개념 설명

### 1. Google이 인증을 끝내도 우리 서비스 로직은 남아 있습니다

Google이 로그인 성공을 알려줘도, 우리 서비스는 그걸 그대로 끝내지 않습니다.
반드시 사용자 정보 읽기, 기존 사용자 확인, 신규 사용자 생성 같은 후처리가 이어집니다.

### 2. 외부 로그인도 결국 우리 서비스 사용자 개념으로 정리해야 합니다

서비스 안에서 게시글 작성, 내 정보 조회, JWT 발급 같은 기능은 우리 사용자 기준으로 움직입니다.
그래서 Google 사용자 정보를 그대로 쓰는 것이 아니라, `User`와 다시 연결하는 과정이 필요합니다.

### 3. OAuth 성공 후 응답을 우리 서비스 방식으로 다시 정리합니다

이번 실습에서는 `OAuthLoginSuccessHandler`가 마지막 정리 지점입니다.
Google 응답을 그대로 브라우저에 주는 것이 아니라, 우리 서비스가 필요한 email, provider, accessToken을 모아 redirect 파라미터로 전달합니다.

## 자주 헷갈리는 포인트

- OAuth2 로그인은 JWT를 대체하는 것이 아니라, 이번 실습에서는 JWT 발급 이전 단계에 붙는 확장 흐름입니다.
- Google이 인증을 해줘도 우리 서비스 사용자 저장/연결 로직은 따로 필요합니다.
- provider id와 email은 같은 역할이 아닙니다.
- 이번 시퀀스는 Email Verification이나 SMTP를 같이 다루지 않습니다.

## 직접 말해보기

- 자체 로그인과 Google 로그인의 차이는 무엇인가요?
- Google 로그인 성공 후 우리 서버가 다시 해야 하는 일은 무엇인가요?
- 기존 사용자와 신규 사용자를 어떤 기준으로 나누나요?
- OAuth 성공 후 왜 다시 JWT를 발급하나요?

## 복습 체크리스트

- [ ] 자체 로그인과 외부 로그인의 차이를 설명할 수 있습니다.
- [ ] Google 응답에서 어떤 값을 읽어야 하는지 말할 수 있습니다.
- [ ] provider + providerId와 email 기준 분기 이유를 설명할 수 있습니다.
- [ ] 외부 로그인 성공 후에도 우리 서비스 사용자 연결 단계가 필요하다는 점을 설명할 수 있습니다.
- [ ] 이번 시퀀스가 SMTP 기반 계정 복구와 왜 다른지 설명할 수 있습니다.

## 오늘 꼭 기억할 것

이번 시퀀스의 핵심은 OAuth 용어를 많이 외우는 것이 아닙니다.
대신 "Google이 인증하고, 우리 서비스는 사용자를 연결하고 응답을 정리한다"는 흐름을 잡는 것입니다.

## 다음 실습과 연결하기

다음 시퀀스에서는 지금 만든 OAuth 확장 흐름도
테스트와 검증 관점에서 어떻게 확인할지로 자연스럽게 이어질 수 있습니다.
