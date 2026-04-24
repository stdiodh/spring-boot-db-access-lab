# Google OAuth2 로그인 정답 가이드

## 정답을 보기 전에 먼저 확인할 것

- `05-implementation`에서 직접 손으로 끝까지 작성했는지 먼저 확인합니다.
- 정답은 복붙용이 아니라 흐름 비교용으로 사용합니다.
- 이번 시퀀스의 핵심은 "Google 로그인 성공 후 우리 서비스 사용자를 어떻게 연결하는가"입니다.

## Step 1. `CustomOAuthUserService` 정답 포인트

핵심은 아래 세 단계입니다.

1. 기본 `DefaultOAuth2UserService`로 사용자 정보를 읽기
2. Google 응답에서 `email`, `sub` 꺼내기
3. 우리 쪽에서 쓰기 쉬운 속성으로 다시 담기

```kotlin
override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
    val oauthUser = delegate.loadUser(userRequest)
    val provider = userRequest.clientRegistration.registrationId.uppercase()
    val email = oauthUser.getAttribute<String>("email")
        ?: throw IllegalStateException("OAuth 응답에서 email을 찾을 수 없습니다.")
    val providerId = oauthUser.getAttribute<String>("sub")
        ?: throw IllegalStateException("OAuth 응답에서 provider id를 찾을 수 없습니다.")

    val attributes = oauthUser.attributes.toMutableMap().apply {
        put("provider", provider)
        put("providerId", providerId)
        put("email", email)
    }

    return DefaultOAuth2User(oauthUser.authorities, attributes, "email")
}
```

## Step 2. `OAuthAccountService` 정답 포인트

핵심 분기는 아래 순서입니다.

1. `provider + providerId` 기준으로 기존 OAuth 사용자 찾기
2. 없으면 `email` 기준 기존 로컬 사용자 찾기
3. 둘 다 없으면 새 사용자 만들기

```kotlin
fun handleOAuthLogin(profile: OAuthUserProfile): OAuthLoginResponse {
    val linkResult = linkOrCreateUser(profile)
    return createSuccessResponse(linkResult.user, linkResult.isNewUser)
}
```

세부 포인트:
- 기존 OAuth 사용자가 있으면 email을 최신 값으로 맞추고 저장할 수 있습니다.
- 기존 로컬 사용자가 있으면 `authProvider`, `providerId`를 연결합니다.
- 신규 사용자는 임의 비밀번호를 인코딩해 저장해도 충분합니다.

## Step 3. `OAuthLoginSuccessHandler` 정답 포인트

OAuth 성공 후에는 아래 순서로 처리하면 됩니다.

1. `OAuth2AuthenticationToken` 읽기
2. principal에서 `providerId`, `email` 꺼내기
3. `OAuthAccountService` 호출
4. redirect URL 만들기

```kotlin
val profile = OAuthUserProfile(
    provider = oauthAuthentication.authorizedClientRegistrationId.uppercase(),
    providerId = oauthUser.getAttribute<String>("providerId")
        ?: throw IllegalStateException("OAuth provider id를 읽을 수 없습니다."),
    email = oauthUser.getAttribute<String>("email")
        ?: throw IllegalStateException("OAuth email을 읽을 수 없습니다.")
)

val loginResponse = oAuthAccountService.handleOAuthLogin(profile)
```

이후에는 `token`, `email`, `provider`, `isNewUser`를 query parameter로 붙여 `auth-demo.html`로 redirect 하면 됩니다.

## Step 4. `SecurityConfig` 확인 포인트

이번 시퀀스에서 설정의 핵심은 아래입니다.

- `/oauth2/**`, `/login/oauth2/**` 공개
- `.oauth2Login { ... }` 연결
- `loginPage("/auth-demo.html")`
- `successHandler(oAuthLoginSuccessHandler)`
- `userInfoEndpoint { userService(customOAuthUserService) }`

## 빠른 비교 포인트

- `CustomOAuthUserService`가 `email`, `sub`를 읽는가
- `OAuthAccountService`가 세 갈래 분기를 가지는가
- `OAuthLoginSuccessHandler`가 redirect 파라미터를 만드는가
- OAuth 성공 후에도 우리 서비스 JWT를 발급하는가

## 강사용 한 줄 요약

이번 시퀀스의 정답 핵심은  
**Google이 인증한 사용자를 우리 서비스 사용자로 다시 정리하는 흐름이 보이는가** 입니다.
