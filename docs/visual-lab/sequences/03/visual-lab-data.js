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
    "title": "요청 실패 게이트",
    "instruction": "요청 상태를 선택해 DTO 검증과 비즈니스 예외가 저장 흐름을 어디에서 차단하고 어떤 ErrorResponse를 남기는지 확인하세요.",
    "nodes": {
      "client": {
        "label": "Client",
        "icon": "client",
        "kind": "client",
        "role": "정상 또는 실패 조건의 HTTP 요청을 보냅니다.",
        "boundary": "HTTP 외부"
      },
      "request-gate": {
        "label": "Spring MVC + Bean Validation",
        "icon": "gate",
        "kind": "gate",
        "role": "Controller method body 전에 request binding과 DTO 제약을 확인합니다.",
        "boundary": "요청 형식 경계",
        "codePointIds": ["request-validation"]
      },
      "controller": {
        "label": "PostController",
        "icon": "api",
        "kind": "api",
        "role": "검증을 통과한 요청을 Service에 전달합니다.",
        "boundary": "HTTP 입구"
      },
      "service": {
        "label": "PostService",
        "icon": "service",
        "kind": "service",
        "role": "저장 흐름과 대상 존재 여부를 판단합니다.",
        "boundary": "비즈니스 판단"
      },
      "repository": {
        "label": "PostRepository",
        "icon": "repository",
        "kind": "repository",
        "role": "게시글 저장과 id 조회를 수행합니다.",
        "boundary": "영속성 경계"
      },
      "database": {
        "label": "MySQL",
        "icon": "database",
        "kind": "database",
        "role": "posts row를 저장하고 조회 결과를 반환합니다.",
        "boundary": "영속 저장소"
      },
      "exception-handler": {
        "label": "GlobalExceptionHandler",
        "icon": "handler",
        "kind": "handler",
        "role": "검증·도메인 예외를 상태 코드와 ErrorResponse로 변환합니다.",
        "boundary": "공통 실패 응답",
        "codePointIds": ["global-handler"]
      }
    },
    "scenarios": [
      {
        "id": "valid-create",
        "label": "검증을 통과한 생성",
        "flowId": "valid-create",
        "tone": "recovered",
        "prompt": "정상 요청은 어떤 게이트를 통과한 뒤 기존 DB 저장 흐름으로 들어갈까요?",
        "diagram": {
          "caption": "Spring MVC가 DTO를 바인딩하고 Bean Validation을 통과시킨 요청만 Controller method와 저장 흐름으로 들어갑니다.",
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
                  "concept": "Spring MVC argument resolution",
                  "check": "JSON field가 Request DTO에 바인딩되는지 확인합니다."
                },
                {
                  "from": "request-gate",
                  "to": "controller",
                  "verb": "검증 통과",
                  "payload": "@Valid + DTO constraints",
                  "kind": "response",
                  "concept": "Bean Validation",
                  "check": "Controller method body가 실행 가능한 상태인지 확인합니다.",
                  "codePointIds": ["request-validation"]
                },
                {
                  "from": "controller",
                  "to": "service",
                  "verb": "호출",
                  "payload": "create(validated request)",
                  "kind": "call",
                  "concept": "검증 책임 분리",
                  "check": "Service가 request null/blank를 다시 검사하지 않는지 확인합니다."
                },
                {
                  "from": "service",
                  "to": "repository",
                  "verb": "저장",
                  "payload": "save(PostEntity)",
                  "kind": "persist"
                },
                {
                  "from": "repository",
                  "to": "database",
                  "verb": "영속화",
                  "payload": "INSERT posts row",
                  "kind": "persist",
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
                  "kind": "response"
                },
                {
                  "from": "repository",
                  "to": "service",
                  "verb": "반환",
                  "payload": "saved PostEntity",
                  "kind": "response"
                },
                {
                  "from": "service",
                  "to": "controller",
                  "verb": "변환",
                  "payload": "PostEntity → PostResponse",
                  "kind": "transform"
                },
                {
                  "from": "controller",
                  "to": "client",
                  "verb": "응답",
                  "payload": "201 Created + PostResponse",
                  "kind": "response",
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
                  "concept": "invalid Request DTO",
                  "check": "빈 title 조건을 확인합니다."
                },
                {
                  "from": "request-gate",
                  "to": "exception-handler",
                  "verb": "던짐",
                  "payload": "MethodArgumentNotValidException",
                  "kind": "failure",
                  "concept": "Bean Validation failure",
                  "check": "Controller method body가 실행되지 않는지 확인합니다.",
                  "codePointIds": ["request-validation", "global-handler"]
                },
                {
                  "from": "exception-handler",
                  "to": "client",
                  "verb": "응답",
                  "payload": "400 ErrorResponse { VALIDATION_ERROR, errors }",
                  "kind": "response",
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
                  "payload": "GET /posts/{id}",
                  "kind": "request",
                  "concept": "PathVariable binding",
                  "check": "id가 올바른 타입으로 바인딩되는지 확인합니다."
                },
                {
                  "from": "request-gate",
                  "to": "controller",
                  "verb": "전달",
                  "payload": "id",
                  "kind": "transform",
                  "concept": "형식 통과"
                },
                {
                  "from": "controller",
                  "to": "service",
                  "verb": "호출",
                  "payload": "getById(id)",
                  "kind": "call"
                },
                {
                  "from": "service",
                  "to": "repository",
                  "verb": "조회",
                  "payload": "findById(id)",
                  "kind": "call"
                },
                {
                  "from": "repository",
                  "to": "database",
                  "verb": "질의",
                  "payload": "SELECT posts row by id",
                  "kind": "call"
                },
                {
                  "from": "database",
                  "to": "repository",
                  "verb": "반환",
                  "payload": "no row",
                  "kind": "response"
                },
                {
                  "from": "repository",
                  "to": "service",
                  "verb": "반환",
                  "payload": "Optional.empty",
                  "kind": "response",
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
                  "concept": "도메인 예외",
                  "check": "Service가 빈 결과를 정상 PostResponse로 만들지 않는지 확인합니다."
                },
                {
                  "from": "exception-handler",
                  "to": "client",
                  "verb": "응답",
                  "payload": "404 ErrorResponse { POST_NOT_FOUND }",
                  "kind": "response",
                  "concept": "Not Found 응답",
                  "check": "status와 error code를 확인합니다.",
                  "codePointIds": ["global-handler"]
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
          "concept": "Verification",
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
      "concept": "Verification",
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
      "snippet": "data class PostCreateRequest(\n    @field:NotBlank(message = \"title은 비어 있을 수 없습니다.\")\n    val title: String,\n    @field:NotBlank(message = \"content는 비어 있을 수 없습니다.\")\n    val content: String\n)",
      "explanation": "형식 오류는 Service와 DB까지 내려가기 전에 요청 입구에서 멈춥니다.",
      "check": "빈 title 요청이 저장 로직까지 내려가지 않는지 확인합니다."
    },
    {
      "id": "global-handler",
      "title": "전역 handler는 실패를 같은 응답 형식으로 바꿉니다",
      "file": "src/main/kotlin/com/andi/rest_crud/exception/GlobalExceptionHandler.kt",
      "language": "kotlin",
      "snippet": "@ExceptionHandler(MethodArgumentNotValidException::class)\n@ResponseStatus(HttpStatus.BAD_REQUEST)\nfun handleValidationException(exception: MethodArgumentNotValidException): ErrorResponse {\n    val errors = exception.bindingResult.fieldErrors\n        .associate { fieldError ->\n            fieldError.field to (fieldError.defaultMessage ?: \"잘못된 요청입니다.\")\n        }\n\n    return ErrorResponse(\n        code = \"VALIDATION_ERROR\",\n        message = \"입력값 검증에 실패했습니다.\",\n        errors = errors\n    )\n}",
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
