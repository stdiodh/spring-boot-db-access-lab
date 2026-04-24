# Google OAuth2 로그인 제공 자료 안내

## 미리 제공하는 것

| 항목 | 왜 제공하는가 | 학생이 직접 작성하지 않는 범위 |
| --- | --- | --- |
| `04-answer` 기반 자체 로그인 + JWT | 이번 시퀀스가 외부 로그인 확장에 집중하게 하기 위해 | 회원가입, 로그인, `/auth/me` 기본 흐름 |
| Google OAuth2 client 설정 자리 | provider 설정 세부값보다 흐름 이해에 집중하게 하기 위해 | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 자리 |
| `User.authProvider`, `User.providerId` | 사용자 연결 구조를 바로 보이게 하기 위해 | Entity 필드 추가 자체 |
| `OAuthUserProfile`, `OAuthLoginResponse` | 핵심 흐름만 직접 구현하게 하기 위해 | DTO/프로필 구조 기본 형태 |
| `auth-demo.html` | 브라우저에서 OAuth redirect 결과를 바로 확인하게 하기 위해 | 화면 레이아웃과 기본 스크립트 |

## 학생이 직접 구현하는 것

- Google 응답에서 `email`, `sub` 읽기
- provider / providerId / email 속성 재구성
- 기존 OAuth 사용자 / 기존 로컬 사용자 / 신규 사용자 분기
- 성공 후 JWT 발급과 redirect 응답 정리

## 운영 메모

- 앱 런타임은 MySQL을 사용합니다.
- 테스트는 H2 in-memory DB를 사용합니다.
- 이번 시퀀스는 `OAuth2` 하나만 메인으로 다룹니다.
- `SMTP`, 아이디 찾기, 비밀번호 재설정은 이후 별도 레포에서 다룹니다.
