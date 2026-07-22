window.visualLabData = {
  "kind": "sequence",
  "sequence": "06",
  "title": "Testing",
  "subtitle": "Testing and verification",
  "goal": "기존 회귀 suite를 보존하고 Service 단위 테스트 네 개를 fixture, mock, assertion으로 완성합니다.",
  "problem": "기능이 늘어날수록 사람이 정상 케이스와 실패 케이스를 기억으로 확인하기 어렵습니다.",
  "repo": {
    "name": "spring-boot-db-access-lab",
    "path": "spring-boot-db-access-lab"
  },
  "defaultSequence": "06",
  "workbench": {
    "kind": "test",
    "title": "테스트가 실제로 보장하는 범위",
    "instruction": "테스트 시나리오를 선택하고 fixture, mock, Service 실행, assertion이 무엇을 보장하며 HTTP 경계에서 무엇이 남는지 확인하세요.",
    "visual": {
      "src": "../../assets/diagrams/06-test-scope.svg",
      "alt": "Fixture와 mock이 Service를 실행하고 assertion이 결과와 협력을 확인하며 HTTP 경계는 별도 검증으로 남는 테스트 범위",
      "caption": "단위 테스트가 보장하는 Service 판단과 보장하지 않는 HTTP 정책을 나눕니다."
    },
    "terms": [
      {
        "term": "Fixture",
        "meaning": "테스트를 실행하기 전에 의도한 조건을 만들기 위해 준비한 입력과 상태입니다."
      },
      {
        "term": "Mock",
        "meaning": "Repository 같은 협력자의 응답과 호출을 테스트 안에서 통제하는 대역입니다."
      },
      {
        "term": "Assertion",
        "meaning": "실제 결과가 기대한 값이나 예외와 같은지 판정하는 확인문입니다."
      },
      {
        "term": "Unit test",
        "meaning": "외부 시스템을 분리하고 한 책임의 판단을 빠르게 검증하는 테스트입니다."
      }
    ],
    "comparison": {
      "label": "테스트 결과가 보장하는 범위",
      "left": {
        "title": "Service 단위 테스트",
        "body": "입력, 협력자 호출, 반환 값과 예외 같은 Service 판단을 보장합니다."
      },
      "right": {
        "title": "HTTP 통합 테스트",
        "body": "Validation·Security filter·상태 코드처럼 여러 경계가 연결된 정책을 확인합니다."
      }
    },
    "nodes": {
      "testMethod": {
        "label": "JUnit Test method",
        "icon": "test",
        "kind": "test",
        "role": "조건을 준비하고 Service를 실행한 뒤 실제 결과를 검증합니다.",
        "systemLayer": "outside",
        "boundary": "단위 테스트",
        "codePointIds": [
          "service-unit-test"
        ]
      },
      "fixtureFactory": {
        "label": "TestFixtureFactory",
        "icon": "fixture",
        "kind": "fixture",
        "role": "반복되는 요청 DTO와 Entity 입력을 만듭니다.",
        "systemLayer": "outside",
        "boundary": "테스트 준비",
        "codePointIds": [
          "fixture-factory"
        ]
      },
      "mockPostRepository": {
        "label": "Mock PostRepository",
        "icon": "repository",
        "kind": "repository",
        "role": "DB 연결 대신 PostRepository의 반환값을 테스트가 통제하게 합니다.",
        "systemLayer": "resource",
        "boundary": "테스트 대역"
      },
      "postService": {
        "label": "PostService",
        "icon": "service",
        "kind": "service",
        "role": "게시글 생성과 조회 실패 같은 비즈니스 판단을 실행하는 테스트 대상입니다.",
        "systemLayer": "application",
        "boundary": "Service under test",
        "codePointIds": [
          "service-unit-test"
        ]
      },
      "mockUserRepository": {
        "label": "Mock UserRepository",
        "icon": "repository",
        "kind": "repository",
        "role": "로그인 대상 사용자의 조회 결과를 테스트가 통제하게 합니다.",
        "systemLayer": "resource",
        "boundary": "테스트 대역"
      },
      "authService": {
        "label": "AuthService",
        "icon": "service",
        "kind": "service",
        "role": "사용자 종류와 비밀번호를 판단하고 성공 시 token을 만드는 테스트 대상입니다.",
        "systemLayer": "application",
        "boundary": "Service under test"
      },
      "passwordEncoder": {
        "label": "PasswordEncoder",
        "icon": "security",
        "kind": "security",
        "role": "비밀번호 비교 결과를 테스트가 통제하는 mock collaborator입니다.",
        "systemLayer": "application",
        "boundary": "테스트 대역"
      },
      "jwtTokenProvider": {
        "label": "JwtTokenProvider",
        "icon": "token",
        "kind": "token",
        "role": "token 문자열과 만료 시간을 테스트가 통제하는 mock collaborator입니다.",
        "systemLayer": "application",
        "boundary": "테스트 대역"
      },
      "assertionOracle": {
        "label": "Assertion oracle",
        "icon": "evidence",
        "kind": "evidence",
        "role": "응답 필드나 기대 예외를 실제 결과와 비교해 PASS 또는 FAIL을 결정합니다.",
        "systemLayer": "outside",
        "boundary": "테스트 검증"
      },
      "httpClient": {
        "label": "HTTP Client",
        "icon": "client",
        "kind": "client",
        "role": "인증 header와 요청 body를 포함한 HTTP 요청을 보냅니다.",
        "systemLayer": "outside",
        "boundary": "HTTP 통합 경계"
      },
      "securityFilter": {
        "label": "Security Filter",
        "icon": "security",
        "kind": "security",
        "role": "Bearer token이 유효하면 Authentication을 만들고, token이 없으면 Authentication 없이 다음 filter chain으로 요청을 넘깁니다.",
        "systemLayer": "interface",
        "boundary": "HTTP 통합 경계"
      },
      "authorizationBoundary": {
        "label": "Spring Security authorization",
        "icon": "gate",
        "kind": "gate",
        "role": "Authentication이 없는 보호 endpoint 요청을 Controller 진입 전에 거절합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP authorization 경계"
      },
      "authenticationEntryPoint": {
        "label": "CustomAuthenticationEntryPoint",
        "icon": "handler",
        "kind": "handler",
        "role": "authorization 경계의 미인증 접근을 401 ErrorResponse로 변환합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP 응답 경계"
      },
      "validation": {
        "label": "DTO Validation",
        "icon": "gate",
        "kind": "gate",
        "role": "요청 body의 형식과 제약을 검사합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP 통합 경계"
      },
      "postController": {
        "label": "PostController",
        "icon": "api",
        "kind": "api",
        "role": "검증된 HTTP 요청과 현재 사용자를 PostService로 전달합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP 통합 경계"
      },
      "globalExceptionHandler": {
        "label": "GlobalExceptionHandler",
        "icon": "handler",
        "kind": "handler",
        "role": "Validation과 Service 예외를 HTTP status와 ErrorResponse로 변환합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP 응답 경계"
      }
    },
    "scenarios": [
      {
        "id": "post-service-success",
        "label": "PostCreateRequest + owner email",
        "flowId": "service-unit-test",
        "tone": "recovered",
        "prompt": "PostServiceTest가 request·ownerEmail과 mock Repository 반환값을 준비했습니다.",
        "observationTitle": "저장 결과의 네 필드 보존",
        "reflection": {
          "prompt": "fixture와 stub이 성공 테스트를 재현 가능하게 만드는 규칙을 설명해 보세요.",
          "hint": "입력과 협력자 반환을 고정한 뒤 id, title, content, author를 비교합니다."
        },
        "theoryRef": "../../../theory.md#seq-06",
        "prediction": {
          "prompt": "어떤 값을 assertion해야 Service 변환을 확인할 수 있을까요?",
          "options": [
            {
              "id": "real-database",
              "label": "실제 MySQL과 HTTP 서버를 모두 실행한다"
            },
            {
              "id": "fixture-and-mock",
              "label": "입력 fixture와 Repository mock 결과를 준비한다"
            }
          ],
          "answer": "fixture-and-mock",
          "explanation": "DB 연결 여부가 아니라 stub으로 고정한 저장 결과와 Service 반환값을 비교하는 선택입니다."
        },
        "diagram": {
          "caption": "fixture가 입력을 만들고 mock Repository의 savedPost가 Service를 거쳐 PostResponse로 돌아옵니다.",
          "lanes": [
            {
              "id": "arrange",
              "label": "Given · Arrange",
              "description": "request·ownerEmail과 Repository 반환값을 고정합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "fixtureFactory",
                  "verb": "테스트 입력 생성",
                  "payload": "PostCreateRequest + saved PostEntity",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "PostCreateRequest + saved PostEntity",
                    "before": "JUnit Test method: 생성 request와 저장 결과 fixture 없음",
                    "after": "TestFixtureFactory: request와 id=42인 saved PostEntity 생성"
                  },
                  "evidenceScope": "test",
                  "concept": "Fixture",
                  "codePointIds": [
                    "fixture-factory"
                  ]
                },
                {
                  "from": "fixtureFactory",
                  "to": "testMethod",
                  "verb": "fixture 반환",
                  "payload": "request + entity",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "request + entity",
                    "before": "JUnit Test method: fixture 변수 미생성",
                    "after": "JUnit Test method: request와 savedPost fixture 확보"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "testMethod",
                  "to": "mockPostRepository",
                  "verb": "저장 결과 stub",
                  "payload": "save(entity) → savedPost",
                  "kind": "config",
                  "effect": {
                    "kind": "preserve",
                    "subject": "save(entity) → savedPost",
                    "before": "Mock collaborator: save(entity) 결과 미설정",
                    "after": "Mock collaborator: save(entity) 호출 시 savedPost 반환"
                  },
                  "evidenceScope": "test",
                  "concept": "Mock"
                }
              ]
            },
            {
              "id": "act",
              "label": "When · Act",
              "description": "실제 PostService.create를 실행합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "postService",
                  "verb": "생성 흐름 실행",
                  "payload": "create(request, owner@example.com)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "create(request, owner@example.com)",
                    "before": "JUnit Test method: method argument create(request, owner@example.com) 구성",
                    "after": "PostService: create(request, owner@example.com) method 진입"
                  },
                  "evidenceScope": "test",
                  "codePointIds": [
                    "service-unit-test"
                  ]
                },
                {
                  "from": "postService",
                  "to": "mockPostRepository",
                  "verb": "게시글 저장 호출",
                  "payload": "save(PostEntity)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "save(PostEntity)",
                    "before": "PostService: 저장할 Entity 또는 Post 구성 완료",
                    "after": "Mock PostRepository: save(PostEntity) 실행"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "mockPostRepository",
                  "to": "postService",
                  "verb": "준비한 결과 반환",
                  "payload": "savedPost",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "savedPost",
                    "before": "PostService: mock save 결과 없음",
                    "after": "PostService: id가 있는 savedPost 확보"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "postService",
                  "to": "testMethod",
                  "verb": "응답 변환 결과 반환",
                  "payload": "PostResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "PostResponse",
                    "before": "JUnit Test method: Service 실행 결과 없음",
                    "after": "JUnit Test method: PostResponse 확보"
                  },
                  "evidenceScope": "test"
                }
              ]
            },
            {
              "id": "assert",
              "label": "Then · Assert",
              "description": "Repository에 전달한 Entity와 반환된 응답을 각각 비교합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "assertionOracle",
                  "verb": "저장 인자와 응답 비교",
                  "payload": "saved Entity + id + title + content + author",
                  "kind": "compare",
                  "effect": {
                    "kind": "verify",
                    "subject": "saved Entity + PostResponse",
                    "before": "Repository 입력과 응답 mapping: 비교 전",
                    "after": "save 입력의 title·content·author와 응답 네 필드가 각각 비교됨"
                  },
                  "evidenceScope": "test",
                  "concept": "Assertion",
                  "check": "ArgumentCaptor로 save 입력을 확인하고 응답 mapping도 별도로 assertion합니다."
                },
                {
                  "from": "assertionOracle",
                  "to": "testMethod",
                  "verb": "검증 결과",
                  "payload": "PASS | FAIL",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "PASS | FAIL",
                    "before": "Assertion: 실제 결과 비교 미실행",
                    "after": "Assertion: 필드 일치 여부에 따라 PASS 또는 FAIL 결정"
                  },
                  "evidenceScope": "test"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "실제 Database",
              "reason": "PostRepository가 mock이므로 DB 연결과 SQL은 이 단위 테스트 범위 밖입니다."
            }
          ]
        },
        "route": [
          "Test method",
          "TestFixtureFactory",
          "Mock Repository",
          "PostService",
          "Assertion"
        ],
        "snapshot": [
          { "label": "Given", "value": "fixture + mock 저장 결과" },
          { "label": "When", "value": "PostService 호출" },
          { "label": "Then", "value": "응답 필드 검증 PASS", "tone": "recovered" }
        ],
        "evidence": "ArgumentCaptor로 save 입력의 title·content·author를 확인하고, 반환 응답의 id·title·content·author도 비교합니다. 실제 DB 연결은 범위 밖입니다.",
        "outcome": "Service가 principal과 request를 올바른 Entity로 저장하고 저장 결과를 응답으로 매핑하는 두 계약을 함께 고정합니다."
      },
      {
        "id": "post-service-not-found",
        "label": "findById(999) → empty",
        "flowId": "service-unit-test",
        "tone": "recovered",
        "prompt": "Repository가 Optional.empty()를 반환하도록 stub했습니다.",
        "observationTitle": "없는 id의 예외 타입",
        "reflection": {
          "prompt": "없는 게시글 테스트에서 stub과 예외 assertion의 인과 관계를 적어 보세요.",
          "hint": "`findById(999)`의 반환을 empty로 고정했기 때문에 Service의 not-found 분기가 실행됩니다."
        },
        "theoryRef": "../../../theory.md#seq-06",
        "prediction": {
          "prompt": "Service 호출에서 값과 예외 중 무엇을 assertion해야 할까요?",
          "options": [
            {
              "id": "always-fail",
              "label": "예외가 발생했으므로 무조건 실패한다"
            },
            {
              "id": "expected-pass",
              "label": "기대 예외와 일치하면 실패 분기 검증이 통과한다"
            }
          ],
          "answer": "expected-pass",
          "explanation": "정상 반환을 기대하는 선택과 달리, 이 조건은 PostNotFoundException 타입을 확인해야 합니다."
        },
        "diagram": {
          "caption": "mock Repository의 empty 결과가 Service에서 PostNotFoundException으로 바뀌어 테스트로 돌아옵니다.",
          "lanes": [
            {
              "id": "not-found-act",
              "label": "Given + When",
              "description": "empty 반환을 고정하고 Service 조회를 실행합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "mockPostRepository",
                  "verb": "조회 실패 stub",
                  "payload": "findById(999) → Optional.empty",
                  "kind": "config",
                  "effect": {
                    "kind": "preserve",
                    "subject": "findById(999) → Optional.empty",
                    "before": "Mock collaborator: findById(999) 결과 미설정",
                    "after": "Mock collaborator: findById(999) 호출 시 Optional.empty 반환"
                  },
                  "evidenceScope": "test",
                  "concept": "Mock"
                },
                {
                  "from": "testMethod",
                  "to": "postService",
                  "verb": "없는 게시글 조회",
                  "payload": "getById(999)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "getById(999)",
                    "before": "JUnit Test method: method argument getById(999) 구성",
                    "after": "PostService: getById(999) method 진입"
                  },
                  "evidenceScope": "test",
                  "codePointIds": [
                    "service-unit-test"
                  ]
                },
                {
                  "from": "postService",
                  "to": "mockPostRepository",
                  "verb": "게시글 조회 호출",
                  "payload": "findById(999)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "findById(999)",
                    "before": "PostService: findById(999)에 사용할 id 또는 email 보유",
                    "after": "Mock PostRepository: findById(999) 조회 실행"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "mockPostRepository",
                  "to": "postService",
                  "verb": "조회 결과 없음",
                  "payload": "Optional.empty",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "Optional.empty",
                    "before": "PostService: 대상 존재 여부 미확정",
                    "after": "PostService: Optional.empty로 대상 없음 확정"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "postService",
                  "to": "testMethod",
                  "verb": "기대 실패 반환",
                  "payload": "throw PostNotFoundException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "throw PostNotFoundException",
                    "before": "PostService: Optional.empty를 받은 조회 흐름",
                    "after": "PostNotFoundException 발생; PostResponse 생성 없이 handler로 이동"
                  },
                  "evidenceScope": "test"
                }
              ]
            },
            {
              "id": "not-found-assert",
              "label": "Then · Assert",
              "description": "실제 예외와 기대 타입을 비교합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "assertionOracle",
                  "verb": "예외 타입 비교",
                  "payload": "assertThrows(PostNotFoundException)",
                  "kind": "compare",
                  "effect": {
                    "kind": "verify",
                    "subject": "assertThrows(PostNotFoundException)",
                    "before": "기대 예외와 실제 실행 결과: 비교 전",
                    "after": "assertThrows(PostNotFoundException): 실제 예외 타입과 일치"
                  },
                  "evidenceScope": "test",
                  "concept": "Expected failure"
                },
                {
                  "from": "assertionOracle",
                  "to": "testMethod",
                  "verb": "기대 실패 확인",
                  "payload": "PASS",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "PASS",
                    "before": "Assertion: 실제 결과 비교 미실행",
                    "after": "Assertion: 기대 조건과 일치해 PASS 결정"
                  },
                  "evidenceScope": "test",
                  "check": "다른 예외이거나 예외가 없으면 FAIL입니다."
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "실제 Database",
              "reason": "없는 데이터 조건은 mock 반환값으로 재현합니다."
            }
          ]
        },
        "route": [
          "Test method",
          "TestFixtureFactory",
          "Mock Repository",
          "PostService",
          "Assertion"
        ],
        "snapshot": [
          { "label": "Mock 결과", "value": "조회 대상 없음" },
          { "label": "Service 결과", "value": "기대 예외" },
          { "label": "Test", "value": "PASS", "tone": "recovered" }
        ],
        "evidence": "PostServiceTest에서 empty stub과 기대 예외 타입을 함께 확인합니다.",
        "outcome": "empty 조회 결과를 지정한 예외 타입으로 바꾸면 Service의 실패 계약을 실행 가능하게 고정할 수 있습니다."
      },
      {
        "id": "auth-service-failure",
        "label": "저장된 비밀번호와 다른 password 로그인",
        "flowId": "service-unit-test",
        "tone": "recovered",
        "prompt": "`password123` hash를 저장한 사용자와 `wrong-password` 요청을 준비했습니다.",
        "observationTitle": "JWT 생성 전 비밀번호 실패",
        "reflection": {
          "prompt": "mock encoder의 반환값과 JWT 미호출이 실패 분기를 어떻게 증명하는지 설명해 보세요.",
          "hint": "`matches(raw, encoded) = false`로 고정하면 예외가 발생하고 JwtTokenProvider에는 도달하지 않습니다."
        },
        "theoryRef": "../../../theory.md#seq-06",
        "prediction": {
          "prompt": "password 비교가 false일 때 어떤 결과와 협력자 상태를 확인해야 할까요?",
          "options": [
            {
              "id": "continue-token",
              "label": "불일치여도 access token을 만든다"
            },
            {
              "id": "stop-at-password",
              "label": "password 비교 실패 뒤 기대 예외와 비교한다"
            }
          ],
          "answer": "stop-at-password",
          "explanation": "`matches == false`이면 인증 예외가 기대 결과이며 JwtTokenProvider 미호출도 함께 확인합니다."
        },
        "diagram": {
          "caption": "UserRepository가 사용자를 반환한 뒤 mock PasswordEncoder가 false를 돌려줘 AuthService가 JWT 생성 전에 중단됩니다.",
          "lanes": [
            {
              "id": "auth-arrange",
              "label": "Given · Arrange",
              "description": "wrong-password 요청, 저장된 hash와 mock 반환값을 준비합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "fixtureFactory",
                  "verb": "로그인 입력 생성",
                  "payload": "LoginRequest(password = wrong-password)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "LoginRequest(password = wrong-password)",
                    "before": "JUnit Test method: 비밀번호 불일치 요청 없음",
                    "after": "TestFixtureFactory: tester@example.com과 wrong-password 요청 생성"
                  },
                  "evidenceScope": "test",
                  "codePointIds": [
                    "fixture-factory"
                  ]
                },
                {
                  "from": "fixtureFactory",
                  "to": "testMethod",
                  "verb": "request 반환",
                  "payload": "tester@example.com + wrong-password",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "tester@example.com + wrong-password",
                    "before": "JUnit Test method: 로그인 실패 입력 미생성",
                    "after": "JUnit Test method: tester email과 wrong-password request 확보"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "testMethod",
                  "to": "passwordEncoder",
                  "verb": "비밀번호 불일치 stub",
                  "payload": "matches(wrong-password, encoded-password) → false",
                  "kind": "config",
                  "effect": {
                    "kind": "preserve",
                    "subject": "matches(wrong-password, encoded-password) → false",
                    "before": "Mock PasswordEncoder: matches 결과 미설정",
                    "after": "Mock PasswordEncoder: 지정한 raw와 hash에 false 반환"
                  },
                  "evidenceScope": "test",
                  "concept": "Mock"
                },
                {
                  "from": "passwordEncoder",
                  "to": "testMethod",
                  "verb": "stub 설정 완료",
                  "payload": "false",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "false",
                    "before": "JUnit Test method: 비교 결과 미고정",
                    "after": "JUnit Test method: 비밀번호 불일치 조건 고정"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "testMethod",
                  "to": "fixtureFactory",
                  "verb": "저장 사용자 생성",
                  "payload": "User(email, encoded-password)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "User(email, encoded-password)",
                    "before": "JUnit Test method: 저장 사용자 fixture 없음",
                    "after": "TestFixtureFactory: tester email과 encoded-password를 가진 User 생성"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "fixtureFactory",
                  "to": "testMethod",
                  "verb": "사용자 fixture 반환",
                  "payload": "savedUser",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "savedUser",
                    "before": "JUnit Test method: Repository가 돌려줄 User 없음",
                    "after": "JUnit Test method: encoded-password를 가진 savedUser 확보"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "testMethod",
                  "to": "mockUserRepository",
                  "verb": "사용자 조회 stub",
                  "payload": "findByEmail(wrongPasswordRequest.email) → savedUser",
                  "kind": "config",
                  "effect": {
                    "kind": "preserve",
                    "subject": "findByEmail(wrongPasswordRequest.email) → savedUser",
                    "before": "Mock collaborator: findByEmail(wrongPasswordRequest.email) 결과 미설정",
                    "after": "Mock collaborator: findByEmail(wrongPasswordRequest.email) 호출 시 savedUser 반환"
                  },
                  "evidenceScope": "test",
                  "concept": "Mock"
                }
              ]
            },
            {
              "id": "auth-act",
              "label": "When · Act",
              "description": "AuthService가 mock PasswordEncoder의 `matches=false` 분기를 실행합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "authService",
                  "verb": "로그인 실행",
                  "payload": "login(request)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "login(request)",
                    "before": "JUnit Test method: method argument login(request) 구성",
                    "after": "AuthService: login(request) method 진입"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["auth-wrong-password-test"]
                },
                {
                  "from": "authService",
                  "to": "mockUserRepository",
                  "verb": "사용자 조회",
                  "payload": "findByEmail(tester@example.com)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "findByEmail(tester@example.com)",
                    "before": "AuthService: findByEmail(tester@example.com)에 사용할 id 또는 email 보유",
                    "after": "Mock UserRepository: findByEmail(tester@example.com) 조회 실행"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "mockUserRepository",
                  "to": "authService",
                  "verb": "GOOGLE 사용자 반환",
                  "payload": "savedUser",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "savedUser",
                    "before": "AuthService: Repository가 돌려줄 User 없음",
                    "after": "AuthService: encoded-password를 가진 savedUser 확보"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "authService",
                  "to": "passwordEncoder",
                  "verb": "비밀번호 비교",
                  "payload": "matches(wrong-password, encoded-password)",
                  "kind": "compare",
                  "effect": {
                    "kind": "verify",
                    "subject": "matches(wrong-password, encoded-password)",
                    "before": "raw password와 저장 hash: 일치 여부 미평가",
                    "after": "PasswordEncoder.matches: false"
                  },
                  "evidenceScope": "test",
                  "concept": "Mock collaborator"
                },
                {
                  "from": "passwordEncoder",
                  "to": "authService",
                  "verb": "불일치 반환",
                  "payload": "false",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "false",
                    "before": "저장 hash와 요청 password의 일치 여부 미평가",
                    "after": "PasswordEncoder.matches=false; JWT 생성 조건 불충족"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "authService",
                  "to": "testMethod",
                  "verb": "인증 실패 예외",
                  "payload": "throw InvalidCredentialsException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "throw InvalidCredentialsException",
                    "before": "AuthService: JWT 발급 분기 진입 가능",
                    "after": "InvalidCredentialsException 발생; createToken 호출과 token 응답 차단"
                  },
                  "evidenceScope": "test",
                  "concept": "Password mismatch"
                }
              ]
            },
            {
              "id": "auth-assert",
              "label": "Then · Assert",
              "description": "InvalidCredentialsException 타입을 확인합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "assertionOracle",
                  "verb": "예외 타입 비교",
                  "payload": "assertThrows(InvalidCredentialsException)",
                  "kind": "compare",
                  "effect": {
                    "kind": "verify",
                    "subject": "assertThrows(InvalidCredentialsException)",
                    "before": "기대 예외와 실제 실행 결과: 비교 전",
                    "after": "assertThrows(InvalidCredentialsException): 실제 예외 타입과 일치"
                  },
                  "evidenceScope": "test",
                  "concept": "Expected failure"
                },
                {
                  "from": "assertionOracle",
                  "to": "testMethod",
                  "verb": "정책 결과 확인",
                  "payload": "PASS",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "PASS",
                    "before": "Assertion: 실제 결과 비교 미실행",
                    "after": "Assertion: 기대 조건과 일치해 PASS 결정"
                  },
                  "evidenceScope": "test"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "JwtTokenProvider",
              "reason": "password 불일치에서 예외가 발생하며 verifyNoInteractions로 token provider 미호출을 확인합니다."
            }
          ]
        },
        "route": [
          "Test method",
          "TestFixtureFactory",
          "Mock PasswordEncoder",
          "Mock UserRepository",
          "AuthService",
          "Assertion"
        ],
        "snapshot": [
          { "label": "Repository 반환", "value": "encoded-password를 가진 User" },
          { "label": "PasswordEncoder.matches", "value": "false" },
          { "label": "Assertion", "value": "InvalidCredentialsException", "tone": "recovered" }
        ],
        "evidence": "UserRepository와 PasswordEncoder를 stub해 InvalidCredentialsException을 확인하고 JwtTokenProvider 미호출도 검증합니다. HTTP 401은 기존 통합 테스트가 맡습니다.",
        "outcome": "비밀번호 비교 실패는 InvalidCredentialsException과 JWT collaborator 미호출을 함께 고정합니다."
      },
      {
        "id": "http-policy-gap",
        "label": "token 없음 · body 제약 위반 · 작성자 불일치",
        "flowId": "status-code-view",
        "tone": "warning",
        "prompt": "기존 회귀 suite는 `token 없음`, `body 제약 위반`, `작성자 불일치`를 서로 다른 HTTP 경계에서 확인합니다.",
        "observationTitle": "기존 suite가 지키는 400·401·403",
        "reflection": {
          "prompt": "신규 단위 테스트와 이미 제공된 HTTP 통합 테스트의 증거 범위를 설명해 보세요.",
          "hint": "Service 예외 assertion은 filter와 handler를 실행하지 않지만 기존 통합 테스트는 실제 status와 ErrorResponse를 확인합니다."
        },
        "theoryRef": "../../../theory.md#seq-06",
        "prediction": {
          "prompt": "세 status를 보존하는 증거는 어디에서 확인해야 할까요?",
          "options": [
            {
              "id": "unit-enough",
              "label": "신규 Service 단위 테스트 네 개만 확인한다"
            },
            {
              "id": "integration-needed",
              "label": "기존 HTTP 통합 테스트의 status와 body assertion을 함께 확인한다"
            }
          ],
          "answer": "integration-needed",
          "explanation": "최신 05의 AuthIntegrationTest, PostAuthorizationIntegrationTest, SecurityErrorHandlerTest가 Validation, Security와 handler를 포함한 증거를 제공합니다."
        },
        "diagram": {
          "caption": "세 lane은 기존 통합 테스트가 Service 밖의 401, 400, 403 정책을 실행하는 경계를 비교합니다.",
          "lanes": [
            {
              "id": "http-401",
              "label": "401 · token 없는 보호 요청",
              "description": "filter는 요청을 계속 보내고 authorization gate가 미인증 요청을 거절합니다.",
              "steps": [
                {
                  "from": "httpClient",
                  "to": "securityFilter",
                  "verb": "보호 API 요청",
                  "payload": "Authorization header 없음",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Authorization header 없음",
                    "before": "HTTP Client: Authorization header 없음 전송 준비",
                    "after": "Security Filter: Authorization header 없음 수신"
                  },
                  "evidenceScope": "concept",
                  "concept": "Authentication"
                },
                {
                  "from": "securityFilter",
                  "to": "authorizationBoundary",
                  "verb": "chain 계속",
                  "payload": "Authentication 없이 filterChain.doFilter",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Authentication 없이 filterChain.doFilter",
                    "before": "Security Filter: Authentication을 만들지 못한 요청",
                    "after": "Spring Security authorization: principal 없는 요청의 authorization 평가 시작"
                  },
                  "evidenceScope": "concept",
                  "concept": "JwtAuthenticationFilter"
                },
                {
                  "from": "authorizationBoundary",
                  "to": "authenticationEntryPoint",
                  "verb": "미인증 접근 거절",
                  "payload": "보호 endpoint authorization 실패",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "보호 endpoint authorization 실패",
                    "before": "보호 endpoint: 인증된 principal 없이 접근 시도",
                    "after": "authorization 거절; Controller method는 실행되지 않음"
                  },
                  "evidenceScope": "concept",
                  "check": "SecurityErrorHandlerTest와 인증 통합 테스트에서 401 status와 ErrorResponse를 확인합니다."
                },
                {
                  "from": "authenticationEntryPoint",
                  "to": "httpClient",
                  "verb": "인증 실패 응답",
                  "payload": "401 Unauthorized + ErrorResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "401 Unauthorized + ErrorResponse",
                    "before": "HTTP Client: HTTP status와 body 미확정",
                    "after": "HTTP Client: 401 Unauthorized + ErrorResponse"
                  },
                  "evidenceScope": "concept"
                }
              ]
            },
            {
              "id": "http-400",
              "label": "400 · Validation 실패",
              "description": "DTO 제약은 Service 호출 전에 요청을 차단합니다.",
              "steps": [
                {
                  "from": "httpClient",
                  "to": "securityFilter",
                  "verb": "인증된 요청",
                  "payload": "valid Bearer + invalid request body",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "valid Bearer + invalid request body",
                    "before": "HTTP Client: valid Bearer + invalid request body 전송 준비",
                    "after": "Security Filter: valid Bearer + invalid request body 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "securityFilter",
                  "to": "validation",
                  "verb": "인증 통과",
                  "payload": "request DTO",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "request DTO",
                    "before": "Security Filter: 테스트 입력 request DTO 구성",
                    "after": "DTO Validation: request DTO 실행"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "validation",
                  "to": "globalExceptionHandler",
                  "verb": "DTO 제약 위반",
                  "payload": "validation error",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "validation error",
                    "before": "invalid request body: Controller 진입 후보",
                    "after": "Validation 실패; Service와 DB 호출 차단"
                  },
                  "evidenceScope": "concept",
                  "concept": "Validation"
                },
                {
                  "from": "globalExceptionHandler",
                  "to": "httpClient",
                  "verb": "검증 실패 응답",
                  "payload": "400 Bad Request + ErrorResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "400 Bad Request + ErrorResponse",
                    "before": "HTTP Client: HTTP status와 body 미확정",
                    "after": "HTTP Client: 400 Bad Request + ErrorResponse"
                  },
                  "evidenceScope": "concept"
                }
              ]
            },
            {
              "id": "http-403",
              "label": "403 · 인가 실패",
              "description": "작성자 gate 예외가 handler에서 403으로 변환됩니다.",
              "steps": [
                {
                  "from": "httpClient",
                  "to": "securityFilter",
                  "verb": "다른 사용자의 수정 요청",
                  "payload": "valid Bearer + PUT /posts/{id}",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "valid Bearer + PUT /posts/{id}",
                    "before": "HTTP Client: valid Bearer + PUT /posts/{id} 전송 준비",
                    "after": "Security Filter: valid Bearer + PUT /posts/{id} 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "securityFilter",
                  "to": "validation",
                  "verb": "인증 통과",
                  "payload": "authenticated request",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "authenticated request",
                    "before": "Security Filter: 테스트 입력 authenticated request 구성",
                    "after": "DTO Validation: authenticated request 실행"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "validation",
                  "to": "postController",
                  "verb": "요청 형식 통과",
                  "payload": "valid PostUpdateRequest",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "valid PostUpdateRequest",
                    "before": "DTO Validation: 테스트 입력 valid PostUpdateRequest 구성",
                    "after": "PostController: valid PostUpdateRequest 실행"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "postController",
                  "to": "postService",
                  "verb": "작성자 정책 확인 요청",
                  "payload": "id + request + currentUserEmail",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "id + request + currentUserEmail",
                    "before": "PostController: 테스트 입력 id + request + currentUserEmail 구성",
                    "after": "PostService: id + request + currentUserEmail 실행"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "postService",
                  "to": "globalExceptionHandler",
                  "verb": "인가 실패",
                  "payload": "ForbiddenPostAccessException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "ForbiddenPostAccessException",
                    "before": "PostEntity: 다른 작성자의 기존 값 유지",
                    "after": "작성자 불일치 예외 발생; UPDATE와 save 호출 차단"
                  },
                  "evidenceScope": "concept",
                  "concept": "Authorization"
                },
                {
                  "from": "globalExceptionHandler",
                  "to": "httpClient",
                  "verb": "인가 실패 응답",
                  "payload": "403 Forbidden + ErrorResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "403 Forbidden + ErrorResponse",
                    "before": "HTTP Client: HTTP status와 body 미확정",
                    "after": "HTTP Client: 403 Forbidden + ErrorResponse"
                  },
                  "evidenceScope": "concept"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "신규 Service unit-test 범위",
              "reason": "이 HTTP 흐름은 기존 통합 테스트의 증거이며 신규 네 Service 단위 테스트가 직접 실행하는 경로는 아닙니다."
            }
          ]
        },
        "route": [
          "HTTP Client",
          "JwtAuthenticationFilter",
          "authorization · Validation · Service policy 분기",
          "AuthenticationEntryPoint · GlobalExceptionHandler",
          "401 · 400 · 403 response"
        ],
        "snapshot": [
          { "label": "신규 단위 테스트", "value": "Service 비즈니스 판단" },
          { "label": "기존 통합 테스트", "value": "HTTP · Validation · Security", "tone": "recovered" },
          { "label": "보존할 응답", "value": "400 · 401 · 403" }
        ],
        "evidence": "AuthIntegrationTest, PostAuthorizationIntegrationTest, SecurityErrorHandlerTest의 status와 ErrorResponse assertion을 보존합니다.",
        "outcome": "신규 Service 테스트와 기존 HTTP 통합 테스트를 함께 실행해야 두 증거 범위를 모두 유지할 수 있습니다."
      }
    ]
  },
  "actors": [
    {
      "id": "student",
      "label": "학생",
      "kind": "person"
    },
    {
      "id": "test",
      "label": "JUnit Test",
      "kind": "ci"
    },
    {
      "id": "fixture",
      "label": "TestFixtureFactory",
      "kind": "logic"
    },
    {
      "id": "service",
      "label": "PostService",
      "kind": "logic"
    },
    {
      "id": "mock",
      "label": "Mock Repository",
      "kind": "logic"
    }
  ],
  "flows": [
    {
      "id": "service-unit-test",
      "title": "Service 단위 테스트 흐름",
      "summary": "given 준비, when 호출, then 검증 순서로 Service 판단을 작게 확인합니다.",
      "mermaid": "sequenceDiagram\n  participant Test as Test method\n  participant Fixture as TestFixtureFactory\n  participant Mock as Mock Repository\n  participant Service as Service under test\n  participant Assert as Assertions\n  Test->>Fixture: request and entity 준비\n  Test->>Mock: repository 동작 설정\n  Test->>Service: service method 호출\n  Service->>Mock: save/findById/findByEmail\n  Mock-->>Service: 준비한 결과 반환\n  Service-->>Test: response or exception\n  Test->>Assert: 기대 결과 검증",
      "steps": [
        {
          "order": 1,
          "actor": "Test method",
          "input": "테스트 이름과 시나리오",
          "owner": "Fixture",
          "action": "요청 DTO와 Entity를 준비합니다.",
          "output": "Test input",
          "note": "반복 준비를 줄여 테스트 의도가 보이게 합니다.",
          "id": "service-unit-test-step-1",
          "from": "Test method",
          "to": "Fixture",
          "message": "요청 DTO와 Entity를 준비합니다.",
          "messageKind": "request",
          "problem": "테스트 이름과 시나리오",
          "concept": "Fixture",
          "check": "Test input",
          "codePointIds": [
            "service-unit-test",
            "fixture-factory"
          ]
        },
        {
          "order": 2,
          "actor": "Test method",
          "input": "의존성 조건",
          "owner": "Mock Repository",
          "action": "Repository 반환값을 테스트가 통제합니다.",
          "output": "Prepared dependency result",
          "note": "Service 판단을 DB 연결과 분리해서 봅니다.",
          "id": "service-unit-test-step-2",
          "from": "Test method",
          "to": "Mock Repository",
          "message": "Repository 반환값을 테스트가 통제합니다.",
          "messageKind": "request",
          "problem": "의존성 조건",
          "concept": "Mock Repository",
          "check": "Prepared dependency result",
          "codePointIds": [
            "fixture-factory",
            "service-unit-test"
          ]
        },
        {
          "order": 3,
          "actor": "Test method",
          "input": "Service call",
          "owner": "Service under test",
          "action": "정상 또는 실패 흐름을 실행합니다.",
          "output": "Response or exception",
          "note": "테스트 대상은 Service의 비즈니스 판단입니다.",
          "id": "service-unit-test-step-3",
          "from": "Test method",
          "to": "Service under test",
          "message": "정상 또는 실패 흐름을 실행합니다.",
          "messageKind": "error",
          "problem": "Service call",
          "concept": "Service under test",
          "check": "Response or exception",
          "codePointIds": [
            "service-unit-test",
            "fixture-factory"
          ]
        },
        {
          "order": 4,
          "actor": "Test method",
          "input": "Actual result",
          "owner": "Assertion",
          "action": "기대 결과와 실제 결과를 비교합니다.",
          "output": "Pass or fail",
          "note": "테스트는 변경 후에도 같은 동작을 믿게 해주는 실행 가능한 문서입니다.",
          "id": "service-unit-test-step-4",
          "from": "Test method",
          "to": "Assertion",
          "message": "기대 결과와 실제 결과를 비교합니다.",
          "messageKind": "response",
          "problem": "Actual result",
          "concept": "Assertion",
          "check": "Pass or fail",
          "codePointIds": [
            "fixture-factory",
            "service-unit-test"
          ]
        }
      ],
      "bandKind": "scenario"
    },
    {
      "id": "status-code-view",
      "title": "API 상태 코드 검증 관점",
      "summary": "신규 Service 테스트와 별개로 기존 통합 테스트가 400, 401, 403 HTTP 정책을 지킵니다.",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "HTTP request",
          "owner": "Spring Security authorization",
          "action": "JWT filter가 Authentication 없이 chain을 계속한 뒤 보호 endpoint authorization이 요청을 거절합니다.",
          "output": "AuthenticationEntryPoint → 401",
          "note": "JWT filter가 직접 401을 쓰는 흐름으로 설명하지 않습니다.",
          "id": "status-code-view-step-1",
          "from": "Client",
          "to": "Spring Security authorization",
          "message": "token이 없으면 Authentication 없이 chain을 계속하고 authorization 경계가 entry point로 401을 만듭니다.",
          "messageKind": "error",
          "problem": "HTTP request",
          "concept": "Filter chain + authorization",
          "check": "401",
          "codePointIds": [
            "service-unit-test",
            "fixture-factory"
          ]
        },
        {
          "order": 2,
          "actor": "Authenticated request",
          "input": "Invalid body",
          "owner": "Validation",
          "action": "요청 DTO 형식 오류를 잡습니다.",
          "output": "400",
          "note": "검증 실패는 Service 판단과 구분합니다.",
          "id": "status-code-view-step-2",
          "from": "Authenticated request",
          "to": "Validation",
          "message": "요청 DTO 형식 오류를 잡습니다.",
          "messageKind": "request",
          "problem": "Invalid body",
          "concept": "Validation",
          "check": "400",
          "codePointIds": [
            "fixture-factory",
            "service-unit-test"
          ]
        },
        {
          "order": 3,
          "actor": "Authenticated user",
          "input": "Forbidden action",
          "owner": "Service policy",
          "action": "인증은 되었지만 허용되지 않은 작업을 막습니다.",
          "output": "403",
          "note": "401과 403은 리뷰에서 반드시 나누어야 합니다.",
          "id": "status-code-view-step-3",
          "from": "Authenticated user",
          "to": "Service policy",
          "message": "인증은 되었지만 허용되지 않은 작업을 막습니다.",
          "messageKind": "response",
          "problem": "Forbidden action",
          "concept": "Service policy",
          "check": "403",
          "codePointIds": [
            "service-unit-test",
            "fixture-factory"
          ]
        },
        {
          "id": "status-code-view-check-4",
          "order": 4,
          "actor": "Service policy",
          "owner": "확인 지점",
          "from": "Service policy",
          "to": "확인 지점",
          "message": "결과와 실패 지점을 확인합니다.",
          "messageKind": "response",
          "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
          "concept": "테스트 결과 확인",
          "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
          "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
          "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
          "codePointIds": [
            "fixture-factory"
          ]
        }
      ],
      "bandKind": "scenario"
    }
  ],
  "flow": [
    {
      "id": "service-unit-test-step-1",
      "label": "Fixture",
      "problem": "테스트 이름과 시나리오",
      "concept": "Fixture",
      "action": "요청 DTO와 Entity를 준비합니다.",
      "check": "Test input",
      "codePointIds": [
        "service-unit-test",
        "fixture-factory"
      ]
    },
    {
      "id": "service-unit-test-step-2",
      "label": "Mock Repository",
      "problem": "의존성 조건",
      "concept": "Mock Repository",
      "action": "Repository 반환값을 테스트가 통제합니다.",
      "check": "Prepared dependency result",
      "codePointIds": [
        "fixture-factory",
        "service-unit-test"
      ]
    },
    {
      "id": "service-unit-test-step-3",
      "label": "Service under test",
      "problem": "Service call",
      "concept": "Service under test",
      "action": "정상 또는 실패 흐름을 실행합니다.",
      "check": "Response or exception",
      "codePointIds": [
        "service-unit-test",
        "fixture-factory"
      ]
    },
    {
      "id": "service-unit-test-step-4",
      "label": "Assertion",
      "problem": "Actual result",
      "concept": "Assertion",
      "action": "기대 결과와 실제 결과를 비교합니다.",
      "check": "Pass or fail",
      "codePointIds": [
        "fixture-factory",
        "service-unit-test"
      ]
    }
  ],
  "codePoints": [
    {
      "id": "service-unit-test",
      "title": "게시글 생성은 저장 인자와 응답을 함께 고정합니다",
      "file": "src/test/kotlin/com/andi/rest_crud/post/service/PostServiceTest.kt",
      "language": "kotlin",
      "snippet": "// 완성 뒤에는 Repository에 전달한 Entity도 확인합니다.\nval captor = ArgumentCaptor.forClass(PostEntity::class.java)\nverify(postRepository).save(captor.capture())\nassertEquals(request.title, captor.value.title)\nassertEquals(request.content, captor.value.content)\nassertEquals(authorEmail, captor.value.author)\nassertEquals(42L, result.id)\nassertEquals(authorEmail, result.author)",
      "explanation": "Repository 입력을 관찰해야 잘못된 title·content·author가 미리 만든 반환값에 가려지지 않습니다.",
      "check": "save 입력 세 필드와 응답 네 필드를 각각 확인합니다."
    },
    {
      "id": "fixture-factory",
      "title": "Fixture는 반복 입력을 한 곳에서 만듭니다",
      "file": "src/test/kotlin/com/andi/rest_crud/support/TestFixtureFactory.kt",
      "language": "kotlin",
      "snippet": "// 기본 title과 content로 반복 가능한 생성 요청 fixture를 만듭니다.\nfun postCreateRequest(\n    title: String = \"테스트 제목\",\n    content: String = \"테스트 내용\"\n): PostCreateRequest = PostCreateRequest(\n    title = title,\n    content = content\n)",
      "explanation": "반복되는 테스트 입력을 fixture로 만들면 실패 케이스만 선명하게 바꿀 수 있습니다.",
      "check": "fixture 기본값과 테스트별 override 값을 구분합니다."
    },
    {
      "id": "auth-login-success-test",
      "title": "로그인 성공은 정규화와 collaborator 호출을 검증합니다",
      "file": "src/test/kotlin/com/andi/rest_crud/auth/service/AuthServiceTest.kt",
      "language": "kotlin",
      "snippet": "// 완성 뒤에는 Service가 조립한 token 응답과 호출 인자를 확인합니다.\n`when`(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true)\n`when`(jwtTokenProvider.createToken(normalizedEmail)).thenReturn(\"access-token\")\n`when`(jwtTokenProvider.expirationSeconds).thenReturn(3600L)\nval result = authService.login(request)\nassertEquals(\"access-token\", result.accessToken)\nassertEquals(\"Bearer\", result.tokenType)\nassertEquals(3600L, result.expiresIn)",
      "explanation": "Service 테스트는 실제 암호화·서명 대신 정규화된 email, password 비교, token과 expiry 조립을 확인합니다.",
      "check": "Repository, PasswordEncoder와 JwtTokenProvider가 기대 인자로 호출됐는지 확인합니다."
    },
    {
      "id": "auth-wrong-password-test",
      "title": "password 불일치는 예외와 JWT 미호출을 검증합니다",
      "file": "src/test/kotlin/com/andi/rest_crud/auth/service/AuthServiceTest.kt",
      "language": "kotlin",
      "snippet": "// 완성 뒤에는 비밀번호 실패가 token 생성 전에 멈추는지 확인합니다.\n`when`(userRepository.findByEmail(normalizedEmail)).thenReturn(Optional.of(savedUser))\n`when`(passwordEncoder.matches(\"wrong-password\", \"encoded-password\")).thenReturn(false)\nassertThrows(InvalidCredentialsException::class.java) {\n    authService.login(request)\n}\nverifyNoInteractions(jwtTokenProvider)",
      "explanation": "Repository와 PasswordEncoder를 mock해 실패 분기를 고정하고 token collaborator가 호출되지 않았음을 확인합니다.",
      "check": "`matches=false`, 기대 예외와 JwtTokenProvider 미호출을 함께 확인합니다."
    }
  ],
  "concepts": [
    {
      "title": "테스트는 실행 가능한 검증입니다",
      "body": "코드 설명이 아니라 변경 후에도 같은 동작을 확인하는 기준입니다."
    },
    {
      "title": "단위 테스트는 원인을 좁힙니다",
      "body": "Service 판단을 HTTP, DB 연결 문제와 분리해서 볼 수 있습니다."
    },
    {
      "title": "fixture는 의도를 보이게 합니다",
      "body": "반복 준비를 줄이되 중요한 실패 조건은 테스트 안에 드러나야 합니다."
    },
    {
      "title": "mock은 판단 범위를 통제합니다",
      "body": "Repository 결과를 테스트가 정해 Service 분기만 확인합니다."
    }
  ],
  "practice": [
    "지금 작성한 테스트가 어떤 Service 동작을 검증하는지 말할 수 있나요?",
    "fixture를 쓰지 않으면 테스트 본문이 어떻게 복잡해지는지 설명할 수 있나요?",
    "mock을 쓰는 이유를 Service 판단 분리 관점으로 설명할 수 있나요?",
    "400, 401, 403 실패 관점을 구분할 수 있나요?"
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
  "topic": "Testing and verification",
  "question": "기능이 많아진 뒤에도 기존 동작을 어떻게 믿을 수 있을까?",
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
    "problem": "기능이 늘어날수록 사람이 정상 케이스와 실패 케이스를 기억으로 확인하기 어렵습니다.",
    "limits": [
      "직접 실행은 정상 흐름만 확인하고 실패 흐름을 놓치기 쉽습니다.",
      "Service 판단을 확인하려는데 DB나 HTTP 설정 문제와 섞일 수 있습니다.",
      "반복 입력값이 길어지면 테스트 본문에서 검증 의도가 보이지 않습니다."
    ],
    "choice": "이번 단계에서는 Service 단위 테스트를 중심으로 fixture와 mock을 사용해 핵심 판단을 좁게 검증합니다."
  },
  "overview": [
    "Test Case",
    "Fixture",
    "Mock Repository",
    "Service",
    "Response or Exception",
    "Assertion",
    "Regression Safety"
  ],
  "responsibilities": [
    {
      "name": "Test method",
      "role": "하나의 동작을 준비하고 실행하고 검증합니다.",
      "caution": "여러 시나리오를 한 테스트에 몰아넣지 않습니다."
    },
    {
      "name": "Fixture",
      "role": "반복 입력값과 객체 생성을 정리합니다.",
      "caution": "중요한 값까지 숨기면 테스트 의도가 흐려집니다."
    },
    {
      "name": "Mock",
      "role": "Service 테스트에서 의존성 결과를 통제합니다.",
      "caution": "Repository 자체를 검증하려는 테스트로 넓히지 않습니다."
    },
    {
      "name": "Assertion",
      "role": "기대 결과와 실제 결과를 비교합니다.",
      "caution": "무엇을 보장하는지 이름과 검증문에 드러나야 합니다."
    }
  ],
  "glossary": [
    {
      "term": "Unit Test",
      "meaning": "작은 범위의 코드가 기대한 결과를 내는지 확인하는 테스트입니다.",
      "caution": "실제 HTTP와 DB 연결 전체를 검증하는 테스트와 다릅니다."
    },
    {
      "term": "Fixture",
      "meaning": "테스트에서 반복해서 사용할 입력값과 객체를 준비하는 도구입니다.",
      "caution": "검증 의도까지 숨기면 안 됩니다."
    },
    {
      "term": "Mock",
      "meaning": "실제 의존성 대신 테스트가 원하는 동작을 하도록 만든 대체 객체입니다.",
      "caution": "모든 테스트를 mock으로 바꾸는 것이 목표는 아닙니다."
    },
    {
      "term": "Assertion",
      "meaning": "실제 결과가 기대 결과와 같은지 확인하는 검증 문장입니다.",
      "caution": "검증문이 없으면 테스트가 무엇을 보장하는지 불분명합니다."
    },
    {
      "term": "Regression",
      "meaning": "기존에 되던 동작이 변경 후 깨지는 현상입니다.",
      "caution": "테스트는 회귀를 빨리 발견하기 위한 장치입니다."
    }
  ],
  "practical": [
    {
      "title": "정상 케이스만으로는 부족합니다",
      "body": "실패 케이스가 깨져도 사용자에게는 장애로 보일 수 있습니다."
    },
    {
      "title": "단위와 통합은 목적이 다릅니다",
      "body": "단위 테스트는 원인을 좁히고, 통합 테스트는 연결 흐름을 확인합니다."
    },
    {
      "title": "401과 403을 같은 실패로 보지 않습니다",
      "body": "보안 흐름의 실패 원인을 정확히 나누는 것이 운영 로그와 리뷰에 중요합니다."
    }
  ],
  "checks": [
    "게시글 생성 테스트가 save 입력과 반환 응답을 각각 확인하는 이유를 말할 수 있나요?",
    "로그인 성공 테스트가 email 정규화, password 비교와 token 응답을 어떻게 고정하는지 설명할 수 있나요?",
    "비밀번호 불일치 뒤 JwtTokenProvider 미호출을 확인하는 이유를 말할 수 있나요?",
    "신규 Service 단위 테스트와 기존 400·401·403 통합 테스트의 증거 범위를 구분할 수 있나요?"
  ],
  "next": {
    "id": "07",
    "title": "Redis Cache",
    "reason": "테스트로 기존 흐름을 고정했다면, 다음에는 조회 성능을 위해 캐시를 붙이면서 hit/miss와 DB fallback 흐름을 안전하게 봅니다."
  }
};
