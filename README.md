# 04 JWT

## 이 시퀀스에서 다루는 문제

이번 answer 브랜치는 회원가입, 로그인, JWT 발급, 인증 필터, 보호 API 흐름이 연결된 비교 기준입니다. 로그인 성공 후 발급한 토큰이 이후 요청에서 인증 상태로 바뀌는 과정을 확인합니다.

OAuth2, SMTP, 비밀번호 재설정, Redis, 고급 권한 모델은 이번 범위에 넣지 않습니다.

## 학습 목표

- 회원가입과 로그인 요청 흐름을 비교합니다.
- JWT 발급과 검증 흐름을 이해합니다.
- 인증 필터가 요청에서 토큰을 읽어 인증 정보를 만드는 위치를 설명합니다.
- 공개 API와 보호 API의 차이를 설명합니다.

## 멘티 시작 흐름

먼저 starter 브랜치에서 직접 구현한 뒤, 이 브랜치의 문서를 비교 기준으로 사용합니다.

```bash
git fetch origin
git diff origin/04-implementation..origin/04-answer
```

## 읽는 순서

1. [이론 정리](./docs/theory.md)
2. [구현 가이드](./docs/implementation.md)
3. [참고 구현 가이드](./docs/answer-guide.md)
4. [체크리스트](./docs/checklist.md)
5. [제공 자료 안내](./docs/assets.md)

## 실행 / 테스트 방법

```bash
docker compose up -d
./gradlew bootRun
```

Swagger UI:

```text
http://localhost:8080/swagger
```

테스트 실행:

```bash
./gradlew test
```

## 완료 기준

- 회원가입과 로그인 흐름을 설명합니다.
- 로그인 성공 시 JWT가 발급됩니다.
- 인증 필터가 Bearer token을 읽어 인증 정보를 구성합니다.
- 보호된 API는 토큰 없이 접근할 수 없습니다.
- `./gradlew test`가 통과합니다.

<details>
<summary>멘토용 진행 포인트</summary>

## 수업 전 확인

- answer 브랜치에서 `./gradlew test`가 통과하는지 확인합니다.
- OAuth2/SMTP는 다음 시퀀스 범위입니다.

## 수업 중 질문

- answer에서 토큰은 어디에서 만들어지고 어디에서 검증되나요?
- 필터가 Controller보다 먼저 동작해야 하는 이유는 무엇인가요?
- 공개 API와 보호 API는 Security 설정에서 어떻게 나뉘나요?

## 리뷰 기준

- 멘티가 answer 코드를 그대로 외우는 것이 아니라 회원가입, 로그인, 토큰 발급, 필터 검증, 보호 API 접근 순서를 설명하는지 봅니다.
- token provider와 filter의 책임을 구분하는지 확인합니다.
- 다음 OAuth2 시퀀스에서 외부 로그인 이후 자체 JWT가 필요한 이유를 연결합니다.

</details>
