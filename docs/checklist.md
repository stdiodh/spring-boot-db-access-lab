# DB Access 통합 체크리스트

## 수업 전 확인

- [ ] 오늘 시퀀스 번호가 `02`~`06` 중 무엇인지 확인했습니다.
- [ ] 해당 `NN-implementation` 브랜치에서 시작했습니다.
- [ ] `docker compose up -d`로 필요한 DB 서비스를 실행했습니다.
- [ ] `./gradlew test`를 실행했습니다.

## 구현 확인

- [ ] `02`: Repository와 Entity가 DB 저장/조회 흐름을 담당합니다.
- [ ] `03`: Validation 실패가 `GlobalExceptionHandler`를 지나 `ErrorResponse`로 내려갑니다.
- [ ] `04`: 로그인 성공 시 JWT가 발급되고 보호 API에서 Bearer token을 읽습니다.
- [ ] `05`: 외부 인증과 계정 복구 책임이 로그인 흐름과 섞이지 않습니다.
- [ ] `06`: fixture와 mock으로 정상/실패 케이스를 분리했습니다.

## 마무리 확인

- [ ] 실패한 테스트 이름과 expected/actual을 먼저 읽었습니다.
- [ ] 오늘 시퀀스의 `NN-implementation..NN-answer` diff를 비교했습니다.
- [ ] 다음 시퀀스로 넘어가기 전에 남은 실패 케이스를 기록했습니다.
