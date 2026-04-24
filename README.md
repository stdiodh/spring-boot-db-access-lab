# Spring Boot OAuth2 Lab

> Google OAuth2 로그인 흐름을 통해 외부 인증이 우리 서비스 사용자와 어떻게 연결되는지 익히는 실습 레포입니다.

## 이 시퀀스에서 무엇을 배우나요

이번 실습은 `04-answer`의 회원가입, 로그인, JWT 흐름 위에
Google OAuth2 로그인 확장을 붙이는 단계입니다.

이번 시퀀스의 메인 주제는 `OAuth2`입니다.
`Email Verification`이나 `SMTP`는 이번에 같이 넣지 않고,
이후 아이디 찾기 / 비밀번호 재설정 / 계정 복구 트랙에서 별도 레포로 분리합니다.

이번 레포에서는 아래 흐름에 집중합니다.

1. Google OAuth2 provider 설정을 확인합니다.
2. 로그인 성공 후 Google 사용자 정보를 읽습니다.
3. 기존 사용자와 신규 사용자를 분기합니다.
4. 우리 서비스 사용자와 연결합니다.
5. 성공 결과를 프론트 redirect와 JWT 응답으로 정리합니다.

## 브랜치 사용 방법

- `main`: 이 레포의 주제, 문서, 브랜치 구조를 안내하는 대표 브랜치
- `05-implementation`: 학생 실습용 starter 브랜치
- `05-answer`: 비교용 정답 브랜치

학생은 반드시 `05-implementation`에서 시작합니다.

```bash
git clone -b 05-implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
git checkout -b feat/<이름>
```

정답 비교가 필요할 때는 아래 흐름을 사용합니다.

```bash
git fetch origin
git diff origin/05-implementation..origin/05-answer
```

## 문서 안내

- [이론 문서](./docs/theory.md)
- [구현 안내](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자료 안내](./docs/assets.md)

## 파일을 어떻게 보면 좋나요

1. `docs/theory.md`에서 자체 로그인과 외부 로그인 차이를 먼저 읽습니다.
2. `docs/implementation.md`에서 오늘 손으로 칠 순서를 확인합니다.
3. 아래 핵심 파일을 순서대로 엽니다.

- `src/main/kotlin/com/andi/rest_crud/security/CustomOAuthUserService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/OAuthLoginSuccessHandler.kt`
- `src/main/kotlin/com/andi/rest_crud/service/OAuthAccountService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/SecurityConfig.kt`
- `src/main/resources/static/auth-demo.html`

`05-implementation`에서는 TODO를 채우며 실습하고,
완료 후에는 `05-answer`나 `docs/answer-guide.md`로 비교하면 됩니다.

## 미리 제공되는 것

- `04-answer` 기반 자체 로그인 + JWT 흐름
- Google OAuth2 client 설정 뼈대
- MySQL 실행 설정과 테스트용 H2 설정
- 간단한 프론트 redirect 페이지 `auth-demo.html`
- `User`, `UserRepository`, `OAuthUserProfile`, `OAuthLoginResponse`

학생은 외부 로그인 성공 후 사용자 연결과 성공 응답 정리 흐름만 직접 구현합니다.

## 실행 방법

먼저 MySQL을 준비합니다.

```bash
docker compose up -d
```

애플리케이션 실행:

```bash
./gradlew bootRun
```

브라우저에서 데모 페이지 확인:

```text
http://localhost:8080/auth-demo.html
```

테스트 실행:

```bash
./gradlew test
```

## 이번 실습에서 직접 구현할 범위

- Google 사용자 정보 읽기
- provider / providerId / email 정리
- 기존 사용자와 신규 사용자 분기
- 성공 후 JWT 발급과 redirect 파라미터 정리

이번 시퀀스에서는 Email Verification, SMTP, refresh token, 복잡한 계정 연결 정책은 넣지 않습니다.
