# 인증과 JWT 이론 정리

로그인 이후 요청을 어떻게 구분하는지, 그리고 왜 비밀번호와 토큰을 따로 신경 써야 하는지 감을 잡는 문서입니다.

이번 시퀀스 한 줄 요약  
회원가입과 로그인 최소 흐름을 만들고, JWT로 보호된 API 접근 차이를 직접 확인하는 단계입니다.

## 먼저 이것만 기억해도 됩니다

- 인증은 "누구인지 확인"하는 것이고, 인가는 "접근해도 되는지 나누는 것"입니다.
- 비밀번호는 원문 그대로 저장하면 안 되고 `PasswordEncoder`를 거쳐야 합니다.
- JWT는 로그인 이후 요청에서 "이 사용자가 누구인지"를 구분하는 데 쓰입니다.
- 로그인만 된다고 모든 API가 자동으로 허용되는 것은 아니고, 그 다음에는 인가 규칙이 필요해집니다.

## 이 주제를 왜 배우는가

03 시퀀스까지는 요청 검증과 실패 응답을 안전하게 만드는 데 집중했습니다.
그런데 아직은 "누가 요청했는지"를 구분하지 못합니다.

실제 서비스에서는 글을 쓰거나 내 정보를 조회할 때 사용자를 식별해야 합니다.
그래서 이번 실습에서는 회원가입, 로그인, 토큰 발급, 보호된 API 접근이라는 가장 작은 인증 흐름을 직접 연결해봐요.
이 흐름을 이해하면 다음에는 Google OAuth 같은 외부 인증으로도 자연스럽게 이어질 수 있습니다.

## 이번 실습 흐름을 먼저 한눈에 보기

1. 사용자가 `POST /auth/signup`으로 회원가입 요청을 보냅니다.
2. `AuthController`가 요청을 받고 `AuthService`에 넘깁니다.
3. `AuthService`가 비밀번호를 인코딩해 `User`를 저장합니다.
4. 사용자가 `POST /auth/login`으로 로그인 요청을 보냅니다.
5. `AuthService`가 email, password를 확인하고 JWT를 발급합니다.
6. 사용자는 `Authorization: Bearer <token>` 헤더와 함께 `/auth/me`를 요청합니다.
7. `JwtAuthenticationFilter`가 토큰에서 email을 읽고 현재 요청을 인증합니다.

짧게 말하면 이번 실습은  
회원가입 -> 로그인 -> JWT 발급 -> 보호된 API 접근 흐름을 익히는 과정입니다.

한 줄로 다시 보기  
로그인 성공 후 받은 토큰이 다음 요청에서 사용자를 구분해주는 장면을 직접 확인하는 실습입니다.

## 오늘 꼭 잡아야 할 질문

- 왜 비밀번호를 그대로 저장하면 안 되나요?
- 로그인 성공 후 서버는 사용자를 어떻게 기억하나요?
- `/auth/me`는 왜 토큰이 있어야 하나요?
- 이번 코드에서 인증 흐름이 가장 잘 보이는 클래스는 무엇인가요?

## 중요한 코드 먼저 보기

### 1. 회원가입과 로그인 요청이 시작되는 코드

```kotlin
@RestController
@RequestMapping("/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): TokenResponse {
        return authService.login(request)
        // Controller는 인증 세부 로직을 직접 풀지 않고 Service에 맡깁니다.
    }
}
```

- 이 코드는 인증 요청의 시작점을 보여줍니다.
- 학생은 `@PostMapping("/signup")`, `@PostMapping("/login")`, `@GetMapping("/me")`를 먼저 보면 좋습니다.
- 핵심은 "인증 요청도 결국 Controller -> Service 흐름으로 들어간다"는 점입니다.

### 2. 로그인에서 비밀번호 확인과 JWT 발급이 일어나는 코드

```kotlin
fun login(request: LoginRequest): TokenResponse {
    val user = userRepository.findByEmail(request.email)
        .orElseThrow { InvalidCredentialsException() }

    if (!passwordEncoder.matches(request.password, user.password)) {
        throw InvalidCredentialsException()
    }

    return TokenResponse(
        accessToken = jwtTokenProvider.createToken(user.email)
        // 로그인 성공 후 access token 하나를 발급합니다.
    )
}
```

- 이 코드는 이번 시퀀스의 핵심 장면입니다.
- 여기서는 `findByEmail(...)`, `passwordEncoder.matches(...)`, `createToken(...)`을 먼저 보세요.
- 학생이 기억해야 할 핵심은 "로그인은 사용자 확인이 끝난 뒤 토큰을 발급하는 흐름"이라는 점입니다.

### 3. 보호된 API에 접근하기 전에 토큰을 읽는 코드

