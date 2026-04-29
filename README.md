# Spring Boot OAuth2 And SMTP Recovery Lab

> Google OAuth2 로그인과 SMTP 기반 비밀번호 재설정 메일 요청을 함께 익히는 실습 레포입니다.

## 이 시퀀스에서 무엇을 배우나요

이번 실습은 `04-answer`의 회원가입, 로그인, JWT 흐름 위에
두 가지 확장을 함께 붙이는 단계입니다.

1. `Google OAuth2`로 외부 로그인 확장
2. `SMTP`로 비밀번호 재설정 메일 요청 확장

현재 레포는 로그인 아이디가 곧 `email`이라서,
이번 SMTP 파트는 `아이디 찾기`보다 `비밀번호 재설정 메일 요청`을 대표 흐름으로 다룹니다.

이번에는 구현만 따라가는 것이 아니라,
아래 두 실무 질문도 같이 붙잡습니다.

1. 같은 email의 로컬 계정과 Google 계정이 만나면 어떤 정책으로 연결할 것인가
2. 비밀번호 재설정 메일 요청은 왜 보안 관점에서 조심해야 하는가

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

1. `docs/theory.md`에서 계정 연결 정책과 계정 복구 보안 관점을 먼저 읽습니다.
2. `docs/implementation.md`에서 오늘 손으로 칠 순서를 확인합니다.
3. 아래 핵심 파일을 순서대로 엽니다.

- `src/main/kotlin/com/andi/rest_crud/security/CustomOAuthUserService.kt`
- `src/main/kotlin/com/andi/rest_crud/security/OAuthLoginSuccessHandler.kt`
- `src/main/kotlin/com/andi/rest_crud/service/OAuthAccountService.kt`
- `src/main/kotlin/com/andi/rest_crud/service/AccountRecoveryService.kt`
- `src/main/kotlin/com/andi/rest_crud/service/SmtpRecoveryMailSender.kt`

`05-implementation`에서는 TODO를 채우며 실습하고,
완료 후에는 `05-answer`나 `docs/answer-guide.md`로 비교하면 됩니다.

## 미리 제공되는 것

- `04-answer` 기반 자체 로그인 + JWT 흐름
- Google OAuth2 client 설정 뼈대
- SMTP 설정 자리
- MySQL 실행 설정과 테스트용 H2 설정
- 간단한 프론트 `auth-demo.html`
- `User`, `UserRepository`, `OAuthUserProfile`, `OAuthLoginResponse`

학생은 외부 로그인 성공 후 사용자 연결과
비밀번호 재설정 메일 요청의 핵심 흐름만 직접 구현합니다.

이번 문서는 특히 아래 코드를 기준으로 읽으면 이해가 빨라집니다.

- `OAuthAccountService.handleOAuthLogin(...)`
- `AccountRecoveryService.requestPasswordReset(...)`

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
- 기존 사용자와 신규 사용자 분기
- OAuth 성공 후 JWT와 redirect 파라미터 정리
- email 기준 비밀번호 재설정 메일 요청
- reset 링크 생성과 SMTP 발송 연결

이번 시퀀스에서는 실제 비밀번호 변경 완료, 토큰 저장소, SMTP 고급 보안 설정, 계정 찾기 고급 UX는 넣지 않습니다.
