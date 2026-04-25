# Spring Boot DB Access Lab

이 레포는 A&I 백엔드 커리큘럼 중
`02. 영속성 저장과 계층 분리`, `03. 안전한 요청 처리`, `04. 인증과 JWT`, `05. Google OAuth2 + SMTP 계정 복구 입문`, `06. 테스트와 검증`
시퀀스를 담는 토픽 레포입니다.

`main` 브랜치는 학생이 바로 실습하는 브랜치가 아니라,
이 레포가 어떤 주제를 담고 있고 어떤 브랜치에서 수업을 진행해야 하는지 안내하는 대표 브랜치입니다.

## 이 레포가 다루는 내용

- `02`: MySQL 기반 CRUD와 계층 분리
- `03`: DTO 분리, Validation, 전역 예외 처리
- `04`: 회원가입, 로그인, JWT, 보호된 API
- `05`: Google OAuth2 로그인, 사용자 연결, SMTP 비밀번호 재설정 메일 요청
- `06`: Service 단위 테스트, fixture, mock, 정상/실패 검증

즉 이 레포는 "DB 저장 -> 안전한 요청 처리 -> 인증과 JWT -> Google OAuth2 + SMTP 계정 복구 입문 -> 테스트와 검증"으로 이어지는
초중반 백엔드 성장 흐름을 한 도메인 안에서 이어서 다룹니다.

## 브랜치 사용 방법

- `main`: 레포 소개와 브랜치 안내
- `02-implementation`, `02-answer`
- `03-implementation`, `03-answer`
- `04-implementation`, `04-answer`
- `05-implementation`, `05-answer`
- `06-implementation`, `06-answer`

학생은 항상 `NN-implementation`에서 시작하고,
강사는 `NN-answer`에서 비교합니다.

예:

```bash
git clone -b 05-implementation https://github.com/stdiodh/spring-boot-db-access-lab.git
cd spring-boot-db-access-lab
```

## 문서 안내

- [레포 가이드](./docs/repo-guide.md)
- [브랜치 가이드](./docs/branch-guide.md)
- [시퀀스 맵](./docs/sequence-map.md)

각 시퀀스의 실제 실습 문서는 해당 브랜치 안에서 확인합니다.

예:
- `03-implementation`의 `docs/theory.md`, `docs/implementation.md`
- `04-answer`의 `docs/answer-guide.md`
- `05-implementation`의 `docs/implementation.md`

## 실행 기준

- 앱 런타임 DB: MySQL
- 테스트 DB: H2 in-memory
- Swagger UI 기본 경로: `http://localhost:8080/swagger`

MySQL이 필요할 때는 각 시퀀스 브랜치의 `compose.yaml`을 사용합니다.

## 현재 정리 상태

| Sequence | Starter | Answer | Status |
| --- | --- | --- | --- |
| 02 | `02-implementation` | `02-answer` | Ready |
| 03 | `03-implementation` | `03-answer` | Ready |
| 04 | `04-implementation` | `04-answer` | Ready |
| 05 | `05-implementation` | `05-answer` | Ready |
| 06 | `06-implementation` | `06-answer` | Ready |

## 이 레포를 어떻게 보면 좋나요

1. 먼저 `main`에서 이 README와 `docs/branch-guide.md`를 읽습니다.
2. 진행할 시퀀스의 `NN-implementation` 브랜치로 이동합니다.
3. 그 브랜치의 `README.md`, `docs/theory.md`, `docs/implementation.md` 순서로 봅니다.
4. 실습 후 `NN-answer` 브랜치와 비교합니다.

## 운영 메모

- 서로 다른 주제가 되면 같은 레포에서 선택형으로 섞지 않고 별도 레포로 분리합니다.
- 이 레포의 `main` 브랜치는 실습 완료본이 아니라 안내 브랜치입니다.
- 시퀀스별 문서는 각 브랜치 안에서 계속 바뀌어야 하며, 이전 시퀀스 문서를 그대로 재사용하면 안 됩니다.
