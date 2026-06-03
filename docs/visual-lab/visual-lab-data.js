window.visualLabData = {
  sequence: "02-06",
  title: "DB Access to Testing",
  goal: "DB 저장, 안전한 요청 처리, 인증, 외부 연동, 테스트 검증이 어떻게 이어지는지 본다.",
  problem: "메모리 CRUD만으로는 데이터 보존, 잘못된 요청 방어, 로그인 이후 요청 구분, 외부 연동, 테스트 검증을 설명하기 어렵습니다. 이 공통 레포는 02~06 시퀀스를 순서대로 이어서 백엔드 기본 흐름을 확장합니다.",
  concepts: [
    {
      name: "Persistence",
      description: "메모리 대신 DB에 데이터를 저장해 애플리케이션 재시작 후에도 상태를 남긴다.",
    },
    {
      name: "Validation",
      description: "잘못된 요청을 Controller 입구에서 걸러 안전한 응답 흐름으로 연결한다.",
    },
    {
      name: "Authentication",
      description: "로그인 결과를 JWT로 발급하고 보호된 API 요청을 구분한다.",
    },
    {
      name: "Verification",
      description: "테스트로 정상 흐름과 실패 흐름을 검증한다.",
    },
  ],
  flow: [
    {
      id: "seq-02",
      label: "02 DB Access",
      problem: "메모리 저장은 서버가 재시작되면 데이터가 사라집니다.",
      concept: "Entity와 Repository는 DB 저장 흐름을 표현하는 기본 구조입니다.",
      action: "Controller, Service, Repository, Entity가 DB 기반 CRUD로 연결되는 흐름을 확인합니다.",
      check: "DB 저장/조회/수정/삭제가 테스트와 Swagger에서 같은 결과를 내는지 확인합니다.",
    },
    {
      id: "seq-03",
      label: "03 Validation",
      problem: "요청 DTO와 Entity가 섞이면 외부 입력과 내부 저장 구조가 함께 흔들립니다.",
      concept: "Request DTO, Validation, ErrorResponse는 안전한 요청 처리를 구성합니다.",
      action: "잘못된 요청을 Validation과 전역 예외 응답으로 처리하는 흐름을 확인합니다.",
      check: "400 응답과 에러 응답 형식이 일관되게 나오는지 확인합니다.",
    },
    {
      id: "seq-04",
      label: "04 JWT",
      problem: "로그인 이후 요청을 구분하지 못하면 보호된 API와 공개 API의 경계가 흐려집니다.",
      concept: "JWT는 로그인 결과를 이후 요청에서 확인할 수 있게 해주는 토큰입니다.",
      action: "회원가입, 로그인, 토큰 발급, 인증 필터, 보호 API 흐름을 확인합니다.",
      check: "401 인증 실패와 403 인가 실패를 구분해 확인합니다.",
    },
    {
      id: "seq-05",
      label: "05 OAuth2 + SMTP",
      problem: "외부 로그인과 메일 발송은 실제 외부 계정 없이도 핵심 서비스 흐름을 먼저 검증해야 합니다.",
      concept: "Provider ID, mail sender interface, reset token은 외부 의존성과 내부 흐름을 나누는 기준입니다.",
      action: "OAuth2 사용자 연결, SMTP 발송 책임, 계정 복구 토큰 흐름을 단계별로 확인합니다.",
      check: "secret 값이 코드와 문서에 남지 않고 mock 또는 local profile로 테스트되는지 확인합니다.",
    },
    {
      id: "seq-06",
      label: "06 Testing",
      problem: "구현이 끝났다는 말만으로 정상/실패 흐름이 보존된다고 볼 수 없습니다.",
      concept: "Service unit test, fixture, mock은 작은 범위에서 동작을 검증하는 도구입니다.",
      action: "정상 케이스와 실패 케이스를 테스트로 고정하고 실패 메시지를 읽습니다.",
      check: "테스트가 어떤 개념과 실패 조건을 확인하는지 설명합니다.",
    },
  ],
  practice: [
    "02~06 시퀀스 순서를 바꾸지 않고 각 단계의 추가 책임을 설명한다.",
    "DTO, Entity, Service, Repository 책임을 섞지 않는다.",
    "JWT 인증 실패와 인가 실패를 구분한다.",
    "외부 OAuth2/SMTP secret을 코드와 문서에 남기지 않는다.",
    "정상 케이스와 실패 케이스 테스트가 무엇을 검증하는지 말할 수 있다.",
  ],
  mentorHints: [
    "멘티가 다음 시퀀스 내용을 앞당기면 manifest와 sequence 문서 기준으로 범위를 되돌립니다.",
    "정답을 직접 제시하기보다 현재 단계의 책임이 Controller, Service, Repository, 외부 의존성, 테스트 중 어디에 있는지 나누게 합니다.",
    "05는 05-A/B/C를 하나의 시퀀스 내부 단계로 다루고, 별도 시퀀스로 쪼개지 않습니다.",
  ],
};
