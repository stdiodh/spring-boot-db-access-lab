# 레포 가이드

## 이 레포의 역할

이 레포는 A&I 백엔드 커리큘럼 안에서
DB 저장, 요청 안전성, 인증/JWT까지 이어지는 흐름을 실습하는 토픽 레포입니다.

한 레포 안에서 아래 시퀀스가 순서대로 이어집니다.

1. `02`: MySQL 기반 CRUD와 계층 분리
2. `03`: DTO, Validation, 예외 응답
3. `04`: 회원가입, 로그인, JWT
4. `05`: OAuth2 로그인, SMTP 메일 발송, 계정 복구 단계화
5. `06`: Service 테스트와 검증

## 공통 실행 기준

- 런타임 DB는 MySQL을 사용합니다.
- 테스트는 H2 in-memory DB를 사용합니다.
- Swagger UI 기본 경로는 `http://localhost:8080/swagger`입니다.
- 시퀀스별 로컬 DB 실행은 각 브랜치의 `compose.yaml` 기준으로 맞춥니다.

## 이 레포 안에서 학생이 보게 되는 공통 구조

- `README.md`: 현재 브랜치 소개
- `docs/theory.md`: 왜 이 주제가 필요한지 설명
- `docs/implementation.md`: 학생이 손으로 칠 순서
- `docs/checklist.md`: 학생/강사 체크리스트

단, 위 구조는 `NN-implementation`, `NN-answer` 브랜치에서만 실습용으로 보입니다.
`main` 브랜치는 안내 브랜치이므로 레포 운영 문서만 둡니다.

## 학습 순서

1. `02`에서 DB 저장과 계층 분리를 익힙니다.
2. `03`에서 요청을 안전하게 받는 흐름을 붙입니다.
3. `04`에서 로그인 이후 요청을 구분하는 인증 흐름을 붙입니다.
4. `05`에서 OAuth2 로그인, SMTP 메일 발송, 계정 복구를 05-A/B/C로 나눠 붙입니다.
5. `06`에서 이미 만든 Service 코드를 테스트로 다시 검증합니다.

이 순서가 흐트러지면 요청 검증, 인증, 테스트 기준이 서로 다른 전제를 갖게 됩니다.
학생은 이전 시퀀스 완료 후 다음 시퀀스 implementation 브랜치로 이동합니다.

## 05 시퀀스 내부 단계

05는 별도 레포나 별도 시퀀스로 쪼개지 않고 하나의 브랜치 안에서 세 단계로 진행합니다.

| 단계 | 목표 | 외부 의존성 대안 |
| --- | --- | --- |
| 05-A OAuth2 | provider/providerId로 외부 사용자를 내부 사용자와 연결 | mock OAuth profile 또는 local profile |
| 05-B SMTP | 메일 발송 책임을 interface/implementation으로 분리 | fake `RecoveryMailSender` |
| 05-C Account Recovery | 복구 요청, 토큰, 만료, 비밀번호 재설정 흐름 설계 | service 단위 테스트 |

실제 secret 값은 코드, 문서, 테스트에 남기지 않고 환경변수나 로컬 설정으로만 주입합니다.
