# Google OAuth2와 SMTP 계정 복구 제공 자료 안내

## 미리 제공하는 것

| 항목 | 왜 제공하는가 | 학생이 직접 작성하지 않는 범위 |
| --- | --- | --- |
| `04-answer` 기반 자체 로그인 + JWT | 이번 시퀀스가 확장 흐름에 집중하게 하기 위해 | 기존 로그인, `/auth/me` |
| Google OAuth2 client 설정 자리 | 외부 로그인 흐름 이해에 집중하게 하기 위해 | provider 세부 설정값 |
| SMTP 설정 자리 | 메일 발송 구조 이해에 집중하게 하기 위해 | host/port/username/password 자리 |
| `User.authProvider`, `User.providerId` | 사용자 연결 구조를 바로 보이게 하기 위해 | Entity 필드 자체 |
| `AccountRecoveryController`, `PasswordResetMailRequest` | 메일 요청 입구를 빠르게 보이게 하기 위해 | 컨트롤러 wiring |

## 학생이 직접 구현하는 것

- Google 응답에서 사용자 정보 읽기
- 기존 사용자 / 신규 사용자 분기
- OAuth 성공 후 redirect 응답 정리
- reset 링크 생성
- SMTP 메일 발송 호출

## 이번 문서에서 추가로 이해해야 하는 것

- 왜 `providerId`와 `email`을 함께 봐야 하는가
- 왜 계정 연결 정책 없이 신규 사용자만 만들면 안 되는가
- 왜 존재하지 않는 email 요청을 조용히 처리하는가
- 왜 reset 링크의 `token`을 민감한 값으로 봐야 하는가

## 운영 메모

- 앱 런타임은 MySQL을 사용합니다.
- 테스트는 H2 in-memory DB를 사용합니다.
- SMTP는 현재 시퀀스에서 비밀번호 재설정 메일 요청까지만 다룹니다.
- 실제 비밀번호 변경 완료와 토큰 저장소는 이후 확장 주제로 남깁니다.
