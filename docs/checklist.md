# DB Access 통합 체크리스트

## 수업 전 확인

- [ ] 오늘 시퀀스 번호가 `02`~`06` 중 무엇인지 확인했습니다.
- [ ] 해당 `NN-implementation` 브랜치에서 시작했습니다.
- [ ] `docker compose up -d`로 필요한 DB 서비스를 실행했습니다.
- [ ] `./gradlew test`를 실행했습니다.

## 구현 확인

- [ ] `02`: Repository와 Entity가 DB 저장/조회 흐름을 담당합니다.
- [ ] `03`: Validation 실패가 `GlobalExceptionHandler`를 지나 `ErrorResponse`로 내려갑니다.
- [ ] `04`: Sequence 03의 DTO Validation과 요청 본문 `400` 처리 TODO를 다시 구현했습니다.
- [ ] `04`: 로그인 성공 시 JWT가 발급되고 보호 API에서 Bearer token을 읽습니다.
- [ ] `04`: email 정규화, DTO/DB 길이, malformed JSON, 일관된 400/401/403 응답을 확인했습니다.
- [ ] `04`: HS256, issuer, audience, 만료와 subject를 한 번의 parsing으로 검증합니다.
- [ ] `04`: JWT subject=email과 빈 authorities가 교육용 단순화임을 설명할 수 있습니다.
- [ ] `04`: 회원가입과 로그인을 구분하고 Authentication과 Authorization의 책임을 설명할 수 있습니다.
- [ ] `04`: 인증 실습 화면에서 직접 계정을 만들고 로그인한 뒤 `/auth/me`가 같은 email을 반환하는지 확인했습니다.
- [ ] `04`: Refresh Token과 Redis 기반 token 저장·회수가 범위 밖임을 확인했습니다.
- [ ] `05`: verified email만 사용하고, 동일 email 로컬 계정을 자동 연결하지 않으며, JWT를 redirect fragment로 전달합니다.
- [ ] `06`: fixture와 mock으로 정상/실패 케이스를 분리했습니다.

## 마무리 확인

- [ ] 실패한 테스트 이름과 expected/actual을 먼저 읽었습니다.
- [ ] 오늘 시퀀스의 `NN-implementation..NN-answer` diff를 비교했습니다.
- [ ] 다음 시퀀스로 넘어가기 전에 남은 실패 케이스를 기록했습니다.

## 운영 배포 확인

- [ ] 실제 `.env`나 JWT secret을 커밋하지 않았습니다.
- [ ] 기존 email 대소문자 중복과 email/password/title/content/author 길이 초과 데이터를 진단했습니다.
- [ ] `users.email`을 정규화할 때 연결된 `posts.author`도 같은 계정 매핑으로 변경하는 migration 계획을 세웠습니다.
- [ ] 운영 DB 환경 변수와 `JPA_DDL_AUTO=validate` 또는 `none`을 설정했습니다.
- [ ] 운영에서 `SPRINGDOC_ENABLED=false`로 Swagger/OpenAPI를 닫았습니다.
- [ ] single-key 교체가 기존 token을 모두 무효화함을 배포 계획에 반영했습니다.
- [ ] Access Token only의 즉시 회수 불가를 TTL과 재인증 정책에 반영했습니다.
- [ ] 쿠키 저장으로 바꿀 경우 CSRF 정책을 다시 검토합니다.
