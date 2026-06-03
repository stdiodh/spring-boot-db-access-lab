# 참고 구현 가이드

이 문서는 answer 브랜치에서만 사용하는 비교 가이드입니다. starter 구현을 마친 뒤 회원가입, 로그인, JWT 발급, 필터 검증, 보호 API 접근 흐름이 이어지는지 확인합니다.

## 1. 꼭 비교할 파일

- `src/main/kotlin/com/andi/rest_crud/service/AuthService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/JwtTokenProvider.kt`
- `src/main/kotlin/com/andi/rest_crud/security/JwtAuthenticationFilter.kt`
- `src/main/kotlin/com/andi/rest_crud/security/SecurityConfig.kt`
- `src/main/kotlin/com/andi/rest_crud/controller/AuthController.kt`

## 2. 인증 흐름 비교 포인트

- 회원가입은 사용자 저장과 중복 검사를 포함합니다.
- 로그인은 비밀번호 확인 뒤 토큰을 발급합니다.
- 잘못된 로그인은 인증 실패 응답으로 이어져야 합니다.

## 3. JWT 비교 포인트

- token provider가 발급과 검증 책임을 가집니다.
- filter는 Authorization header에서 Bearer token을 읽습니다.
- 검증된 토큰은 SecurityContext의 인증 정보로 이어집니다.

## 4. SecurityConfig 비교 포인트

- 회원가입, 로그인, Swagger 같은 공개 API는 토큰 없이 접근할 수 있어야 합니다.
- 보호 API는 인증된 요청만 접근해야 합니다.
- 인증 실패 응답은 일관된 형태로 내려가야 합니다.

## 5. 멘토 리뷰 포인트

- starter와 answer의 차이를 코드 길이가 아니라 인증 흐름의 책임 분리로 비교합니다.
- 토큰 문자열보다 발급 위치, 전달 방식, 검증 위치를 설명하게 합니다.
- 다음 시퀀스에서 외부 OAuth2 로그인 후 자체 JWT가 필요한 이유로 연결합니다.