```kotlin
if (token != null && jwtTokenProvider.validateToken(token)) {
    val email = jwtTokenProvider.getEmail(token)
    val authentication = UsernamePasswordAuthenticationToken(email, null, emptyList())
    SecurityContextHolder.getContext().authentication = authentication
    // 토큰에서 읽은 email을 현재 요청의 인증 정보로 넣어 둡니다.
}
```

- 이 코드는 JWT가 실제 요청에서 어떻게 쓰이는지 보여줍니다.
- 학생은 "토큰은 로그인 응답에서 끝나는 값이 아니라 다음 요청에서 다시 읽히는 값"이라는 감각을 잡으면 됩니다.

### 4. 보호된 API를 지정하는 설정 코드

```kotlin
.authorizeHttpRequests { auth ->
    auth
        .requestMatchers("/auth/signup", "/auth/login").permitAll()
        .requestMatchers("/auth/me").authenticated()
        // /auth/me 는 토큰이 있어야 통과합니다.
}
```

- 이 코드는 인증 이후 접근 제어의 가장 작은 예시입니다.
- 이번 실습에서는 복잡한 권한(Role) 대신 `/auth/me` 하나만 보호합니다.

## 핵심 용어를 쉬운 말로 정리하기

### 인증

- 뜻  
  지금 요청한 사람이 누구인지 확인하는 과정입니다.
- 왜 중요한가  
  로그인한 사용자인지 아닌지 구분해야 내 정보 조회 같은 기능을 만들 수 있습니다.
- 이번 코드에서는 어디에 보이는가  
  `AuthService.login(...)`, `JwtAuthenticationFilter`, `SecurityContextHolder`
- 짧은 상황 예시  
  같은 `/auth/me` 요청이라도 토큰이 있으면 통과하고, 없으면 막힙니다.

### 인가

- 뜻  
  확인된 사용자가 특정 API에 접근해도 되는지 나누는 과정입니다.
- 왜 중요한가  
  로그인하지 않은 요청과 로그인한 요청을 다르게 처리할 수 있어야 합니다.
- 이번 코드에서는 어디에 보이는가  
  `SecurityConfig`의 `.requestMatchers("/auth/me").authenticated()`
- 짧은 상황 예시  
  회원가입과 로그인은 누구나 접근할 수 있지만, 내 정보 조회는 인증된 요청만 접근합니다.

### 회원가입

- 뜻  
  새 사용자를 저장하는 과정입니다.
- 왜 중요한가  
  로그인하려면 먼저 사용자 데이터가 있어야 합니다.
- 이번 코드에서는 어디에 보이는가  
  `AuthController.signUp(...)`, `AuthService.signUp(...)`
- 짧은 상황 예시  
  같은 email이 이미 있으면 새로 저장하지 않고 실패 응답을 돌려줍니다.

### 로그인

- 뜻  
  저장된 사용자 정보와 요청값을 비교해 인증하는 과정입니다.
- 왜 중요한가  
  로그인 성공 후에야 서버가 이 요청을 어떤 사용자로 볼지 정할 수 있습니다.
- 이번 코드에서는 어디에 보이는가  
  `AuthService.login(...)`
- 짧은 상황 예시  
  email이 없거나 비밀번호가 다르면 `INVALID_CREDENTIALS`가 반환됩니다.

### PasswordEncoder

- 뜻  
  비밀번호를 안전한 형태로 바꾸고 비교하는 도구입니다.
- 왜 중요한가  
  비밀번호 원문을 그대로 저장하면 유출 시 위험이 매우 큽니다.
- 이번 코드에서는 어디에 보이는가  
  `passwordEncoder.encode(...)`, `passwordEncoder.matches(...)`
- 짧은 상황 예시  
  회원가입 때는 `encode`, 로그인 때는 `matches`를 사용합니다.

### JWT

- 뜻  
  로그인 이후 요청에서 사용자를 구분하기 위한 토큰 형식 중 하나입니다.
- 왜 중요한가  
  매 요청마다 "누구인지"를 다시 확인할 수 있게 해줍니다.
- 이번 코드에서는 어디에 보이는가  
  `JwtTokenProvider.createToken(...)`, `JwtTokenProvider.getEmail(...)`
- 짧은 상황 예시  
  로그인에 성공하면 access token 하나를 받고, 다음 요청에서 헤더에 실어 보냅니다.

### 보호된 API

- 뜻  
  인증된 요청만 접근할 수 있도록 막아 둔 API입니다.
- 왜 중요한가  
  로그인하지 않은 사용자와 로그인한 사용자의 접근 범위를 구분할 수 있습니다.
- 이번 코드에서는 어디에 보이는가  
  `/auth/me`, `SecurityConfig`
- 짧은 상황 예시  
  토큰 없이 `/auth/me`를 호출하면 401, 토큰이 있으면 현재 사용자 email을 돌려받습니다.

