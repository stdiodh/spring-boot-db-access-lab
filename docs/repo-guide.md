# 레포 가이드

## 이 레포의 역할

이 레포는 A&I 백엔드 커리큘럼 안에서
DB 저장, 요청 안전성, 인증/JWT까지 이어지는 흐름을 실습하는 토픽 레포입니다.

한 레포 안에서 아래 시퀀스가 순서대로 이어집니다.

1. `02`: MySQL 기반 CRUD와 계층 분리
2. `03`: DTO, Validation, 예외 응답
3. `04`: 회원가입, 로그인, JWT

## 공통 실행 기준

- 런타임 DB는 MySQL을 사용합니다.
- 테스트는 H2 in-memory DB를 사용합니다.
- Swagger UI 기본 경로는 `http://localhost:8080/swagger`입니다.
- 시퀀스별 로컬 DB 실행은 각 브랜치의 `compose.yaml` 기준으로 맞춥니다.

## 이 레포 안에서 학생이 보게 되는 공통 구조

- `README.md`: 현재 브랜치 소개
- `docs/theory.md`: 왜 이 주제가 필요한지 설명
- `docs/implementation.md`: 학생이 손으로 칠 순서
- `docs/answer-guide.md`: 강사용 비교 가이드
- `docs/checklist.md`: 학생/강사 체크리스트
- `docs/assets.md`: 미리 제공하는 것 정리

단, 위 구조는 `NN-implementation`, `NN-answer` 브랜치에서만 실습용으로 보입니다.
`main` 브랜치는 안내 브랜치이므로 레포 운영 문서만 둡니다.

## 학습 순서

1. `02`에서 DB 저장과 계층 분리를 익힙니다.
2. `03`에서 요청을 안전하게 받는 흐름을 붙입니다.
3. `04`에서 로그인 이후 요청을 구분하는 인증 흐름을 붙입니다.

이 순서가 흔들리면 문서와 코드도 함께 흔들리므로,
학생은 항상 이전 시퀀스 answer 다음 시퀀스 implementation 순서로 이동해야 합니다.
