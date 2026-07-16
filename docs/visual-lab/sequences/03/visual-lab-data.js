window.visualLabData = {
  "kind": "sequence",
  "sequence": "03",
  "title": "Validation",
  "subtitle": "Safe request handling",
  "goal": "요청 DTO 검증, 비즈니스 예외, 전역 실패 응답을 분리해 안전한 API 실패 흐름을 이해합니다.",
  "problem": "성공 흐름만 설계하면 잘못된 요청, 없는 데이터, 실패 응답 형식이 요청마다 제각각이 됩니다.",
  "repo": {
    "name": "spring-boot-db-access-lab",
    "path": "spring-boot-db-access-lab"
  },
  "defaultSequence": "03",
  "workbench": {
    "kind": "gate",
    "title": "잘못된 요청이 멈추는 경계",
    "instruction": "요청 상태를 선택해 DTO 검증과 비즈니스 예외가 저장 흐름을 어디에서 차단하고 어떤 ErrorResponse를 남기는지 확인하세요.",
    "visual": {
      "src": "../../assets/diagrams/03-request-gates.svg",
      "alt": "요청 형식 검증과 Service 도메인 판단이 각각 400과 404 실패 경로를 만드는 게이트 지도",
      "caption": "입력 형식 실패와 대상 부재 실패가 서로 다른 책임에서 멈춥니다."
    },
    "terms": [
      {
        "term": "Validation",
        "meaning": "요청 DTO의 필수 값과 형식을 Service 진입 전에 검사하는 과정입니다."
      },
      {
        "term": "GlobalExceptionHandler",
        "meaning": "여러 실패를 일관된 HTTP 오류 응답으로 바꾸는 공통 경계입니다."
      },
      {
        "term": "400 / 404",
        "meaning": "400은 요청 형식 문제, 404는 찾는 대상이 없음을 나타내는 응답 상태입니다."
      }
    ],
    "comparison": {
      "label": "실패가 멈추는 두 게이트",
      "left": {
        "title": "Validation · 400",
        "body": "요청 값이 제약을 어기면 Service와 DB에 닿기 전에 차단합니다."
      },
      "right": {
        "title": "도메인 조회 · 404",
        "body": "형식은 맞지만 대상이 없으면 Service 판단에서 DB 변경 없이 실패합니다."
      }
    },
    "nodes": {
      "client": {
        "label": "Client",
        "icon": "client",
        "kind": "client",
        "role": "정상 또는 실패 조건의 HTTP 요청을 보냅니다.",
        "systemLayer": "outside",
        "boundary": "HTTP 외부"
      },
      "request-gate": {
        "label": "Spring MVC request binding",
        "icon": "gate",
        "kind": "gate",
        "role": "body 또는 path variable을 바인딩하고 `@Valid` DTO에만 Bean Validation을 적용합니다.",
        "systemLayer": "interface",
        "boundary": "요청 형식 경계",
        "codePointIds": ["request-validation"]
      },
      "controller": {
        "label": "PostController",
        "icon": "api",
        "kind": "api",
        "role": "검증을 통과한 요청을 Service에 전달합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP 입구"
      },
      "service": {
        "label": "PostService",
        "icon": "service",
        "kind": "service",
        "role": "저장 흐름과 대상 존재 여부를 판단합니다.",
        "systemLayer": "application",
        "boundary": "비즈니스 판단"
      },
      "repository": {
        "label": "PostRepository",
        "icon": "repository",
        "kind": "repository",
        "role": "게시글 저장과 id 조회를 수행합니다.",
        "systemLayer": "resource",
        "boundary": "영속성 경계"
      },
      "database": {
        "label": "MySQL",
        "icon": "database",
        "kind": "database",
        "role": "posts row를 저장하고 조회 결과를 반환합니다.",
        "systemLayer": "resource",
        "boundary": "영속 저장소"
      },
      "exception-handler": {
        "label": "GlobalExceptionHandler",
        "icon": "handler",
        "kind": "handler",
        "role": "검증·도메인 예외를 상태 코드와 ErrorResponse로 변환합니다.",
        "systemLayer": "interface",
        "boundary": "공통 실패 응답",
        "codePointIds": ["global-handler"]
      }
    },
    "scenarios": [
      {
        "id": "valid-create",
        "label": "title·content·author가 채워진 POST",
        "flowId": "valid-create",
        "tone": "recovered",
        "prompt": "title과 content가 채워진 POST 요청은 저장 전에 어느 경계를 먼저 만날까요?",
        "observationTitle": "유효한 title과 content가 Validation gate를 통과해 저장되는가?",
        "reflection": {
          "prompt": "유효한 요청이 Validation에서 DB 저장까지 진행되는 조건을 적어 보세요.",
          "hint": "모든 제약 통과가 Service 호출과 INSERT를 허용하는 gate입니다."
        },
        "theoryRef": "../../../theory.md#seq-03",
        "prediction": {
          "prompt": "이 입력은 DB 저장 전에 어떤 순서로 처리될까요?",
          "options": [
            {
              "id": "save-before-validation",
              "label": "DB 저장 뒤 Validation을 확인한다"
            },
            {
              "id": "validation-then-service",
              "label": "Validation 통과 뒤 Service 저장 흐름으로 간다"
            }
          ],
          "answer": "validation-then-service",
          "explanation": "요청 형식을 먼저 검증해야 잘못된 입력이 Service와 DB 변경으로 이어지지 않습니다."
        },
        "diagram": {
          "caption": "Spring MVC가 세 필드 DTO를 바인딩하고 Bean Validation을 통과시킨 요청만 Controller method와 저장 흐름으로 들어갑니다.",
          "lanes": [
            {
              "id": "valid-request",
              "label": "요청 검증과 저장",
              "description": "정상 JSON이 DTO 제약을 통과해 기존 DB 저장 흐름으로 이어집니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "request-gate",
                  "verb": "요청·바인딩",
                  "payload": "POST /posts + JSON → PostCreateRequest",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "POST /posts + JSON → PostCreateRequest",
                    "before": "Client: POST /posts + JSON → PostCreateRequest 전송 준비",
                    "after": "Spring MVC request binding: POST /posts + JSON → PostCreateRequest 수신"
                  },
                  "evidenceScope": "manual",
                  "concept": "Spring MVC argument resolution",
                  "check": "JSON field가 Request DTO에 바인딩되는지 확인합니다."
                },
                {
                  "from": "request-gate",
                  "to": "controller",
                  "verb": "검증 통과",
                  "payload": "@Valid + title/content/author constraints 통과",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "@Valid + title/content/author constraints 통과",
                    "before": "PostController method: 세 필드 제약 통과 여부가 정해지지 않음",
                    "after": "PostController method: title·content·author가 모두 non-blank인 DTO로 진입"
                  },
                  "evidenceScope": "code",
                  "concept": "Bean Validation",
                  "check": "Controller method body가 실행 가능한 상태인지 확인합니다.",
                  "codePointIds": [
                    "request-validation"
                  ]
                },
                {
                  "from": "controller",
                  "to": "service",
                  "verb": "호출",
                  "payload": "create(validated request)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "create(validated request)",
                    "before": "PostController: method argument create(validated request) 구성",
                    "after": "PostService: create(validated request) method 진입"
                  },
                  "evidenceScope": "code",
                  "concept": "검증 책임 분리",
                  "check": "Service가 request null/blank를 다시 검사하지 않는지 확인합니다."
                },
                {
                  "from": "service",
                  "to": "repository",
                  "verb": "저장",
                  "payload": "save(PostEntity)",
                  "kind": "persist",
                  "effect": {
                    "kind": "persist",
                    "subject": "save(PostEntity)",
                    "before": "PostRepository: 저장할 Entity는 있으나 DB 반영 전",
                    "after": "PostRepository: Entity save가 영속성 경계에 전달됨"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "repository",
                  "to": "database",
                  "verb": "영속화",
                  "payload": "INSERT posts row",
                  "kind": "persist",
                  "effect": {
                    "kind": "persist",
                    "subject": "INSERT posts row",
                    "before": "MySQL posts table: 생성 요청 row 0건",
                    "after": "MySQL posts table: 생성 id를 가진 row 1건"
                  },
                  "evidenceScope": "runtime",
                  "check": "정상 요청만 DB row로 이어지는지 확인합니다."
                }
              ]
            },
            {
              "id": "valid-response",
              "label": "정상 응답",
              "description": "저장 결과를 Response DTO로 변환해 Client로 돌려줍니다.",
              "steps": [
                {
                  "from": "database",
                  "to": "repository",
                  "verb": "반환",
                  "payload": "persisted row + id",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "persisted row + id",
                    "before": "PostRepository: id 없는 생성 Entity를 저장 중",
                    "after": "PostRepository: MySQL 생성 id를 가진 persisted Entity 확보"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "repository",
                  "to": "service",
                  "verb": "반환",
                  "payload": "saved PostEntity",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "saved PostEntity",
                    "before": "PostService: id가 확정된 Post 없음",
                    "after": "PostService: 새 id가 있는 saved Post 확보"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "service",
                  "to": "controller",
                  "verb": "변환",
                  "payload": "PostEntity → PostResponse",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "PostEntity → PostResponse",
                    "before": "PostService: PostEntity",
                    "after": "PostController: PostResponse"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "controller",
                  "to": "client",
                  "verb": "응답",
                  "payload": "201 Created + PostResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "201 Created + PostResponse",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 201 Created + PostResponse"
                  },
                  "evidenceScope": "runtime",
                  "check": "Swagger 정상 응답과 DB row를 확인합니다."
                }
              ]
            }
          ]
        },
        "route": [
          "Client",
          "PostController",
          "Validation",
          "PostService",
          "PostRepository",
          "MySQL",
          "PostResponse"
        ],
        "snapshot": [
          { "label": "Request DTO", "value": "필수 값 충족" },
          { "label": "Validation", "value": "통과", "tone": "recovered" },
          { "label": "저장 흐름", "value": "실행" }
        ],
        "evidence": "Swagger 정상 생성 응답과 DB 저장 결과로 Validation 통과 이후의 흐름을 확인합니다.",
        "outcome": "형식 검증을 통과한 요청만 Service의 저장 판단으로 전달됩니다."
      },
      {
        "id": "empty-title",
        "label": "빈 title 요청",
        "flowId": "failure-flow",
        "tone": "blocked",
        "prompt": "빈 필수 값은 저장 계층에 닿기 전에 어느 게이트에서 멈춰야 할까요?",
        "observationTitle": "빈 title이 Service 호출 전에 400으로 끝나는가?",
        "reflection": {
          "prompt": "필수 값 위반이 DB 변경을 막고 400 응답을 만드는 규칙은 무엇인가요?",
          "hint": "`@NotBlank` 실패, Validation 예외, 전역 handler 응답을 순서대로 연결하세요."
        },
        "theoryRef": "../../../theory.md#seq-03",
        "prediction": {
          "prompt": "빈 title 요청은 어디까지 도달해야 할까요?",
          "options": [
            {
              "id": "database",
              "label": "Service와 Repository를 지나 DB에서 실패한다"
            },
            {
              "id": "validation",
              "label": "Controller 진입 전후의 Validation 경계에서 멈춘다"
            }
          ],
          "answer": "validation",
          "explanation": "@Valid가 DTO 제약 위반을 감지하면 Service와 DB 저장 로직은 실행되지 않습니다."
        },
        "diagram": {
          "caption": "빈 필수 값은 Controller method body와 Service에 도달하기 전에 검증 예외로 바뀌어 400 ErrorResponse로 돌아갑니다.",
          "lanes": [
            {
              "id": "validation-failure-return",
              "label": "DTO 검증 실패 반환",
              "description": "요청 형식 경계에서 실패하고 공통 handler가 오류 응답을 만듭니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "request-gate",
                  "verb": "요청·바인딩",
                  "payload": "POST /posts + { title: blank }",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "POST /posts + { title: blank }",
                    "before": "Client: POST /posts + { title: blank } 전송 준비",
                    "after": "Spring MVC request binding: POST /posts + { title: blank } 수신"
                  },
                  "evidenceScope": "manual",
                  "concept": "invalid Request DTO",
                  "check": "빈 title 조건을 확인합니다."
                },
                {
                  "from": "request-gate",
                  "to": "exception-handler",
                  "verb": "던짐",
                  "payload": "MethodArgumentNotValidException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "MethodArgumentNotValidException",
                    "before": "PostController method와 DB INSERT가 실행 가능한 후보 상태",
                    "after": "DTO 제약 실패로 Controller method·Service·DB INSERT 미도달"
                  },
                  "evidenceScope": "code",
                  "concept": "Bean Validation failure",
                  "check": "Controller method body가 실행되지 않는지 확인합니다.",
                  "codePointIds": [
                    "request-validation",
                    "global-handler"
                  ]
                },
                {
                  "from": "exception-handler",
                  "to": "client",
                  "verb": "응답",
                  "payload": "400 ErrorResponse { VALIDATION_ERROR, errors }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "400 ErrorResponse { VALIDATION_ERROR, errors }",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 400 ErrorResponse { VALIDATION_ERROR, errors }"
                  },
                  "evidenceScope": "runtime",
                  "concept": "일관된 실패 응답",
                  "check": "status, code, field errors를 확인합니다."
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "PostController method body",
              "reason": "argument validation에서 실패해 호출되지 않습니다."
            },
            {
              "label": "PostService / Repository / MySQL mutation",
              "reason": "요청 형식 게이트에서 차단되어 저장 흐름이 시작되지 않습니다."
            }
          ]
        },
        "route": [
          "Client",
          "PostController",
          "Validation",
          "PostService",
          "PostRepository",
          "MySQL"
        ],
        "snapshot": [
          { "label": "Request", "value": "빈 title", "tone": "blocked" },
          { "label": "Response", "value": "400 Bad Request" },
          { "label": "DB 저장", "value": "실행하지 않음" }
        ],
        "evidence": "Request DTO 제약과 Controller의 @Valid가 실패 정보를 GlobalExceptionHandler의 ErrorResponse로 바꾸는지 확인합니다.",
        "outcome": "잘못된 요청은 Validation에서 차단되고 Service와 DB 저장 로직에 진입하지 않습니다.",
        "stopAfter": 2
      },
      {
        "id": "missing-post",
        "label": "없는 게시글 요청",
        "flowId": "failure-flow",
        "tone": "blocked",
        "prompt": "형식은 맞지만 대상이 없다면 DTO 검증과 다른 어느 책임에서 실패해야 할까요?",
        "observationTitle": "형식이 맞아도 조회 row가 없으면 404가 되는가?",
        "reflection": {
          "prompt": "Validation 400과 대상 없음 404를 실패 위치로 구분해 보세요.",
          "hint": "400은 요청 binding 경계, 404는 Repository 조회 이후의 대상 존재 경계입니다."
        },
        "theoryRef": "../../../theory.md#seq-03",
        "prediction": {
          "prompt": "형식이 맞는 요청에서 게시글 id만 없다면 어떤 실패로 구분할까요?",
          "options": [
            {
              "id": "bad-request",
              "label": "Validation의 400 실패"
            },
            {
              "id": "not-found",
              "label": "Service 조회 판단의 404 실패"
            }
          ],
          "answer": "not-found",
          "explanation": "요청 형식은 유효하므로 Repository 조회 결과를 해석하는 도메인 책임에서 실패합니다."
        },
        "diagram": {
          "caption": "형식이 맞는 요청도 id에 해당하는 row가 없으면 Service가 도메인 예외를 만들고 handler가 404 ErrorResponse로 변환합니다.",
          "lanes": [
            {
              "id": "missing-post-lookup",
              "label": "정상 형식의 조회",
              "description": "path variable을 바인딩한 뒤 Repository와 DB에서 대상을 찾습니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "request-gate",
                  "verb": "요청·바인딩",
                  "payload": "GET /posts/{id} + path variable binding",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "GET /posts/{id} + path variable binding",
                    "before": "Client: GET /posts/{id} + path variable binding 전송 준비",
                    "after": "Spring MVC request binding: GET /posts/{id} + path variable binding 수신"
                  },
                  "evidenceScope": "manual",
                  "concept": "Spring MVC type conversion",
                  "check": "`@PathVariable Long` 변환이 DTO Bean Validation과 다른 경계임을 확인합니다."
                },
                {
                  "from": "request-gate",
                  "to": "controller",
                  "verb": "전달",
                  "payload": "id",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "id",
                    "before": "Spring MVC: path 문자열을 Long으로 바꾸기 전",
                    "after": "PostController: Long id argument 사용 가능"
                  },
                  "evidenceScope": "code",
                  "concept": "PathVariable Long binding"
                },
                {
                  "from": "controller",
                  "to": "service",
                  "verb": "호출",
                  "payload": "getById(id)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "getById(id)",
                    "before": "PostController: method argument getById(id) 구성",
                    "after": "PostService: getById(id) method 진입"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "service",
                  "to": "repository",
                  "verb": "조회",
                  "payload": "findById(id)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "findById(id)",
                    "before": "PostService: findById(id)에 사용할 id 또는 email 보유",
                    "after": "PostRepository: findById(id) 조회 실행"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "repository",
                  "to": "database",
                  "verb": "질의",
                  "payload": "SELECT posts row by id",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "SELECT posts row by id",
                    "before": "PostRepository: SELECT posts row by id에 사용할 id 또는 email 보유",
                    "after": "MySQL: SELECT posts row by id 조회 실행"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "database",
                  "to": "repository",
                  "verb": "반환",
                  "payload": "no row",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "no row",
                    "before": "PostRepository: SELECT 결과 건수 미확정",
                    "after": "PostRepository: SELECT 결과 0 rows"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "repository",
                  "to": "service",
                  "verb": "반환",
                  "payload": "Optional.empty",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "Optional.empty",
                    "before": "PostService: 대상 존재 여부 미확정",
                    "after": "PostService: Optional.empty로 대상 없음 확정"
                  },
                  "evidenceScope": "code",
                  "check": "형식 문제가 아니라 대상 부재임을 확인합니다."
                }
              ]
            },
            {
              "id": "missing-post-error",
              "label": "도메인 실패 반환",
              "description": "Service의 존재 여부 판단이 404 공통 응답으로 돌아갑니다.",
              "steps": [
                {
                  "from": "service",
                  "to": "exception-handler",
                  "verb": "던짐",
                  "payload": "PostNotFoundException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "PostNotFoundException",
                    "before": "PostService: Optional.empty를 받은 조회 흐름",
                    "after": "PostNotFoundException 발생; PostResponse 생성 없이 handler로 이동"
                  },
                  "evidenceScope": "code",
                  "concept": "도메인 예외",
                  "check": "Service가 빈 결과를 정상 PostResponse로 만들지 않는지 확인합니다."
                },
                {
                  "from": "exception-handler",
                  "to": "client",
                  "verb": "응답",
                  "payload": "404 ErrorResponse { POST_NOT_FOUND }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "404 ErrorResponse { POST_NOT_FOUND }",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 404 ErrorResponse { POST_NOT_FOUND }"
                  },
                  "evidenceScope": "runtime",
                  "concept": "Not Found 응답",
                  "check": "status와 error code를 확인합니다.",
                  "codePointIds": [
                    "global-handler"
                  ]
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "DB mutation",
              "reason": "조회 결과가 없어 수정·삭제·저장은 실행되지 않습니다."
            }
          ]
        },
        "route": [
          "Client",
          "PostController",
          "Validation",
          "PostService",
          "PostRepository",
          "DB mutation"
        ],
        "snapshot": [
          { "label": "Validation", "value": "통과" },
          { "label": "조회 결과", "value": "대상 없음", "tone": "blocked" },
          { "label": "Response", "value": "공통 ErrorResponse" }
        ],
        "evidence": "Repository 조회 결과가 없을 때 Service의 도메인 예외가 GlobalExceptionHandler로 전달되는지 확인합니다.",
        "outcome": "요청 형식 문제가 아닌 비즈니스 실패로 구분하고 DB 변경 없이 일관된 실패 응답을 반환합니다.",
        "stopAfter": 4
      }
    ]
  },
  "actors": [
    {
      "id": "client",
      "label": "Client",
      "kind": "client"
    },
    {
      "id": "controller",
      "label": "PostController",
      "kind": "server"
    },
    {
      "id": "validation",
      "label": "Validation",
      "kind": "logic"
    },
    {
      "id": "service",
      "label": "PostService",
      "kind": "logic"
    },
    {
      "id": "handler",
      "label": "GlobalExceptionHandler",
      "kind": "server"
    }
  ],
  "flows": [
    {
      "id": "valid-create",
      "title": "정상 생성 요청 흐름",
      "summary": "정상 요청은 DTO 검증을 통과한 뒤 기존 DB CRUD 흐름으로 들어갑니다.",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "Valid PostCreateRequest",
          "owner": "PostController",
          "action": "request body를 검증 대상 DTO로 받습니다.",
          "output": "Validated request",
          "note": "Controller 입구에서 형식 검증이 시작됩니다.",
          "id": "valid-create-step-1",
          "from": "Client",
          "to": "PostController",
          "message": "request body를 검증 대상 DTO로 받습니다.",
          "messageKind": "request",
          "problem": "Valid PostCreateRequest",
          "concept": "PostController",
          "check": "Validated request",
          "codePointIds": [
            "request-validation",
            "global-handler"
          ]
        },
        {
          "order": 2,
          "actor": "PostController",
          "input": "Validated request",
          "owner": "Validation",
          "action": "필수 값과 기본 형식을 확인합니다.",
          "output": "Pass",
          "note": "정상 흐름에서는 실패 handler가 호출되지 않습니다.",
          "id": "valid-create-step-2",
          "from": "PostController",
          "to": "Validation",
          "message": "필수 값과 기본 형식을 확인합니다.",
          "messageKind": "request",
          "problem": "Validated request",
          "concept": "Validation",
          "check": "Pass",
          "codePointIds": [
            "global-handler",
            "request-validation"
          ]
        },
        {
          "order": 3,
          "actor": "PostController",
          "input": "Pass",
          "owner": "PostService",
          "action": "기존 생성/저장 흐름을 실행합니다.",
          "output": "PostResponse",
          "note": "Validation은 정상 CRUD 흐름을 대체하지 않고 앞에서 지켜줍니다.",
          "id": "valid-create-step-3",
          "from": "PostController",
          "to": "PostService",
          "message": "기존 생성/저장 흐름을 실행합니다.",
          "messageKind": "response",
          "problem": "Pass",
          "concept": "PostService",
          "check": "PostResponse",
          "codePointIds": [
            "request-validation",
            "global-handler"
          ]
        },
        {
          "id": "valid-create-check-4",
          "order": 4,
          "actor": "PostService",
          "owner": "확인 지점",
          "from": "PostService",
          "to": "확인 지점",
          "message": "결과와 실패 지점을 확인합니다.",
          "messageKind": "response",
          "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
          "concept": "실패 응답 확인",
          "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
          "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
          "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
          "codePointIds": [
            "global-handler"
          ]
        }
      ],
      "bandKind": "scenario"
    },
    {
      "id": "failure-flow",
      "title": "Validation/비즈니스 실패 흐름",
      "summary": "형식 오류는 Service 전에 멈추고, 비즈니스 실패는 Service에서 의미 있는 예외로 구분합니다.",
      "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as PostController\n  participant Validation as Validation\n  participant Service as PostService\n  participant Handler as GlobalExceptionHandler\n  Client->>Controller: invalid request\n  Controller->>Validation: validate request DTO\n  Validation-->>Handler: validation failure\n  Handler-->>Client: ErrorResponse\n  Client->>Controller: request for missing id\n  Controller->>Service: getById(id)\n  Service-->>Handler: domain exception\n  Handler-->>Client: ErrorResponse",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "Invalid request body",
          "owner": "Validation",
          "action": "DTO annotation과 Controller 검증으로 요청 형식 오류를 잡습니다.",
          "output": "Validation failure",
          "note": "빈 제목 같은 문제는 DB까지 내려갈 필요가 없습니다.",
          "id": "failure-flow-step-1",
          "from": "Client",
          "to": "Validation",
          "message": "DTO annotation과 Controller 검증으로 요청 형식 오류를 잡습니다.",
          "messageKind": "error",
          "problem": "Invalid request body",
          "concept": "Validation",
          "check": "Validation failure",
          "codePointIds": [
            "request-validation",
            "global-handler"
          ]
        },
        {
          "order": 2,
          "actor": "Validation",
          "input": "Failure details",
          "owner": "GlobalExceptionHandler",
          "action": "실패 정보를 ErrorResponse 형식으로 바꿉니다.",
          "output": "400 Bad Request",
          "note": "클라이언트가 같은 구조로 실패를 읽을 수 있습니다.",
          "id": "failure-flow-step-2",
          "from": "Validation",
          "to": "GlobalExceptionHandler",
          "message": "실패 정보를 ErrorResponse 형식으로 바꿉니다.",
          "messageKind": "error",
          "problem": "Failure details",
          "concept": "GlobalExceptionHandler",
          "check": "400 Bad Request",
          "codePointIds": [
            "global-handler",
            "request-validation"
          ]
        },
        {
          "order": 3,
          "actor": "Client",
          "input": "Missing id request",
          "owner": "PostService",
          "action": "id 조회 결과가 없으면 비즈니스 예외로 구분합니다.",
          "output": "Domain exception",
          "note": "형식 문제와 비즈니스 실패는 멈추는 위치가 다릅니다.",
          "id": "failure-flow-step-3",
          "from": "Client",
          "to": "PostService",
          "message": "id 조회 결과가 없으면 비즈니스 예외로 구분합니다.",
          "messageKind": "error",
          "problem": "Missing id request",
          "concept": "PostService",
          "check": "Domain exception",
          "codePointIds": [
            "request-validation",
            "global-handler"
          ]
        },
        {
          "order": 4,
          "actor": "PostService",
          "input": "Domain exception",
          "owner": "GlobalExceptionHandler",
          "action": "예외를 공통 실패 응답으로 변환합니다.",
          "output": "ErrorResponse",
          "note": "실패 응답은 숨기는 것이 아니라 일관되게 설명하는 구조입니다.",
          "id": "failure-flow-step-4",
          "from": "PostService",
          "to": "GlobalExceptionHandler",
          "message": "예외를 공통 실패 응답으로 변환합니다.",
          "messageKind": "error",
          "problem": "Domain exception",
          "concept": "GlobalExceptionHandler",
          "check": "ErrorResponse",
          "codePointIds": [
            "global-handler",
            "request-validation"
          ]
        }
      ],
      "bandKind": "case"
    }
  ],
  "flow": [
    {
      "id": "valid-create-step-1",
      "label": "PostController",
      "problem": "Valid PostCreateRequest",
      "concept": "PostController",
      "action": "request body를 검증 대상 DTO로 받습니다.",
      "check": "Validated request",
      "codePointIds": [
        "request-validation",
        "global-handler"
      ]
    },
    {
      "id": "valid-create-step-2",
      "label": "Validation",
      "problem": "Validated request",
      "concept": "Validation",
      "action": "필수 값과 기본 형식을 확인합니다.",
      "check": "Pass",
      "codePointIds": [
        "global-handler",
        "request-validation"
      ]
    },
    {
      "id": "valid-create-step-3",
      "label": "PostService",
      "problem": "Pass",
      "concept": "PostService",
      "action": "기존 생성/저장 흐름을 실행합니다.",
      "check": "PostResponse",
      "codePointIds": [
        "request-validation",
        "global-handler"
      ]
    },
    {
      "id": "valid-create-check-4",
      "label": "확인 지점",
      "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
      "concept": "실행 결과 확인",
      "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
      "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
      "codePointIds": [
        "global-handler"
      ]
    }
  ],
  "codePoints": [
    {
      "id": "request-validation",
      "title": "Request DTO에서 입력 형식을 먼저 막습니다",
      "file": "src/main/kotlin/com/andi/rest_crud/dto/PostCreateRequest.kt",
      "language": "kotlin",
      "snippet": "// 제목, 본문, 작성자 중 빈 필드는 Service 호출 전에 막습니다.\ndata class PostCreateRequest(\n    @field:NotBlank(message = \"title은 비어 있을 수 없습니다.\") val title: String,\n    @field:NotBlank(message = \"content는 비어 있을 수 없습니다.\") val content: String,\n    @field:NotBlank(message = \"author는 비어 있을 수 없습니다.\") val author: String\n)",
      "explanation": "형식 오류는 Service와 DB까지 내려가기 전에 요청 입구에서 멈춥니다.",
      "check": "빈 title 요청이 저장 로직까지 내려가지 않는지 확인합니다."
    },
    {
      "id": "global-handler",
      "title": "전역 handler는 실패를 같은 응답 형식으로 바꿉니다",
      "file": "src/main/kotlin/com/andi/rest_crud/exception/GlobalExceptionHandler.kt",
      "language": "kotlin",
      "snippet": "// Validation 예외를 field 오류가 있는 400 응답 계약으로 바꿉니다.\n@ExceptionHandler(MethodArgumentNotValidException::class)\n@ResponseStatus(HttpStatus.BAD_REQUEST)\nfun handleValidationException(exception: MethodArgumentNotValidException): ErrorResponse {\n    val errors = exception.bindingResult.fieldErrors\n        .associate { it.field to (it.defaultMessage ?: \"잘못된 요청입니다.\") }\n    return ErrorResponse(\n        code = \"VALIDATION_ERROR\",\n        message = \"입력값 검증에 실패했습니다.\",\n        errors = errors\n    )\n}",
      "explanation": "클라이언트가 실패 이유를 안정적으로 읽도록 에러 응답을 통일합니다.",
      "check": "Validation 실패와 없는 데이터 실패의 응답 code가 구분되는지 봅니다."
    }
  ],
  "concepts": [
    {
      "title": "Validation은 입구 방어입니다",
      "body": "잘못된 요청이 Service와 DB까지 내려가기 전에 멈추게 합니다."
    },
    {
      "title": "비즈니스 예외는 의미를 담습니다",
      "body": "없는 게시글 조회처럼 형식은 맞지만 처리할 수 없는 상황을 구분합니다."
    },
    {
      "title": "ErrorResponse는 실패 계약입니다",
      "body": "클라이언트가 실패 이유를 같은 구조로 읽게 해줍니다."
    },
    {
      "title": "성공과 실패 흐름을 함께 설계합니다",
      "body": "API는 성공 응답만으로 완성되지 않습니다."
    }
  ],
  "practice": [
    "빈 제목 요청은 Service까지 들어가야 하나요?",
    "Validation 실패와 없는 데이터 예외가 멈추는 위치를 구분할 수 있나요?",
    "ErrorResponse를 통일하는 이유를 설명할 수 있나요?",
    "다음 인증 실패도 같은 안전성 기준으로 읽을 수 있나요?"
  ],
  "mentorHints": [],
  "relatedDocs": [
    {
      "label": "이론 정리",
      "href": "../../../theory.md"
    },
    {
      "label": "구현 안내",
      "href": "../../../implementation.md"
    },
    {
      "label": "체크리스트",
      "href": "../../../checklist.md"
    }
  ],
  "relatedCode": [],
  "topic": "Safe request handling",
  "question": "잘못된 요청은 Service와 DB까지 내려가기 전에 어디서 멈춰야 할까?",
  "sourceDocs": [
    {
      "label": "이론 정리",
      "href": "../../../theory.md"
    },
    {
      "label": "구현 안내",
      "href": "../../../implementation.md"
    },
    {
      "label": "체크리스트",
      "href": "../../../checklist.md"
    }
  ],
  "why": {
    "problem": "성공 흐름만 설계하면 잘못된 요청, 없는 데이터, 실패 응답 형식이 요청마다 제각각이 됩니다.",
    "limits": [
      "빈 문자열 같은 형식 문제를 Service 조건문으로만 처리하면 요청 초입 방어가 약해집니다.",
      "없는 데이터 조회와 입력 형식 실패를 같은 실패로 보면 원인 설명이 흐려집니다.",
      "실패 응답 구조가 흔들리면 클라이언트가 실패 이유를 안정적으로 처리하기 어렵습니다."
    ],
    "choice": "Request DTO 검증은 Controller 입구에서, 비즈니스 실패는 Service에서, 응답 변환은 GlobalExceptionHandler에서 맡습니다."
  },
  "overview": [
    "Invalid Request",
    "Validation",
    "GlobalExceptionHandler",
    "ErrorResponse",
    "Valid Request",
    "PostService"
  ],
  "responsibilities": [
    {
      "name": "Request DTO",
      "role": "외부 입력의 기본 형식을 표현하고 검증 기준을 가집니다.",
      "caution": "Entity 검증과 섞지 않습니다."
    },
    {
      "name": "PostController",
      "role": "검증된 요청만 Service로 전달하는 HTTP 입구입니다.",
      "caution": "비즈니스 판단을 과하게 담지 않습니다."
    },
    {
      "name": "PostService",
      "role": "없는 데이터 같은 비즈니스 실패를 의미 있는 예외로 구분합니다.",
      "caution": "입력 형식 검증을 모두 떠안지 않습니다."
    },
    {
      "name": "GlobalExceptionHandler",
      "role": "여러 실패를 일관된 ErrorResponse로 바꿉니다.",
      "caution": "실패 원인을 숨기지 말고 안정된 구조로 정리합니다."
    }
  ],
  "glossary": [
    {
      "term": "Validation",
      "meaning": "요청 DTO의 기본 입력 조건을 확인하는 과정입니다.",
      "caution": "Service의 비즈니스 판단과 같은 위치가 아닙니다."
    },
    {
      "term": "Business exception",
      "meaning": "형식은 맞지만 서비스 규칙상 처리할 수 없는 실패입니다.",
      "caution": "빈 문자열 같은 형식 오류와 구분합니다."
    },
    {
      "term": "ErrorResponse",
      "meaning": "실패 응답의 공통 구조입니다.",
      "caution": "요청마다 다른 모양이면 클라이언트 처리가 어려워집니다."
    },
    {
      "term": "GlobalExceptionHandler",
      "meaning": "예외를 HTTP 실패 응답으로 바꾸는 경계입니다.",
      "caution": "성공 흐름을 처리하는 Service와 역할이 다릅니다."
    }
  ],
  "practical": [
    {
      "title": "실패도 API 설계입니다",
      "body": "클라이언트는 성공보다 실패를 더 자주 복구 로직으로 다룹니다."
    },
    {
      "title": "검증 위치가 중요합니다",
      "body": "입력 형식은 초입에서, 서비스 규칙은 Service에서 멈추게 해야 원인이 분명합니다."
    },
    {
      "title": "상태 코드는 실패 원인을 나눕니다",
      "body": "400, 401, 403, 404를 같은 실패로 처리하면 운영 로그와 사용자 경험이 흐려집니다."
    }
  ],
  "checks": [
    "빈 제목 요청은 Service까지 들어가야 하나요?",
    "Validation 실패와 없는 데이터 예외가 멈추는 위치를 구분할 수 있나요?",
    "ErrorResponse를 통일하는 이유를 설명할 수 있나요?",
    "다음 인증 실패도 같은 안전성 기준으로 읽을 수 있나요?"
  ],
  "next": {
    "id": "04",
    "title": "JWT",
    "reason": "요청 검증과 실패 응답 구조를 통일했다면, 다음에는 로그인과 인증 실패를 같은 관점에서 분리해 봅니다."
  }
};