## 핵심 개념 설명

### 1. 회원가입과 로그인은 같은 것처럼 보여도 역할이 다릅니다

회원가입은 새 사용자를 저장하는 흐름입니다.
반면 로그인은 이미 저장된 사용자와 요청값을 비교해 인증하는 흐름입니다.
이번 실습에서는 둘 다 `AuthService`에 모여 있지만, 하는 일은 다릅니다.

### 2. 비밀번호는 저장보다 "안전한 저장"이 더 중요합니다

회원가입 기능을 만들 때 가장 먼저 주의해야 할 것은 비밀번호입니다.
값을 받는 것보다, 그 값을 어떻게 저장하는지가 더 중요합니다.
그래서 이번 실습에서는 `PasswordEncoder`를 바로 연결해 "회원가입 순간부터 안전한 저장" 감각을 익힙니다.

### 3. JWT는 로그인 응답이 아니라 다음 요청까지 이어지는 흐름입니다

학생이 가장 많이 놓치는 부분이 여기입니다.
로그인 API에서 토큰을 발급받는 순간보다, 그 토큰이 `/auth/me` 요청에서 다시 읽히는 장면이 더 중요합니다.
이번 실습에서는 `JwtAuthenticationFilter`를 통해 이 흐름을 가장 단순하게 확인합니다.

## 실무에서 한 번 더 보기

이번 시퀀스의 메인 구현은 회원가입, 로그인, JWT, `/auth/me` 보호로 유지합니다.
하지만 실무에서는 금방 “로그인만 됐다고 아무 API나 열어두면 안 된다”는 문제를 만나게 됩니다.

### 1. 기본 인증만으로는 부족한 순간

예를 들어 아래 두 API가 있다고 가정해보겠습니다.

- `/auth/me`: 로그인한 사용자의 내 정보 조회
- `/admin/users`: 전체 사용자 목록 조회

둘 다 “로그인한 사용자”가 요청할 수는 있습니다.
하지만 둘을 같은 기준으로 열어두면 문제가 생깁니다.

- 일반 사용자도 관리자 화면용 API를 호출할 수 있고
- 로그인만 되어 있으면 다른 사람 데이터에 접근할 길이 열릴 수 있습니다

즉, 인증만으로는 누구인지는 알 수 있어도
무엇을 해도 되는지까지는 결정하지 못합니다.

### 2. 처음 보면 자연스러운 문제 코드

처음에는 Security 설정을 아래처럼 두고 싶어질 수 있습니다.

```kotlin
.authorizeHttpRequests { auth ->
    auth
        .requestMatchers("/auth/signup", "/auth/login").permitAll()
        .requestMatchers("/auth/").authenticated()
}
```

- 이 코드는 겉으로 보면 단순하고 깔끔합니다.
- `/auth/` 아래는 로그인만 되어 있으면 다 통과시키겠다는 뜻입니다.

하지만 이 구조만으로는 아래 상황을 설명하기 어렵습니다.

- 관리자만 접근해야 하는 API
- 본인만 수정해야 하는 API
- 같은 로그인 사용자라도 역할에 따라 달라지는 접근 규칙

### 3. 그래서 왜 인가 규칙이 필요해지는가

기본 `authenticated()`만으로 열어두면 아래 문제가 생깁니다.

1. 로그인 성공과 접근 허용이 같은 의미가 됩니다.  
   "누구인지 확인"과 "이 기능을 써도 되는지"가 한 단계로 뭉개집니다.

2. API마다 다른 규칙을 설명하기 어렵습니다.  
   어떤 API는 로그인만 있으면 되고, 어떤 API는 관리자만 돼야 할 수 있습니다.

3. 본인 확인 규칙을 서비스 안쪽에서만 처리하게 될 수 있습니다.  
   요청 초입에서 막을 수 있는 부분을 뒤로 미루게 됩니다.

4. 문제가 생겼을 때 원인이 흐려집니다.  
   “토큰이 없어서 막힌 것”인지, “로그인은 됐지만 권한이 없어서 막힌 것”인지 구분이 어려워질 수 있습니다.

쉽게 말하면, 인증만 있는 상태에서는 사용자를 식별할 수는 있어도
시스템이 허용하는 행동 경계를 충분히 설명할 수 없습니다.

### 4. 대표 해결 코드는 어떻게 생기는가

인가 규칙은 보통 아래 두 방향으로 자주 확장됩니다.

#### 역할 기반 접근 예시

```kotlin
.authorizeHttpRequests { auth ->
    auth
        .requestMatchers("/auth/signup", "/auth/login").permitAll()
        .requestMatchers("/auth/me").authenticated()
        .requestMatchers("/admin/").hasRole("ADMIN")
}
```

