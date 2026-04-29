# 인증과 JWT 제공 자료 안내

## 미리 제공하는 것

| 항목 | 왜 제공하는가 | 학생이 직접 작성하지 않는 범위 |
| --- | --- | --- |
| `03-answer` 기반 요청 검증 / 예외 응답 구조 | 이번 시퀀스가 인증 흐름에 집중하게 하기 위해 | 게시글 CRUD, `ErrorResponse`, 전역 예외 처리 기본 틀 |
| MySQL 실행 설정 | 런타임 DB 기준을 하나로 맞추기 위해 | datasource 기본값, 드라이버 설정, `compose.yaml` |
| 테스트용 H2 설정 | 테스트를 로컬 DB 설치와 분리하기 위해 | `src/test/resources/application.yaml` |
| `User`, `UserRepository`, 응답 DTO | 인증 핵심 흐름만 손으로 치게 하기 위해 | 엔티티 기본 필드, 저장소 선언, 응답 DTO 기본 형태 |
| `PasswordEncoder` Bean | 인코딩 도구 선택보다 흐름 이해에 집중하게 하기 위해 | Bean 등록 자체 |
| JWT 필터 뼈대와 인증 실패 처리 | Security 전체 확장보다 최소 흐름을 보이게 하기 위해 | `JwtAuthenticationFilter`, `CustomAuthenticationEntryPoint` 기본 구조 |
| 인가 확장 예시 문서 | 인증만으로는 부족한 상황을 설명하기 위해 | 역할 체계와 권한 확장을 starter 필수 범위로 강제하지 않음 |

## 학생이 직접 구현하는 것

- `UserSignUpRequest`, `LoginRequest` 검증
- `AuthService`의 회원가입 / 로그인 / 현재 사용자 조회
- `JwtTokenProvider`의 토큰 발급 / email 추출 / 검증
- `SecurityConfig`의 보호 API 지정과 필터 연결
- Swagger에서 토큰 유무 차이를 직접 확인하는 과정
- 로그인 이후 왜 인가 규칙이 더 필요해지는지 문서 기준으로 설명하는 과정

## 운영 메모

- 앱 런타임은 MySQL을 사용합니다.
- 테스트는 H2 in-memory DB를 사용합니다.
- 이번 시퀀스에서는 OAuth2, refresh token, 권한(Role) 확장, 복잡한 인가 정책은 다루지 않습니다.
- 핵심은 "로그인 이후 토큰으로 현재 요청 사용자를 구분한다"입니다.
- 실무 확장 개념인 인가/역할 기반 접근은 문서에서 문제 상황과 해결 코드 예시까지 같이 다룹니다.
