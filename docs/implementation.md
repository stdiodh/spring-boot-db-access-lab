# Google OAuth2 로그인 구현 안내

## 이 도메인이 필요한 이유

04 시퀀스에서는 우리 서비스가 직접 회원가입과 로그인을 처리했습니다.
이제는 같은 인증 도메인 안에서 "외부 로그인"이 어떻게 붙는지 볼 차례입니다.
이번 실습은 Google OAuth2 로그인 성공 후 사용자 정보를 읽고, 우리 서비스 사용자와 연결하는 가장 작은 확장 흐름을 만듭니다.

## 오늘 학생이 완성할 최종 흐름

1. Google provider 설정을 확인합니다.
2. Google 사용자 정보에서 `email`, `sub`를 읽습니다.
3. 기존 사용자와 신규 사용자를 분기합니다.
4. 우리 서비스 사용자와 연결합니다.
5. 성공 후 JWT와 사용자 정보를 프론트 redirect로 정리합니다.

## 학생이 직접 구현할 순서

1. provider 설정을 확인합니다.
2. 로그인 성공 후 사용자 정보를 읽습니다.
3. 신규/기존 사용자를 분기합니다.
4. 우리 서비스 사용자와 연결합니다.
5. 성공 응답을 만듭니다.

## TODO를 넣을 파일

- `src/main/kotlin/com/andi/rest_crud/security/CustomOAuthUserService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/OAuthLoginSuccessHandler.kt`
- `src/main/kotlin/com/andi/rest_crud/service/OAuthAccountService.kt`

## 파일별 역할 설명

- `CustomOAuthUserService.kt`: Google 응답에서 필요한 속성을 읽어 우리 쪽 속성으로 다시 담는 곳
- `OAuthLoginSuccessHandler.kt`: OAuth 성공 후 Service에 연결을 맡기고 프론트 redirect를 만드는 곳
- `OAuthAccountService.kt`: 기존 OAuth 사용자, 기존 로컬 사용자, 신규 사용자를 분기하는 핵심 서비스
- `SecurityConfig.kt`: OAuth login entry와 success handler를 연결하는 설정
- `auth-demo.html`: OAuth 버튼과 성공 결과를 확인하는 간단 프론트

## 미리 제공할 것

- `04-answer` 기반 자체 로그인 + JWT
- Google OAuth2 client 설정 값 자리
- `User`의 `authProvider`, `providerId`
- `OAuthUserProfile`, `OAuthLoginResponse`
- `auth-demo.html`과 redirect 흐름 기본 화면

## 단계별 구현 안내

### Step 1. provider 설정 확인

- `application.yaml`을 엽니다.
- `spring.security.oauth2.client.registration.google` 설정을 확인합니다.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 자리가 들어 있는지 봅니다.

실습 힌트:
- 이번 실습은 Google 하나만 사용합니다.
- 여러 provider를 한 번에 확장하지 않습니다.

### Step 2. 로그인 성공 후 사용자 정보 읽기

- `CustomOAuthUserService.kt`를 엽니다.
- 기본 `DefaultOAuth2UserService`로 사용자 정보를 읽습니다.
- Google 응답에서 `email`, `sub`를 꺼냅니다.

실습 힌트:
- `sub`는 provider id로 사용합니다.
- 우리 코드에서 다시 쓰기 쉽게 `provider`, `providerId`, `email` 속성을 새로 담아 주세요.

### Step 3. 신규/기존 사용자 분기

- `OAuthAccountService.kt`를 엽니다.
- 먼저 `provider + providerId` 기준으로 기존 OAuth 사용자를 찾습니다.
- 없으면 `email` 기준으로 기존 로컬 사용자를 확인합니다.

실습 힌트:
- 외부 로그인 사용자를 찾는 기준과 로컬 사용자를 찾는 기준이 다르다는 점을 먼저 보세요.

### Step 4. 우리 서비스 사용자와 연결

- 기존 OAuth 사용자가 있으면 그대로 사용합니다.
- 기존 로컬 사용자만 있으면 그 사용자에 `authProvider`, `providerId`를 연결합니다.
- 둘 다 없으면 새 사용자를 생성합니다.

실습 힌트:
- 새 사용자를 만들 때는 로컬 비밀번호 대신 임의 문자열을 인코딩해 넣어도 됩니다.
- 이번 시퀀스의 핵심은 계정 연결 흐름이지 비밀번호 재설정이 아닙니다.

### Step 5. 성공 응답 만들기

- `OAuthLoginSuccessHandler.kt`를 엽니다.
- OAuth 성공 후 profile을 만들고 `OAuthAccountService`에 넘깁니다.
- 성공 결과를 `auth-demo.html`로 redirect 파라미터에 담아 보냅니다.

실습 힌트:
- 이번 시퀀스에서는 별도 JSON 응답 컨트롤러를 만들지 않습니다.
- `oauth=success`, `email`, `provider`, `token`, `isNewUser` 정도만 넘겨도 충분합니다.

## 학생 체크리스트

- [ ] Google 응답에서 어떤 값을 읽는지 설명할 수 있습니다.
- [ ] 기존 OAuth 사용자와 기존 로컬 사용자를 어떤 기준으로 나누는지 설명할 수 있습니다.
- [ ] OAuth 성공 후 우리 서비스 사용자 연결 단계가 왜 필요한지 설명할 수 있습니다.
- [ ] Google 로그인 후 `auth-demo.html`로 redirect 되는 흐름을 직접 확인했습니다.
- [ ] redirect 결과에 JWT와 사용자 정보가 담기는 이유를 설명할 수 있습니다.

## 강사 / PPT 체크리스트

- [ ] Google 로그인 -> 사용자 정보 읽기 -> 사용자 연결 -> redirect 흐름 그림이 있는가
- [ ] 자체 로그인과 OAuth 로그인 차이를 한 화면에서 비교할 수 있는가
- [ ] provider id와 email 기준 분기를 코드와 함께 설명할 수 있는가
- [ ] 신규 사용자 / 기존 사용자 분기를 시연할 수 있는가
- [ ] SMTP 기반 계정 복구는 이번 시퀀스 범위가 아니라는 점을 분명히 말할 수 있는가

## 다음 도메인 연결 포인트

다음 시퀀스에서는 지금 만든 OAuth 확장 흐름도
테스트와 검증 관점에서 어떻게 확인할지로 이어질 수 있습니다.