- `/auth/me`는 로그인만 되면 접근 가능
- `/admin/`는 `ADMIN` 역할이 있어야 접근 가능

이렇게 되면 “로그인만 됐는가”와
“관리자 권한까지 있는가”를 나눠서 설명할 수 있습니다.

#### 본인만 접근 가능한 규칙 예시

```kotlin
fun getProfile(requestedEmail: String, principalEmail: String): UserProfileResponse {
    if (requestedEmail != principalEmail) {
        throw ForbiddenException("본인 정보만 조회할 수 있습니다.")
    }

    return userQueryService.getProfileByEmail(requestedEmail)
}
```

- 로그인은 이미 된 상태라고 가정하고
- 그 안에서 “내 정보만 볼 수 있는가”를 한 번 더 확인하는 예시입니다

즉 인가의 핵심은 `누구냐`에서 끝나는 것이 아니라
`이 요청을 해도 되느냐`까지 규칙을 세우는 것입니다.

### 5. 이번 시퀀스에서는 어디까지 다루는가

이번 시퀀스에서는 아래까지만 가져갑니다.

- 회원가입
- 로그인
- JWT 발급
- `/auth/me` 보호
- 인증과 인가가 왜 다른지 이해하는 것
- 역할 기반 접근이나 본인 확인 규칙이 어떤 코드 모양인지 이해하는 것

다만 이번 메인 구현은 여전히 최소 인증 흐름 중심입니다.
즉 지금 단계에서는 `ROLE_ADMIN` 전체 구조나 복잡한 권한 테이블을 starter 핵심 구현 범위에 넣기보다,
기본 인증의 한계 -> 인가 코드 예시 -> 다음 확장 방향까지 설명할 수 있는 상태를 목표로 잡습니다.

## 이번 실습에서 꼭 보면 좋은 포인트

- `AuthService.signUp(...)`에서 `existsByEmail(...)`과 `encode(...)`가 같은 흐름 안에 있는지 보세요.
- `AuthService.login(...)`에서 "조회 -> 비밀번호 확인 -> 토큰 발급" 순서가 보이는지 보세요.
- `SecurityConfig`에서 열어둘 API와 보호할 API가 어떻게 나뉘는지 보세요.
- `JwtAuthenticationFilter`가 토큰을 읽은 뒤 현재 요청에 인증 정보를 어떻게 넣는지 보세요.

## 자주 헷갈리는 포인트

- 인증과 인가는 같은 말이 아닙니다.
- 비밀번호는 `encode(...)`로 저장하고, 로그인 시에는 `matches(...)`로 비교합니다.
- JWT를 발급했다고 해서 자동으로 보호된 API가 열리는 것은 아닙니다.
- Controller가 인증 로직을 직접 처리하는 것이 아니라 Service와 Filter가 역할을 나눕니다.
- `authenticated()`는 로그인 여부를 확인하는 것이고, 역할 기반 접근은 그 다음 단계입니다.

## 직접 말해보기

- 회원가입과 로그인은 무엇이 다른가요?
- 비밀번호를 원문 그대로 저장하면 왜 위험한가요?
- `/auth/me`는 왜 토큰이 있어야 하나요?
- JWT는 로그인 이후 어떤 요청에서 다시 쓰이나요?
- 로그인만 되어 있어도 막아야 하는 API가 있다면 어떤 인가 규칙이 필요할까요?

## 복습 체크리스트

- [ ] 인증과 인가의 차이를 설명할 수 있습니다.
- [ ] `PasswordEncoder`를 왜 쓰는지 설명할 수 있습니다.
- [ ] 로그인 성공 후 JWT가 발급되는 흐름을 말할 수 있습니다.
- [ ] 토큰 없이 `/auth/me`를 호출했을 때 왜 막히는지 설명할 수 있습니다.
- [ ] 토큰에서 읽은 email이 현재 사용자 조회로 이어지는 흐름을 설명할 수 있습니다.
- [ ] 인증과 인가가 언제 갈리는지 설명할 수 있습니다.

## 오늘 꼭 기억할 것

이번 시퀀스의 핵심은 Spring Security 문법을 많이 외우는 것이 아닙니다.
대신 "회원가입으로 저장하고, 로그인으로 확인하고, JWT로 다음 요청을 구분한다"는 흐름을 잡는 것입니다.
그리고 로그인만으로는 충분하지 않은 순간이 오고,
그다음에는 역할 기반 접근이나 본인 확인 규칙 같은 인가가 필요해진다는 감각까지 가져가는 것이 중요합니다.

## 다음 실습과 연결하기

다음에는 직접 만든 로그인만이 아니라
Google OAuth처럼 외부 인증을 받아 우리 서비스 사용자와 연결하는 흐름으로 확장할 수 있습니다.
