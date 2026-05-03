# 인증과 JWT 정답 가이드

## 정답을 보기 전에 먼저 확인할 것

- `04-implementation`에서 직접 손으로 끝까지 작성했는지 먼저 확인합니다.
- 정답은 복붙용이 아니라 흐름 비교용으로 사용합니다.
- 이번 시퀀스의 핵심은 "회원가입 -> 로그인 -> JWT -> 보호된 API"가 한 흐름으로 이어지는지 보는 것입니다.

## Step 1. `UserSignUpRequest` 정답 포인트

회원가입 DTO는 email, password만 받고 기본 검증을 붙이면 충분합니다.

```kotlin
data class UserSignUpRequest(
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    val email: String,

    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    val password: String
)
```

확인 포인트:
- email 형식 검증이 있는가
- email, password 빈값 검증이 있는가
- 요청 DTO에 id 같은 서버 관리 값이 없는가

## Step 2. `LoginRequest` 정답 포인트

로그인 DTO도 같은 방식으로 email, password만 유지합니다.

```kotlin
data class LoginRequest(
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    val email: String,

    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    val password: String
)
```

핵심은 "로그인도 입력 검증을 초입에서 막는다"는 점입니다.

## Step 3. `AuthService.signUp()` 정답 포인트

회원가입의 핵심은 아래 세 줄입니다.

1. 같은 email 존재 여부 확인
2. 비밀번호 인코딩
3. `User` 저장

```kotlin
fun signUp(request: UserSignUpRequest) {
    val email = request.email
    val rawPassword = request.password

    if (userRepository.existsByEmail(email)) {
        throw UserAlreadyExistsException(email)
    }

    userRepository.save(
        User(
            email = email,
            password = passwordEncoder.encode(rawPassword)
        )
    )
}
```

확인 포인트:
- `existsByEmail(...)`가 있는가
- `encode(...)`를 거치는가
- Controller가 아니라 Service에서 저장하는가

## Step 4. `AuthService.login()` 정답 포인트

로그인의 핵심은 아래 흐름입니다.

1. email로 사용자 조회
2. `matches(...)`로 비밀번호 비교
3. JWT 발급

```kotlin
fun login(request: LoginRequest): TokenResponse {
    val user = userRepository.findByEmail(request.email)
        .orElseThrow { InvalidCredentialsException() }

    if (!passwordEncoder.matches(request.password, user.password)) {
        throw InvalidCredentialsException()
    }

    return TokenResponse(
        accessToken = jwtTokenProvider.createToken(user.email)
    )
}
```

확인 포인트:
- 조회 실패와 비밀번호 실패를 같은 예외로 정리했는가
- 직접 문자열 비교가 아니라 `matches(...)`를 썼는가
- 응답이 `TokenResponse`인가

## Step 5. `JwtTokenProvider` 정답 포인트

이번 시퀀스에서는 아래 세 메서드가 핵심입니다.

```kotlin
fun createToken(email: String): String
fun getEmail(token: String): String
fun validateToken(token: String): Boolean
```

핵심은 subject에 email을 넣고,
다음 요청에서 그 값을 다시 읽어오는 흐름입니다.

예시:

```kotlin
fun createToken(email: String): String {
    return Jwts.builder()
        .subject(email)
        .issuedAt(Date())
        .expiration(Date(System.currentTimeMillis() + expirationMs))
        .signWith(signingKey)
        .compact()
}
```

## Step 6. `SecurityConfig` 정답 포인트

이번 시퀀스에서 설정의 핵심은 두 가지입니다.

1. `/auth/signup`, `/auth/login`은 공개
2. `/auth/me`는 보호

```kotlin
.authorizeHttpRequests { auth ->
    auth
        .requestMatchers("/swagger/", "/v3/api-docs/", "/auth/signup", "/auth/login")
        .permitAll()
        .requestMatchers("/auth/me").authenticated()
        .anyRequest().permitAll()
}
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
```

확인 포인트:
- 보호된 API가 분명히 보이는가
- JWT 필터가 Security 체인에 연결되어 있는가

## Step 7. `AuthController` 정답 포인트

Controller는 인증 로직을 직접 계산하지 않고 Service에 위임하면 됩니다.

```kotlin
@PostMapping("/signup")
@ResponseStatus(HttpStatus.CREATED)
fun signUp(@Valid @RequestBody request: UserSignUpRequest) {
    authService.signUp(request)
}

@PostMapping("/login")
fun login(@Valid @RequestBody request: LoginRequest): TokenResponse {
    return authService.login(request)
}

@GetMapping("/me")
fun me(authentication: Principal): CurrentUserResponse {
    return authService.getCurrentUser(authentication.name)
}
```

핵심은 `Principal.name`을 Service에 넘겨 현재 사용자 조회 흐름을 유지하는 것입니다.

## 빠른 비교 포인트

- 회원가입 DTO와 로그인 DTO에 검증이 붙어 있는가
- 회원가입 시 `encode(...)`가 있는가
- 로그인 시 `matches(...)`와 `createToken(...)`가 이어지는가
- `/auth/me`가 `authenticated()`로 보호되는가
- 토큰에서 읽은 email이 현재 사용자 조회로 이어지는가

## 강사용 한 줄 요약

이번 시퀀스의 정답 핵심은  
회원가입으로 저장하고, 로그인으로 확인하고, JWT로 다음 요청을 구분하는 흐름이 보이는가 입니다.

## 실무 확장 개념: 인증과 인가의 분리

이번 시퀀스의 메인 구현은 최소 인증 흐름입니다.
하지만 실무에서는 “로그인만 됐으면 모든 API가 다 허용되는가?”라는 질문이 바로 따라옵니다.

예를 들어 아래 설정은 처음 보면 자연스럽습니다.

```kotlin
.authorizeHttpRequests { auth ->
    auth
        .requestMatchers("/auth/signup", "/auth/login").permitAll()
        .requestMatchers("/auth/").authenticated()
}
```

이렇게 두면 `/auth/me` 같은 API는 잘 보호할 수 있습니다.
하지만 곧 아래 같은 요구가 생깁니다.

- `/admin/users`는 관리자만 접근해야 한다
- `/users/{email}`은 본인만 조회해야 한다

이때 필요한 것이 인가입니다.
즉, 인증은 “누구인지 확인”이고,
인가는 “이 기능을 써도 되는지 확인”입니다.

### 역할 기반 접근 예시

```kotlin
.authorizeHttpRequests { auth ->
    auth
        .requestMatchers("/auth/signup", "/auth/login").permitAll()
        .requestMatchers("/auth/me").authenticated()
        .requestMatchers("/admin/").hasRole("ADMIN")
}
```

이 예시는 아래 차이를 보여줍니다.

- `/auth/me`: 로그인만 되면 접근 가능
- `/admin/`: 관리자 역할이 있어야 접근 가능

### 본인만 접근 가능한 규칙 예시

```kotlin
fun getProfile(requestedEmail: String, principalEmail: String): UserProfileResponse {
    if (requestedEmail != principalEmail) {
        throw ForbiddenException("본인 정보만 조회할 수 있습니다.")
    }

    return userQueryService.getProfileByEmail(requestedEmail)
}
```

핵심은 JWT를 발급하는 것보다,
그 JWT로 확인된 사용자가 어디까지 허용되는지를 나누는 규칙이 곧 필요해진다는 점입니다.

이번 단계에서는 이 인가 구조를 starter 필수 구현 범위로 넣지 않고,
`docs/theory.md`와 정답 가이드에서
문제 상황과 코드 예시까지 같이 이해하는 것을 목표로 둡니다.
