window.visualLabData = {
  "kind": "sequence",
  "sequence": "02",
  "title": "DB Access",
  "subtitle": "Persistence and layered architecture",
  "goal": "Request DTO가 Entity와 Response DTO로 바뀌고 Repository가 DB 접근을 맡는 흐름을 이해합니다.",
  "problem": "메모리 저장소는 요청/응답 흐름을 배우기에는 좋지만 서버 프로세스 안에만 데이터를 보관합니다.",
  "repo": {
    "name": "spring-boot-db-access-lab",
    "path": "spring-boot-db-access-lab"
  },
  "defaultSequence": "02",
  "workbench": {
    "kind": "persistence",
    "title": "요청이 DB row로 남는 과정",
    "instruction": "CRUD 시나리오를 선택하고 Request DTO가 Entity로 바뀌어 MySQL에 남는 경로와 DB 변경이 멈추는 지점을 확인하세요.",
    "visual": {
      "src": "../../assets/diagrams/02-persistence-boundary.svg",
      "alt": "HTTP 요청이 Service의 DTO·Entity 변환과 Repository 경계를 지나 MySQL row가 되는 흐름",
      "caption": "애플리케이션 처리와 프로세스 밖 영속 저장소의 경계를 추적합니다."
    },
    "terms": [
      {
        "term": "Entity",
        "meaning": "DB table과 매핑되어 저장 상태를 표현하는 객체입니다."
      },
      {
        "term": "Repository",
        "meaning": "Service 대신 Entity 저장·조회 요청을 DB 접근 기술에 연결합니다."
      },
      {
        "term": "영속성",
        "meaning": "애플리케이션 실행이 끝난 뒤에도 데이터를 다시 찾을 수 있는 성질입니다."
      }
    ],
    "comparison": {
      "label": "재시작을 기준으로 보는 저장 경계",
      "left": {
        "title": "메모리 상태",
        "body": "애플리케이션 프로세스 수명에 묶여 재시작 시 초기화됩니다."
      },
      "right": {
        "title": "MySQL row",
        "body": "프로세스 밖 DB에 저장되어 재시작 후 조회에서도 다시 발견됩니다."
      }
    },
    "nodes": {
      "client": {
        "label": "Client",
        "icon": "client",
        "kind": "client",
        "role": "HTTP 요청을 보내고 API 응답을 읽습니다.",
        "systemLayer": "outside",
        "boundary": "HTTP 외부"
      },
      "controller": {
        "label": "PostController",
        "icon": "api",
        "kind": "api",
        "role": "HTTP 요청을 Service 호출과 연결합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP 입구"
      },
      "service": {
        "label": "PostService",
        "icon": "service",
        "kind": "service",
        "role": "DTO와 Entity 변환 및 CRUD 순서를 조립합니다.",
        "systemLayer": "application",
        "boundary": "애플리케이션 처리",
        "codePointIds": ["entity-table", "repository-save"]
      },
      "app-runtime": {
        "label": "Spring Boot process",
        "icon": "service",
        "kind": "service",
        "role": "애플리케이션 인스턴스를 시작하고 종료하며 외부 MySQL과 다시 연결합니다.",
        "systemLayer": "runtime",
        "boundary": "애플리케이션 프로세스"
      },
      "repository": {
        "label": "PostRepository",
        "icon": "repository",
        "kind": "repository",
        "role": "JpaRepository를 통해 Entity 저장과 조회를 요청합니다.",
        "systemLayer": "resource",
        "boundary": "JPA 영속성 경계",
        "codePointIds": ["repository-save"]
      },
      "database": {
        "label": "MySQL",
        "icon": "database",
        "kind": "database",
        "role": "posts table의 row를 애플리케이션 프로세스 밖에 보관합니다.",
        "systemLayer": "resource",
        "boundary": "영속 저장소",
        "codePointIds": ["entity-table"]
      },
      "default-error": {
        "label": "Spring 기본 오류 경로",
        "icon": "handler",
        "kind": "handler",
        "role": "03의 공통 handler를 도입하기 전 처리되지 않은 예외를 HTTP 오류로 전달합니다.",
        "systemLayer": "interface",
        "boundary": "기본 HTTP 오류 경계"
      }
    },
    "scenarios": [
      {
        "id": "persist-post",
        "label": "DB에 게시글 저장",
        "flowId": "create-read",
        "tone": "recovered",
        "prompt": "POST 요청은 어떤 변환과 저장 경계를 지나 MySQL row가 될까요?",
        "observationTitle": "생성 요청이 INSERT와 생성 id를 거쳐 영속 응답이 되는가?",
        "reflection": {
          "prompt": "요청 DTO가 재시작 뒤에도 남는 row가 되는 규칙을 설명해 보세요.",
          "hint": "Entity 변환, Repository 저장, INSERT, 생성 id 반환의 경계를 순서대로 적으세요."
        },
        "theoryRef": "../../../theory.md#seq-02",
        "prediction": {
          "prompt": "POST 요청이 MySQL row가 될 때 중심 변환과 저장 책임은 어디에 있을까요?",
          "options": [
            {
              "id": "controller-sql",
              "label": "Controller가 JSON을 SQL로 직접 바꾼다"
            },
            {
              "id": "service-repository",
              "label": "Service가 DTO를 Entity로 바꾸고 Repository가 저장을 요청한다"
            }
          ],
          "answer": "service-repository",
          "explanation": "Service가 경계 간 모델 변환을 조립하고 Repository가 JPA를 통한 DB 접근을 맡습니다."
        },
        "diagram": {
          "caption": "Service가 Request DTO를 Entity로 바꾸고 Repository가 JPA 저장을 요청해 MySQL에 row를 남깁니다.",
          "lanes": [
            {
              "id": "create-persist",
              "label": "요청과 영속화",
              "description": "HTTP 생성 요청이 JPA 영속성 경계를 지나 INSERT로 이어집니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "controller",
                  "verb": "요청",
                  "payload": "POST /posts + JSON body",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "POST /posts + JSON body",
                    "before": "Client: POST /posts + JSON body 전송 준비",
                    "after": "PostController: POST /posts + JSON body 수신"
                  },
                  "evidenceScope": "manual",
                  "concept": "HTTP request",
                  "check": "Swagger의 method, path, body를 확인합니다."
                },
                {
                  "from": "controller",
                  "to": "service",
                  "verb": "호출",
                  "payload": "create(PostCreateRequest)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "create(PostCreateRequest)",
                    "before": "PostController: method argument create(PostCreateRequest) 구성",
                    "after": "PostService: create(PostCreateRequest) method 진입"
                  },
                  "evidenceScope": "code",
                  "concept": "Request DTO",
                  "check": "Controller가 Repository를 직접 호출하지 않는지 확인합니다."
                },
                {
                  "from": "service",
                  "to": "service",
                  "verb": "변환",
                  "payload": "PostCreateRequest → PostEntity",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "PostCreateRequest → PostEntity",
                    "before": "PostService: PostCreateRequest",
                    "after": "PostService: PostEntity"
                  },
                  "evidenceScope": "code",
                  "concept": "DTO / Entity 경계",
                  "check": "Entity가 DB 저장 모양을 갖는지 확인합니다.",
                  "codePointIds": [
                    "entity-table"
                  ]
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
                  "evidenceScope": "code",
                  "concept": "JpaRepository",
                  "check": "Service가 저장 세부 구현을 Repository에 맡기는지 확인합니다.",
                  "codePointIds": [
                    "repository-save"
                  ]
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
                  "concept": "JPA → SQL",
                  "check": "MySQL posts table에 row가 생겼는지 확인합니다."
                }
              ]
            },
            {
              "id": "create-response",
              "label": "저장 결과와 응답",
              "description": "생성된 id가 Entity와 Response DTO를 거쳐 Client로 돌아옵니다.",
              "steps": [
                {
                  "from": "database",
                  "to": "repository",
                  "verb": "반환",
                  "payload": "generated id + persisted row",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "generated id + persisted row",
                    "before": "PostRepository: 생성 id 없는 저장 요청",
                    "after": "PostRepository: MySQL이 만든 id와 persisted row 확보"
                  },
                  "evidenceScope": "runtime",
                  "concept": "DB 저장 결과",
                  "check": "생성된 id를 확인합니다."
                },
                {
                  "from": "repository",
                  "to": "service",
                  "verb": "반환",
                  "payload": "saved PostEntity { id }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "saved PostEntity { id }",
                    "before": "PostService: id가 확정된 Post 없음",
                    "after": "PostService: 새 id가 있는 saved Post 확보"
                  },
                  "evidenceScope": "code",
                  "concept": "saved Entity",
                  "check": "save 반환값이 id를 가지는지 확인합니다."
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
                  "evidenceScope": "code",
                  "concept": "Response DTO",
                  "check": "Entity를 그대로 밖으로 내보내지 않는지 확인합니다."
                },
                {
                  "from": "controller",
                  "to": "client",
                  "verb": "응답",
                  "payload": "201 Created + PostResponse JSON",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "201 Created + PostResponse JSON",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 201 Created + PostResponse JSON"
                  },
                  "evidenceScope": "runtime",
                  "concept": "HTTP response",
                  "check": "Swagger id와 MySQL row id를 비교합니다."
                }
              ]
            }
          ]
        },
        "route": [
          "Client",
          "PostController",
          "PostCreateRequest",
          "PostService",
          "PostEntity",
          "PostRepository",
          "MySQL",
          "PostResponse",
          "Client"
        ],
        "snapshot": [
          { "label": "Request", "value": "POST /posts" },
          { "label": "저장 모델", "value": "PostEntity" },
          { "label": "DB 증거", "value": "posts table row", "tone": "recovered" }
        ],
        "evidence": "Swagger 생성 응답의 id와 MySQL posts table의 저장 row를 함께 확인합니다.",
        "outcome": "Service가 Request DTO를 Entity로 바꾸고 Repository가 DB 접근을 맡은 뒤 Response DTO로 되돌립니다."
      },
      {
        "id": "survive-restart",
        "label": "재시작 뒤 다시 조회",
        "flowId": "create-read",
        "tone": "recovered",
        "prompt": "애플리케이션이 다시 시작돼도 같은 데이터를 찾을 수 있다는 증거는 무엇일까요?",
        "observationTitle": "새 프로세스의 SELECT가 이전에 저장한 row를 다시 찾는가?",
        "reflection": {
          "prompt": "애플리케이션 재시작 뒤에도 조회가 가능한 이유를 상태의 소유자로 설명해 보세요.",
          "hint": "데이터를 보유한 주체가 애플리케이션 메모리가 아니라 MySQL이라는 점을 사용하세요."
        },
        "theoryRef": "../../../theory.md#seq-02",
        "prediction": {
          "prompt": "서버 재시작 뒤 같은 게시글을 다시 찾게 하는 상태는 어디에 남아 있을까요?",
          "options": [
            {
              "id": "process-memory",
              "label": "종료된 애플리케이션 메모리"
            },
            {
              "id": "database-row",
              "label": "프로세스 밖 MySQL row"
            }
          ],
          "answer": "database-row",
          "explanation": "DB row는 애플리케이션 프로세스와 수명이 분리되어 재시작 뒤에도 조회할 수 있습니다."
        },
        "diagram": {
          "caption": "애플리케이션만 재시작하고 MySQL 서비스와 volume을 유지하면 같은 row를 다시 조회할 수 있습니다.",
          "lanes": [
            {
              "id": "restart-read-request",
              "label": "재시작 후 조회 요청",
              "description": "새 애플리케이션 프로세스가 기존 id를 다시 조회합니다.",
              "steps": [
                {
                  "from": "app-runtime",
                  "to": "app-runtime",
                  "verb": "프로세스 재시작",
                  "payload": "application process 종료 → 새 process 시작",
                  "kind": "event",
                  "effect": {
                    "kind": "persist",
                    "subject": "application process 종료 → 새 process 시작",
                    "before": "기존 애플리케이션 process와 그 인스턴스가 실행 중",
                    "after": "기존 process 종료 후 새 process와 새 인스턴스 실행"
                  },
                  "evidenceScope": "manual"
                },
                {
                  "from": "app-runtime",
                  "to": "database",
                  "verb": "외부 상태 확인",
                  "payload": "MySQL posts row의 같은 id",
                  "kind": "compare",
                  "effect": {
                    "kind": "verify",
                    "subject": "MySQL posts row의 같은 id",
                    "before": "애플리케이션 종료 전: id를 가진 MySQL row 존재",
                    "after": "새 애플리케이션 시작 후: 별도 MySQL process에 같은 row 존재"
                  },
                  "evidenceScope": "runtime",
                  "concept": "프로세스 밖 영속성"
                },
                {
                  "from": "client",
                  "to": "controller",
                  "verb": "요청",
                  "payload": "GET /posts/{id}",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "GET /posts/{id}",
                    "before": "Client: GET /posts/{id} 전송 준비",
                    "after": "PostController: GET /posts/{id} 수신"
                  },
                  "evidenceScope": "manual"
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
                  "evidenceScope": "code",
                  "concept": "영속 데이터 재조회",
                  "check": "재시작 전 생성한 id를 사용합니다."
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
                }
              ]
            },
            {
              "id": "restart-read-response",
              "label": "기존 row 반환",
              "description": "프로세스 밖에 남은 row가 API 응답으로 돌아옵니다.",
              "steps": [
                {
                  "from": "database",
                  "to": "repository",
                  "verb": "반환",
                  "payload": "existing posts row",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "existing posts row",
                    "before": "PostRepository: 대상 row 또는 Entity 없음",
                    "after": "PostRepository: existing posts row 확보"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "repository",
                  "to": "service",
                  "verb": "반환",
                  "payload": "PostEntity",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "PostEntity",
                    "before": "PostService: 대상 row 또는 Entity 없음",
                    "after": "PostService: PostEntity 확보"
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
                  "payload": "200 OK + 같은 id의 JSON",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "200 OK + 같은 id의 JSON",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 200 OK + 같은 id의 JSON"
                  },
                  "evidenceScope": "runtime",
                  "check": "재시작 전후 id와 row가 같은지 확인합니다."
                }
              ]
            }
          ]
        },
        "route": [
          "Client",
          "PostController",
          "PostService",
          "PostRepository",
          "MySQL",
          "애플리케이션 재시작",
          "MySQL",
          "Client"
        ],
        "snapshot": [
          { "label": "프로세스", "value": "재시작됨" },
          { "label": "저장 위치", "value": "MySQL" },
          { "label": "조회 결과", "value": "같은 row 확인", "tone": "recovered" }
        ],
        "evidence": "서버 재시작 전후 GET 요청과 MySQL table 조회에서 같은 저장 데이터를 확인합니다.",
        "outcome": "데이터 수명은 애플리케이션 메모리가 아니라 DB의 영속 저장에 연결됩니다."
      },
      {
        "id": "update-post",
        "label": "기존 게시글 수정",
        "flowId": "update-delete",
        "tone": "signal",
        "prompt": "PUT 요청은 왜 먼저 기존 Entity를 찾은 뒤 값을 바꿔야 할까요?",
        "observationTitle": "기존 Entity를 찾은 뒤에만 UPDATE가 실행되는가?",
        "reflection": {
          "prompt": "수정이 조회와 변경을 순서대로 요구하는 인과 규칙은 무엇인가요?",
          "hint": "대상 Entity의 존재가 확인되어야 어떤 row를 바꿀지 결정할 수 있습니다."
        },
        "theoryRef": "../../../theory.md#seq-02",
        "prediction": {
          "prompt": "PUT으로 기존 게시글을 수정할 때 저장 전에 먼저 해야 할 일은 무엇일까요?",
          "options": [
            {
              "id": "insert-new",
              "label": "새 Entity를 바로 INSERT한다"
            },
            {
              "id": "find-change-save",
              "label": "id로 기존 Entity를 찾고 값을 바꾼 뒤 저장한다"
            }
          ],
          "answer": "find-change-save",
          "explanation": "수정 대상의 정체성을 보존하려면 먼저 기존 Entity를 식별한 뒤 변경을 저장해야 합니다."
        },
        "diagram": {
          "caption": "수정은 id로 기존 Entity를 찾은 뒤 값을 바꾸고, 02 시퀀스의 save 흐름으로 UPDATE를 요청합니다.",
          "lanes": [
            {
              "id": "update-lookup",
              "label": "대상 조회",
              "description": "수정 전에 id로 기존 row와 Entity를 찾습니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "controller",
                  "verb": "요청",
                  "payload": "PUT /posts/{id} + PostUpdateRequest",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "PUT /posts/{id} + PostUpdateRequest",
                    "before": "Client: PUT /posts/{id} + PostUpdateRequest 전송 준비",
                    "after": "PostController: PUT /posts/{id} + PostUpdateRequest 수신"
                  },
                  "evidenceScope": "manual"
                },
                {
                  "from": "controller",
                  "to": "service",
                  "verb": "호출",
                  "payload": "update(id, request)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "update(id, request)",
                    "before": "PostController: method argument update(id, request) 구성",
                    "after": "PostService: update(id, request) method 진입"
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
                  "payload": "posts row",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "posts row",
                    "before": "PostRepository: 대상 row 또는 Entity 없음",
                    "after": "PostRepository: posts row 확보"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "repository",
                  "to": "service",
                  "verb": "반환",
                  "payload": "PostEntity",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "PostEntity",
                    "before": "PostService: 대상 row 또는 Entity 없음",
                    "after": "PostService: PostEntity 확보"
                  },
                  "evidenceScope": "code"
                }
              ]
            },
            {
              "id": "update-persist",
              "label": "값 변경과 저장",
              "description": "찾은 Entity의 값을 바꾼 뒤 현재 02 구현의 명시적 save로 반영합니다.",
              "steps": [
                {
                  "from": "service",
                  "to": "service",
                  "verb": "변경",
                  "payload": "PostUpdateRequest → Entity fields",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "PostUpdateRequest → Entity fields",
                    "before": "PostEntity: 조회 당시 title·content·author 유지",
                    "after": "PostEntity: request의 title·content·author로 변경"
                  },
                  "evidenceScope": "code",
                  "concept": "Entity update",
                  "check": "title, content, author가 요청 값으로 바뀌는지 확인합니다."
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
                  "evidenceScope": "code",
                  "concept": "02 시퀀스의 명시적 save",
                  "check": "이 단계는 이후 transaction dirty checking과 구분합니다."
                },
                {
                  "from": "repository",
                  "to": "database",
                  "verb": "반영",
                  "payload": "UPDATE posts row",
                  "kind": "persist",
                  "effect": {
                    "kind": "persist",
                    "subject": "UPDATE posts row",
                    "before": "MySQL posts row: 이전 title·content·author",
                    "after": "MySQL posts row: PostUpdateRequest 값으로 갱신"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "database",
                  "to": "repository",
                  "verb": "반환",
                  "payload": "updated row",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "updated row",
                    "before": "PostRepository: 대상 row 또는 Entity 없음",
                    "after": "PostRepository: updated row 확보"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "repository",
                  "to": "service",
                  "verb": "반환",
                  "payload": "updated PostEntity",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "updated PostEntity",
                    "before": "PostService: 대상 row 또는 Entity 없음",
                    "after": "PostService: updated PostEntity 확보"
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
                  "payload": "200 OK + updated JSON",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "200 OK + updated JSON",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 200 OK + updated JSON"
                  },
                  "evidenceScope": "runtime",
                  "check": "응답과 MySQL row를 비교합니다."
                }
              ]
            }
          ]
        },
        "route": [
          "Client",
          "PostController",
          "PostUpdateRequest",
          "PostService",
          "PostRepository.findById",
          "PostEntity 변경",
          "PostRepository.save",
          "MySQL",
          "PostResponse"
        ],
        "snapshot": [
          { "label": "Request", "value": "PUT /posts/{id}" },
          { "label": "조회 기준", "value": "id" },
          { "label": "DB 결과", "value": "변경된 row" }
        ],
        "evidence": "수정 응답과 MySQL row를 비교하고 findById → 값 변경 → save 순서를 확인합니다.",
        "outcome": "대상 Entity를 식별한 뒤 변경을 저장하고 결과를 Response DTO로 반환합니다."
      },
      {
        "id": "missing-update-target",
        "label": "없는 id 수정",
        "flowId": "update-delete",
        "tone": "blocked",
        "prompt": "수정할 Entity를 찾지 못했다면 DB 변경은 어디에서 멈춰야 할까요?",
        "observationTitle": "Optional.empty()에서 DB 변경 없이 흐름이 멈추는가?",
        "reflection": {
          "prompt": "없는 id가 수정 SQL까지 도달하지 못하게 하는 규칙을 설명해 보세요.",
          "hint": "조회 결과 없음과 예외 발생을 연결하되, 이 시퀀스가 아직 404 계약을 확정하지 않는다는 범위를 지키세요."
        },
        "theoryRef": "../../../theory.md#seq-02",
        "prediction": {
          "prompt": "수정할 id가 DB에 없다면 save 호출은 어떻게 되어야 할까요?",
          "options": [
            {
              "id": "create-row",
              "label": "새 row로 저장한다"
            },
            {
              "id": "stop-before-save",
              "label": "실패 흐름으로 전환하고 save 전에 멈춘다"
            }
          ],
          "answer": "stop-before-save",
          "explanation": "없는 수정 대상을 생성으로 바꾸지 않고 조회 실패와 DB 변경을 분리합니다."
        },
        "diagram": {
          "caption": "02 단계에서는 조회 결과가 비면 예외가 기본 오류 경로로 전파되고 Entity 변경과 UPDATE는 실행되지 않습니다.",
          "lanes": [
            {
              "id": "missing-lookup",
              "label": "없는 id 조회",
              "description": "Repository와 MySQL까지 조회하지만 대상 row를 찾지 못합니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "controller",
                  "verb": "요청",
                  "payload": "PUT /posts/{id} + PostUpdateRequest",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "PUT /posts/{id} + PostUpdateRequest",
                    "before": "Client: PUT /posts/{id} + PostUpdateRequest 전송 준비",
                    "after": "PostController: PUT /posts/{id} + PostUpdateRequest 수신"
                  },
                  "evidenceScope": "manual"
                },
                {
                  "from": "controller",
                  "to": "service",
                  "verb": "호출",
                  "payload": "update(id, request)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "update(id, request)",
                    "before": "PostController: method argument update(id, request) 구성",
                    "after": "PostService: update(id, request) method 진입"
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
                  "check": "대상이 없음을 확인합니다."
                }
              ]
            },
            {
              "id": "missing-error",
              "label": "02 범위의 실패 반환",
              "description": "공통 ErrorResponse를 도입하기 전 예외가 Spring 기본 오류 경로로 전달됩니다.",
              "steps": [
                {
                  "from": "service",
                  "to": "default-error",
                  "verb": "전파",
                  "payload": "NoSuchElementException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "NoSuchElementException",
                    "before": "PostService: 수정 대상 Entity를 확보하지 못함",
                    "after": "NoSuchElementException 발생; Entity field와 DB row 변경 없음"
                  },
                  "evidenceScope": "code",
                  "concept": "02 단계의 미처리 예외",
                  "check": "404 공통 응답은 아직 03의 범위임을 구분합니다."
                },
                {
                  "from": "default-error",
                  "to": "client",
                  "verb": "오류 응답",
                  "payload": "기본 오류 응답 (상태·형식은 02 학습 범위 밖)",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "기본 오류 응답 (상태·형식은 02 학습 범위 밖)",
                    "before": "Client: 수정 성공 JSON을 아직 받지 못함",
                    "after": "Client: 처리되지 않은 예외의 기본 오류 응답 관찰; status·body 계약은 02에서 미정"
                  },
                  "evidenceScope": "runtime"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "PostEntity 값 변경",
              "reason": "조회 결과가 없어 변경할 Entity가 없습니다."
            },
            {
              "label": "save / UPDATE",
              "reason": "실패 후 Repository mutation은 실행되지 않습니다."
            }
          ]
        },
        "route": [
          "Client",
          "PostController",
          "PostService",
          "PostRepository.findById",
          "PostEntity 변경",
          "PostRepository.save",
          "MySQL"
        ],
        "snapshot": [
          { "label": "조회 결과", "value": "대상 없음", "tone": "blocked" },
          { "label": "Entity 변경", "value": "실행하지 않음" },
          { "label": "DB mutation", "value": "없음" }
        ],
        "evidence": "findById 결과가 없을 때 이후 변경·save가 호출되지 않는 흐름을 확인합니다.",
        "outcome": "없는 데이터를 새 row처럼 저장하지 않고 실패 흐름으로 분리합니다.",
        "stopAfter": 3
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
      "id": "service",
      "label": "PostService",
      "kind": "logic"
    },
    {
      "id": "entity",
      "label": "PostEntity",
      "kind": "logic"
    },
    {
      "id": "repository",
      "label": "PostRepository",
      "kind": "logic"
    },
    {
      "id": "db",
      "label": "MySQL",
      "kind": "db"
    }
  ],
  "flows": [
    {
      "id": "create-read",
      "title": "생성/조회 흐름",
      "summary": "요청 DTO는 DB에 직접 저장되지 않고 Service에서 Entity로 바뀐 뒤 Repository에 저장됩니다.",
      "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as PostController\n  participant Service as PostService\n  participant Repository as PostRepository\n  participant DB as MySQL\n  Client->>Controller: POST /posts + PostCreateRequest\n  Controller->>Service: create(request)\n  Service->>Repository: save(PostEntity from request.author)\n  Repository->>DB: insert row\n  DB-->>Repository: saved entity\n  Repository-->>Service: PostEntity\n  Service-->>Controller: PostResponse\n  Controller-->>Client: JSON response",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "POST /posts + PostCreateRequest",
          "owner": "PostController",
          "action": "HTTP 요청 body를 Request DTO로 받습니다.",
          "output": "PostCreateRequest",
          "note": "Controller는 HTTP 경계만 담당하고 DB를 직접 알지 않습니다.",
          "id": "create-read-step-1",
          "from": "Client",
          "to": "PostController",
          "message": "HTTP 요청 body를 Request DTO로 받습니다.",
          "messageKind": "request",
          "problem": "POST /posts + PostCreateRequest",
          "concept": "PostController",
          "check": "PostCreateRequest",
          "codePointIds": [
            "entity-table",
            "repository-save"
          ]
        },
        {
          "order": 2,
          "actor": "PostController",
          "input": "PostCreateRequest",
          "owner": "PostService",
          "action": "요청 DTO를 DB 저장 모델인 Entity로 변환합니다.",
          "output": "PostEntity",
          "note": "DTO와 Entity를 분리해야 API 계약과 DB 구조가 함께 흔들리지 않습니다.",
          "id": "create-read-step-2",
          "from": "PostController",
          "to": "PostService",
          "message": "요청 DTO를 DB 저장 모델인 Entity로 변환합니다.",
          "messageKind": "request",
          "problem": "PostCreateRequest",
          "concept": "PostService",
          "check": "PostEntity",
          "codePointIds": [
            "repository-save",
            "entity-table"
          ]
        },
        {
          "order": 3,
          "actor": "PostService",
          "input": "PostEntity",
          "owner": "PostRepository",
          "action": "Entity 저장과 조회를 Repository에 맡깁니다.",
          "output": "Saved PostEntity",
          "note": "Repository는 DB 접근 책임을 감추는 경계입니다.",
          "id": "create-read-step-3",
          "from": "PostService",
          "to": "PostRepository",
          "message": "Entity 저장과 조회를 Repository에 맡깁니다.",
          "messageKind": "request",
          "problem": "PostEntity",
          "concept": "PostRepository",
          "check": "Saved PostEntity",
          "codePointIds": [
            "entity-table",
            "repository-save"
          ]
        },
        {
          "order": 4,
          "actor": "PostRepository",
          "input": "PostEntity",
          "owner": "MySQL",
          "action": "posts table에 row를 저장합니다.",
          "output": "Persisted row",
          "note": "데이터가 애플리케이션 프로세스 밖에 남습니다.",
          "id": "create-read-step-4",
          "from": "PostRepository",
          "to": "MySQL",
          "message": "posts table에 row를 저장합니다.",
          "messageKind": "request",
          "problem": "PostEntity",
          "concept": "MySQL",
          "check": "Persisted row",
          "codePointIds": [
            "repository-save",
            "entity-table"
          ]
        },
        {
          "order": 5,
          "actor": "PostService",
          "input": "Saved PostEntity",
          "owner": "PostResponse",
          "action": "Entity를 응답 DTO로 변환합니다.",
          "output": "JSON response",
          "note": "Entity를 그대로 응답하지 않아 외부 API 모양을 안정적으로 유지합니다.",
          "id": "create-read-step-5",
          "from": "PostService",
          "to": "PostResponse",
          "message": "Entity를 응답 DTO로 변환합니다.",
          "messageKind": "response",
          "problem": "Saved PostEntity",
          "concept": "PostResponse",
          "check": "JSON response",
          "codePointIds": [
            "entity-table",
            "repository-save"
          ]
        }
      ],
      "bandKind": "scenario"
    },
    {
      "id": "update-delete",
      "title": "수정/삭제 흐름",
      "summary": "id로 대상 Entity를 찾은 뒤 Service가 처리 흐름을 조립하고 Repository가 DB 작업을 수행합니다.",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "PUT 또는 DELETE /posts/{id}",
          "owner": "PostController",
          "action": "URL의 id와 요청 body를 Service에 전달합니다.",
          "output": "id + request",
          "note": "수정과 삭제는 대상 식별이 먼저입니다.",
          "id": "update-delete-step-1",
          "from": "Client",
          "to": "PostController",
          "message": "URL의 id와 요청 body를 Service에 전달합니다.",
          "messageKind": "request",
          "problem": "PUT 또는 DELETE /posts/{id}",
          "concept": "PostController",
          "check": "id + request",
          "codePointIds": [
            "entity-table",
            "repository-save"
          ]
        },
        {
          "order": 2,
          "actor": "PostController",
          "input": "id + request",
          "owner": "PostService",
          "action": "id 기준으로 대상 Entity를 조회하고 필요한 변경을 적용합니다.",
          "output": "Updated entity 또는 delete command",
          "note": "없는 id와 잘못된 입력은 다음 시퀀스에서 더 안전하게 다룹니다.",
          "id": "update-delete-step-2",
          "from": "PostController",
          "to": "PostService",
          "message": "id 기준으로 대상 Entity를 조회하고 필요한 변경을 적용합니다.",
          "messageKind": "request",
          "problem": "id + request",
          "concept": "PostService",
          "check": "Updated entity 또는 delete command",
          "codePointIds": [
            "repository-save",
            "entity-table"
          ]
        },
        {
          "order": 3,
          "actor": "PostService",
          "input": "Entity change",
          "owner": "PostRepository",
          "action": "DB 저장, 조회, 삭제 메서드를 호출합니다.",
          "output": "DB result",
          "note": "Controller가 DB에 직접 접근하지 않는 구조를 유지합니다.",
          "id": "update-delete-step-3",
          "from": "PostService",
          "to": "PostRepository",
          "message": "DB 저장, 조회, 삭제 메서드를 호출합니다.",
          "messageKind": "response",
          "problem": "Entity change",
          "concept": "PostRepository",
          "check": "DB result",
          "codePointIds": [
            "entity-table",
            "repository-save"
          ]
        },
        {
          "id": "update-delete-check-4",
          "order": 4,
          "actor": "PostRepository",
          "owner": "확인 지점",
          "from": "PostRepository",
          "to": "확인 지점",
          "message": "결과와 실패 지점을 확인합니다.",
          "messageKind": "response",
          "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
          "concept": "DB 저장 결과 확인",
          "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
          "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
          "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
          "codePointIds": [
            "repository-save"
          ]
        }
      ],
      "bandKind": "scenario"
    }
  ],
  "flow": [
    {
      "id": "create-read-step-1",
      "label": "PostController",
      "problem": "POST /posts + PostCreateRequest",
      "concept": "PostController",
      "action": "HTTP 요청 body를 Request DTO로 받습니다.",
      "check": "PostCreateRequest",
      "codePointIds": [
        "entity-table",
        "repository-save"
      ]
    },
    {
      "id": "create-read-step-2",
      "label": "PostService",
      "problem": "PostCreateRequest",
      "concept": "PostService",
      "action": "요청 DTO를 DB 저장 모델인 Entity로 변환합니다.",
      "check": "PostEntity",
      "codePointIds": [
        "repository-save",
        "entity-table"
      ]
    },
    {
      "id": "create-read-step-3",
      "label": "PostRepository",
      "problem": "PostEntity",
      "concept": "PostRepository",
      "action": "Entity 저장과 조회를 Repository에 맡깁니다.",
      "check": "Saved PostEntity",
      "codePointIds": [
        "entity-table",
        "repository-save"
      ]
    },
    {
      "id": "create-read-step-4",
      "label": "MySQL",
      "problem": "PostEntity",
      "concept": "MySQL",
      "action": "posts table에 row를 저장합니다.",
      "check": "Persisted row",
      "codePointIds": [
        "repository-save",
        "entity-table"
      ]
    },
    {
      "id": "create-read-step-5",
      "label": "PostResponse",
      "problem": "Saved PostEntity",
      "concept": "PostResponse",
      "action": "Entity를 응답 DTO로 변환합니다.",
      "check": "JSON response",
      "codePointIds": [
        "entity-table",
        "repository-save"
      ]
    }
  ],
  "codePoints": [
    {
      "id": "entity-table",
      "title": "Entity는 DB 테이블과 연결되는 저장 모델입니다",
      "file": "src/main/kotlin/com/andi/rest_crud/domain/PostEntity.kt",
      "language": "kotlin",
      "snippet": "// Entity 속성을 posts table의 row 구조와 연결합니다.\n@Entity\n@Table(name = \"posts\")\nclass PostEntity(\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    val id: Long = 0L,\n    var title: String,\n    var content: String,\n    var author: String\n)",
      "explanation": "외부 요청 DTO가 아니라 DB row로 저장되는 내부 데이터 구조입니다.",
      "check": "Entity와 Request DTO를 같은 책임으로 보지 않습니다."
    },
    {
      "id": "repository-save",
      "title": "Service는 Repository에 DB 저장을 요청합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/service/PostService.kt",
      "language": "kotlin",
      "snippet": "// 02에서는 요청 DTO의 세 필드를 Entity로 만들어 저장합니다.\nfun create(request: PostCreateRequest): PostResponse {\n    val savedPost = postRepository.save(\n        PostEntity(\n            title = request.title,\n            content = request.content,\n            author = request.author\n        )\n    )\n    return PostResponse.from(savedPost)\n}",
      "explanation": "Service는 DTO를 Entity로 바꾸고 Repository 호출 순서를 조립합니다.",
      "check": "DB 접근 코드가 Controller에 들어가지 않았는지 확인합니다."
    }
  ],
  "concepts": [
    {
      "title": "영속성 저장",
      "body": "데이터가 애플리케이션 밖의 DB에 남아 재시작 후에도 유지됩니다."
    },
    {
      "title": "DTO와 Entity 분리",
      "body": "외부 API 계약과 DB 저장 모델을 나눠 변경 영향을 줄입니다."
    },
    {
      "title": "Repository 경계",
      "body": "Service가 DB 접근 세부사항 대신 저장소 인터페이스를 호출하게 합니다."
    },
    {
      "title": "단일 테이블 CRUD",
      "body": "관계 매핑보다 한 테이블에서 생성, 조회, 수정, 삭제 흐름을 먼저 봅니다."
    }
  ],
  "practice": [
    "Request DTO가 Entity로 바뀌는 위치를 설명할 수 있나요?",
    "Repository가 맡는 책임과 Service가 맡는 책임을 구분할 수 있나요?",
    "Entity를 Response DTO로 바꾸는 이유를 말할 수 있나요?",
    "없는 id 조회와 잘못된 입력이 다음 시퀀스로 남는 이유를 설명할 수 있나요?"
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
  "topic": "Persistence and layered architecture",
  "question": "메모리 CRUD는 왜 DB 기반 CRUD로 이동해야 할까?",
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
    "problem": "메모리 저장소는 요청/응답 흐름을 배우기에는 좋지만 서버 프로세스 안에만 데이터를 보관합니다.",
    "limits": [
      "애플리케이션을 재시작하면 데이터가 사라집니다.",
      "여러 서버 인스턴스가 같은 데이터를 공유하기 어렵습니다.",
      "Service가 저장 기술을 직접 알면 처리 흐름과 DB 접근 세부사항이 강하게 묶입니다."
    ],
    "choice": "Service는 CRUD 흐름을 조립하고, Repository가 Entity 저장과 조회를 맡는 구조로 분리합니다."
  },
  "overview": [
    "PostCreateRequest",
    "PostController",
    "PostService",
    "PostEntity",
    "PostRepository",
    "MySQL",
    "PostResponse"
  ],
  "responsibilities": [
    {
      "name": "PostController",
      "role": "HTTP 요청과 응답 경계를 담당합니다.",
      "caution": "Repository와 MySQL을 직접 알지 않습니다."
    },
    {
      "name": "PostService",
      "role": "DTO, Entity, Repository, Response DTO 흐름을 조립합니다.",
      "caution": "SQL이나 DB 연결 세부사항을 직접 맡지 않습니다."
    },
    {
      "name": "PostEntity",
      "role": "DB table과 연결되는 서버 내부 저장 모델입니다.",
      "caution": "외부 API 응답 모델과 같은 객체가 아닙니다."
    },
    {
      "name": "PostRepository",
      "role": "Entity 저장, 조회, 삭제 같은 DB 접근을 맡습니다.",
      "caution": "Service가 저장 기술에 덜 묶이게 합니다."
    }
  ],
  "glossary": [
    {
      "term": "Entity",
      "meaning": "DB table과 연결되는 서버 내부 저장 모델입니다.",
      "caution": "Request DTO나 Response DTO와 같은 책임이 아닙니다."
    },
    {
      "term": "Repository",
      "meaning": "DB 접근을 담당하는 경계입니다.",
      "caution": "비즈니스 흐름을 담는 Service와 역할이 다릅니다."
    },
    {
      "term": "Persistence",
      "meaning": "데이터를 애플리케이션 밖에 남기는 저장 방식입니다.",
      "caution": "메모리 저장과 달리 재시작 후에도 데이터가 남습니다."
    },
    {
      "term": "JPA",
      "meaning": "Entity와 DB 작업을 연결하는 Java/Kotlin 생태계의 영속성 기술입니다.",
      "caution": "CRUD는 쉬워지지만 관계 매핑과 N+1은 별도 학습이 필요합니다."
    }
  ],
  "practical": [
    {
      "title": "Entity를 응답으로 바로 내보내지 않습니다",
      "body": "API 응답 구조와 DB 테이블 구조가 함께 흔들리는 것을 막기 위해서입니다."
    },
    {
      "title": "Repository가 있어도 Service 책임은 남습니다",
      "body": "저장소 호출 순서, 예외 흐름, 응답 변환은 Service가 조립합니다."
    },
    {
      "title": "관계 매핑은 이번 범위가 아닙니다",
      "body": "먼저 단일 테이블 CRUD 흐름을 정확히 말할 수 있어야 합니다."
    }
  ],
  "checks": [
    "Request DTO가 Entity로 바뀌는 위치를 설명할 수 있나요?",
    "Repository가 맡는 책임과 Service가 맡는 책임을 구분할 수 있나요?",
    "Entity를 Response DTO로 바꾸는 이유를 말할 수 있나요?",
    "없는 id 조회와 잘못된 입력이 다음 시퀀스로 남는 이유를 설명할 수 있나요?"
  ],
  "next": {
    "id": "03",
    "title": "Validation",
    "reason": "DB 저장 흐름을 이해했다면, 다음에는 잘못된 요청과 없는 데이터 조회를 일관된 실패 응답으로 처리합니다."
  }
};
