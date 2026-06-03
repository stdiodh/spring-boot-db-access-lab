# 체크리스트

## 1. 기능 확인

- [ ] 회원가입 요청이 성공합니다.
- [ ] 로그인 성공 시 JWT가 발급됩니다.
- [ ] 잘못된 로그인 요청이 실패합니다.
- [ ] 보호 API는 토큰 없이 접근할 수 없습니다.
- [ ] `./gradlew test`가 통과합니다.

## 2. 코드 구조 확인

- [ ] `AuthService`가 회원가입과 로그인 흐름을 담당합니다.
- [ ] `JwtTokenProvider`가 토큰 발급과 검증 책임을 갖습니다.
- [ ] `JwtAuthenticationFilter`가 요청 토큰을 인증 정보로 바꿉니다.
- [ ] `SecurityConfig`가 공개 API와 보호 API를 구분합니다.
- [ ] JWT secret 같은 운영 민감값은 별도 설정으로 분리할 필요가 있음을 설명합니다.

## 3. 실패 케이스 확인

- [ ] 중복 회원가입이 실패합니다.
- [ ] 잘못된 비밀번호 로그인이 실패합니다.
- [ ] 토큰이 없는 보호 API 요청이 실패합니다.
- [ ] 잘못된 토큰 요청이 실패합니다.

## 4. 설명할 수 있어야 하는 것

- [ ] 인증과 인가의 차이
- [ ] JWT 발급 위치와 검증 위치
- [ ] Bearer token 형식
- [ ] Security filter가 Controller보다 먼저 동작하는 이유
- [ ] 공개 API와 보호 API의 차이

## 5. 남은 한계와 다음 시퀀스 연결

- [ ] 이번 answer는 자체 회원가입/로그인과 JWT에 집중합니다.
- [ ] OAuth2, SMTP, 계정 복구는 다음 시퀀스에서 다룹니다.
- [ ] Redis 기반 토큰 저장이나 refresh token 고급 전략은 이번 범위 밖입니다.

<details>
<summary>멘토용 리뷰 기준</summary>

- 통과 기준: 멘티가 answer 구현을 보고 signup, login, token issue, filter validation, protected API 흐름을 설명합니다.
- 보완 필요 기준: 토큰 발급만 보고 보호 API 검증 흐름을 설명하지 못합니다.
- 질문 예시: "이 요청은 Controller에 도달하기 전에 어떤 필터를 지나나요?"
- 비교 포인트: starter 구현과 answer 구현의 차이를 AuthService, JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig 순서로 봅니다.

</details>
