window.visualLabData = {
  "kind": "hub",
  "sequence": "02-06",
  "title": "DB Access Visual Lab",
  "description": "DB 저장, 요청 검증, JWT 인증, 외부 인증/메일, 테스트 검증 흐름을 시퀀스별로 탐색합니다.",
  "repo": {
    "name": "spring-boot-db-access-lab",
    "path": "spring-boot-db-access-lab"
  },
  "visualLabPath": "docs/visual-lab/index.html",
  "visualLabHubPath": "docs/visual-lab/index.html",
  "flow": [
    {
      "id": "seq-02",
      "label": "02 DB Access",
      "problem": "메모리 저장은 서버 재시작 후 데이터가 사라지고 여러 인스턴스가 같은 데이터를 공유하기 어렵습니다.",
      "concept": "Entity, Repository, DB persistence",
      "action": "Request DTO를 Entity로 바꾸고 Repository에 DB 저장을 요청합니다.",
      "check": "저장/조회/수정/삭제가 DB 기준으로 유지되는지 확인합니다."
    },
    {
      "id": "seq-03",
      "label": "03 Validation",
      "problem": "실패 응답이 제각각이면 클라이언트가 실패 이유를 안정적으로 해석하기 어렵습니다.",
      "concept": "Validation, business exception, ErrorResponse",
      "action": "요청 검증과 비즈니스 예외를 나누고 실패 응답 구조를 통일합니다.",
      "check": "400 응답과 없는 데이터 예외가 다른 위치에서 멈추는지 설명합니다."
    },
    {
      "id": "seq-04",
      "label": "04 JWT",
      "problem": "로그인 이후 요청을 구분하지 못하면 공개 API와 보호 API의 경계가 흐려집니다.",
      "concept": "Authentication, JWT issue, token validation",
      "action": "로그인으로 토큰을 발급하고 이후 요청에서 필터가 토큰을 검증합니다.",
      "check": "토큰 없음, 잘못된 토큰, 보호 API 접근 흐름을 구분합니다."
    },
    {
      "id": "seq-05",
      "label": "05 OAuth2 + SMTP",
      "problem": "외부 인증 결과, LOCAL 자격, 메일 수신 결과를 한 상태로 보면 계정 연결과 복구 경계가 무너집니다.",
      "concept": "OAuth2 trust, optional LOCAL credential, hashed reset token, SMTP receiver evidence",
      "action": "검증된 profile과 provider identity를 보존하고 선택적 LOCAL 자격, token commit, SMTP 수락과 수신자 증거를 분리합니다.",
      "check": "계정 충돌에서는 JWT가 없고, LOCAL 등록 뒤에도 Google identity가 유지되며, 200과 받은편지함·원본 헤더 증거가 구분되는지 확인합니다."
    },
    {
      "id": "seq-06",
      "label": "06 Testing",
      "problem": "기능이 늘어날수록 사람이 정상/실패 흐름을 기억으로 확인하기 어렵습니다.",
      "concept": "Service unit test, fixture, mock, assertion",
      "action": "정상 케이스와 실패 케이스를 테스트로 고정합니다.",
      "check": "테스트가 어떤 Service 판단을 검증하는지 설명합니다."
    }
  ],
  "sequences": [
    {
      "sequence": "02",
      "id": "02",
      "title": "DB Access",
      "topic": "Persistence and layered architecture",
      "href": "./sequences/02/index.html",
      "summary": "메모리 CRUD는 왜 DB 기반 CRUD로 이동해야 할까?"
    },
    {
      "sequence": "03",
      "id": "03",
      "title": "Validation",
      "topic": "Safe request handling",
      "href": "./sequences/03/index.html",
      "summary": "잘못된 요청은 Service와 DB까지 내려가기 전에 어디서 멈춰야 할까?"
    },
    {
      "sequence": "04",
      "id": "04",
      "title": "JWT",
      "topic": "Authentication and JWT",
      "href": "./sequences/04/index.html",
      "summary": "로그인 이후 요청은 서버가 어떻게 같은 사용자 요청이라고 판단할까?"
    },
    {
      "sequence": "05",
      "id": "05",
      "title": "OAuth2 + SMTP",
      "topic": "External authentication and account recovery",
      "href": "./sequences/05/index.html",
      "summary": "외부 identity, 선택적 LOCAL 자격, reset token과 메일 수신 증거는 어디서 갈라질까?"
    },
    {
      "sequence": "06",
      "id": "06",
      "title": "Testing",
      "topic": "Testing and verification",
      "href": "./sequences/06/index.html",
      "summary": "기능이 많아진 뒤에도 기존 동작을 어떻게 믿을 수 있을까?"
    }
  ]
};
