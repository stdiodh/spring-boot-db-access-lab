window.visualLabData = {
  "kind": "sequence",
  "sequence": "06",
  "title": "Testing",
  "subtitle": "Testing and verification",
  "goal": "Service 단위 테스트, fixture, mock, assertion으로 정상/실패 흐름을 실행 가능한 검증으로 남깁니다.",
  "problem": "기능이 늘어날수록 사람이 정상 케이스와 실패 케이스를 기억으로 확인하기 어렵습니다.",
  "repo": {
    "name": "spring-boot-db-access-lab",
    "path": "spring-boot-db-access-lab"
  },
  "defaultSequence": "06",
  "workbench": {
    "kind": "test",
    "title": "테스트 보장 범위 워크벤치",
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
        "boundary": "테스트 대역"
      },
      "postService": {
        "label": "PostService",
        "icon": "service",
        "kind": "service",
        "role": "게시글 생성과 조회 실패 같은 비즈니스 판단을 실행하는 테스트 대상입니다.",
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
        "boundary": "테스트 대역"
      },
      "authService": {
        "label": "AuthService",
        "icon": "service",
        "kind": "service",
        "role": "사용자 종류와 비밀번호를 판단하고 성공 시 token을 만드는 테스트 대상입니다.",
        "boundary": "Service under test"
      },
      "passwordEncoder": {
        "label": "PasswordEncoder",
        "icon": "security",
        "kind": "security",
        "role": "06 기준 단위 테스트에서 실제 구현으로 비밀번호 일치 여부를 계산합니다.",
        "boundary": "실제 협력 객체"
      },
      "jwtTokenProvider": {
        "label": "JwtTokenProvider",
        "icon": "token",
        "kind": "token",
        "role": "인증 성공 시 access token을 만드는 실제 협력 객체입니다.",
        "boundary": "실제 협력 객체"
      },
      "assertionOracle": {
        "label": "Assertion oracle",
        "icon": "evidence",
        "kind": "evidence",
        "role": "응답 필드나 기대 예외를 실제 결과와 비교해 PASS 또는 FAIL을 결정합니다.",
        "boundary": "테스트 검증"
      },
      "httpClient": {
        "label": "HTTP Client",
        "icon": "client",
        "kind": "client",
        "role": "인증 header와 요청 body를 포함한 HTTP 요청을 보냅니다.",
        "boundary": "HTTP 통합 경계"
      },
      "securityFilter": {
        "label": "Security Filter",
        "icon": "security",
        "kind": "security",
        "role": "Bearer token이 유효하면 Authentication을 만들고, token이 없으면 Authentication 없이 다음 filter chain으로 요청을 넘깁니다.",
        "boundary": "HTTP 통합 경계"
      },
      "authorizationBoundary": {
        "label": "Spring Security authorization",
        "icon": "gate",
        "kind": "gate",
        "role": "Authentication이 없는 보호 endpoint 요청을 Controller 진입 전에 거절합니다.",
        "boundary": "HTTP authorization 경계"
      },
      "authenticationEntryPoint": {
        "label": "CustomAuthenticationEntryPoint",
        "icon": "handler",
        "kind": "handler",
        "role": "authorization 경계의 미인증 접근을 401 ErrorResponse로 변환합니다.",
        "boundary": "HTTP 응답 경계"
      },
      "validation": {
        "label": "DTO Validation",
        "icon": "gate",
        "kind": "gate",
        "role": "요청 body의 형식과 제약을 검사합니다.",
        "boundary": "HTTP 통합 경계"
      },
      "postController": {
        "label": "PostController",
        "icon": "api",
        "kind": "api",
        "role": "검증된 HTTP 요청과 현재 사용자를 PostService로 전달합니다.",
        "boundary": "HTTP 통합 경계"
      },
      "globalExceptionHandler": {
        "label": "GlobalExceptionHandler",
        "icon": "handler",
        "kind": "handler",
        "role": "Validation과 Service 예외를 HTTP status와 ErrorResponse로 변환합니다.",
        "boundary": "HTTP 응답 경계"
      }
    },
    "scenarios": [
      {
        "id": "post-service-success",
        "label": "PostCreateRequest + owner email",
        "flowId": "service-unit-test",
        "tone": "recovered",
        "prompt": "create(request, ownerEmail)의 반환 값을 재현 가능하게 비교하려면 어떤 협력 상태가 필요할까요?",
        "prediction": {
          "prompt": "이 Service 호출을 단위 테스트하려면 어느 입력과 협력 결과를 준비할까요?",
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
          "explanation": "외부 DB를 분리하면 Service가 저장 흐름과 응답을 조립하는 책임에 집중할 수 있습니다."
        },
        "diagram": {
          "caption": "PostServiceTest는 Repository 결과를 mock으로 통제하고 반환 PostResponse의 필드를 검증합니다. 이 테스트는 실제 DB 연결을 검증하지 않습니다.",
          "lanes": [
            {
              "id": "arrange",
              "label": "Given · Arrange",
              "description": "fixture로 입력을 만들고 mock Repository가 반환할 저장 결과를 준비합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "fixtureFactory",
                  "verb": "테스트 입력 생성",
                  "payload": "PostCreateRequest + saved PostEntity",
                  "kind": "call",
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
                  "kind": "response"
                },
                {
                  "from": "testMethod",
                  "to": "mockPostRepository",
                  "verb": "저장 결과 stub",
                  "payload": "save(entity) → savedPost",
                  "kind": "config",
                  "concept": "Mock"
                }
              ]
            },
            {
              "id": "act",
              "label": "When · Act",
              "description": "Service가 실제 Repository 대신 준비된 test double을 호출하고 응답을 조립합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "postService",
                  "verb": "생성 흐름 실행",
                  "payload": "create(request, owner@example.com)",
                  "kind": "call",
                  "codePointIds": [
                    "service-unit-test"
                  ]
                },
                {
                  "from": "postService",
                  "to": "mockPostRepository",
                  "verb": "게시글 저장 호출",
                  "payload": "save(PostEntity)",
                  "kind": "call"
                },
                {
                  "from": "mockPostRepository",
                  "to": "postService",
                  "verb": "준비한 결과 반환",
                  "payload": "savedPost",
                  "kind": "response"
                },
                {
                  "from": "postService",
                  "to": "testMethod",
                  "verb": "응답 변환 결과 반환",
                  "payload": "PostResponse",
                  "kind": "response"
                }
              ]
            },
            {
              "id": "assert",
              "label": "Then · Assert",
              "description": "현재 테스트가 실제로 assert하는 응답 필드만 보장 범위로 표시합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "assertionOracle",
                  "verb": "응답 필드 비교",
                  "payload": "id + title + content + author",
                  "kind": "compare",
                  "concept": "Assertion",
                  "check": "create 테스트는 save 호출 횟수를 별도로 verify하지 않습니다."
                },
                {
                  "from": "assertionOracle",
                  "to": "testMethod",
                  "verb": "검증 결과",
                  "payload": "PASS | FAIL",
                  "kind": "response"
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
        "evidence": "PostServiceTest에서 Repository.save 반환값을 stub으로 준비하고, create 결과의 id·title·content·author를 assertEquals로 비교하는지 확인합니다. 이 테스트는 save 호출 횟수를 별도로 verify하지 않습니다.",
        "outcome": "DB 연결 문제와 분리해 Service가 요청을 저장 흐름과 응답으로 조립하는 책임을 보장합니다."
      },
      {
        "id": "post-service-not-found",
        "label": "findById(999) → empty",
        "flowId": "service-unit-test",
        "tone": "recovered",
        "prompt": "Repository가 Optional.empty()를 반환하도록 준비한 뒤 Service 호출에서 무엇을 관찰할까요?",
        "prediction": {
          "prompt": "이 반환 조건에서 assertion 대상은 반환 값과 예외 중 무엇일까요?",
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
          "explanation": "예상한 실패를 assertion으로 명시하면 예외도 올바른 정책 결과로 검증할 수 있습니다."
        },
        "diagram": {
          "caption": "없는 게시글 조건에서 PostNotFoundException이 정확히 발생하면 실패 분기 테스트는 PASS입니다.",
          "lanes": [
            {
              "id": "not-found-act",
              "label": "Given + When",
              "description": "Repository가 empty를 반환하도록 통제한 뒤 실제 Service 조회 분기를 실행합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "mockPostRepository",
                  "verb": "조회 실패 stub",
                  "payload": "findById(999) → Optional.empty",
                  "kind": "config",
                  "concept": "Mock"
                },
                {
                  "from": "testMethod",
                  "to": "postService",
                  "verb": "없는 게시글 조회",
                  "payload": "getById(999)",
                  "kind": "call",
                  "codePointIds": [
                    "service-unit-test"
                  ]
                },
                {
                  "from": "postService",
                  "to": "mockPostRepository",
                  "verb": "게시글 조회 호출",
                  "payload": "findById(999)",
                  "kind": "call"
                },
                {
                  "from": "mockPostRepository",
                  "to": "postService",
                  "verb": "조회 결과 없음",
                  "payload": "Optional.empty",
                  "kind": "response"
                },
                {
                  "from": "postService",
                  "to": "testMethod",
                  "verb": "기대 실패 반환",
                  "payload": "throw PostNotFoundException",
                  "kind": "failure"
                }
              ]
            },
            {
              "id": "not-found-assert",
              "label": "Then · Assert",
              "description": "예외가 발생했다는 사실이 아니라 기대한 타입과 일치하는지를 검증합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "assertionOracle",
                  "verb": "예외 타입 비교",
                  "payload": "assertThrows(PostNotFoundException)",
                  "kind": "compare",
                  "concept": "Expected failure"
                },
                {
                  "from": "assertionOracle",
                  "to": "testMethod",
                  "verb": "기대 실패 확인",
                  "payload": "PASS",
                  "kind": "response",
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
        "evidence": "PostServiceTest가 없는 게시글 조건과 기대 예외 타입을 명시해 실패 분기를 검증하는지 확인합니다.",
        "outcome": "예상한 실패가 정확히 발생하면 테스트는 통과하고 Service의 실패 정책을 실행 가능한 문서로 남깁니다."
      },
      {
        "id": "auth-service-failure",
        "label": "GOOGLE 계정의 password 로그인",
        "flowId": "service-unit-test",
        "tone": "recovered",
        "prompt": "UserRepository가 GOOGLE 사용자를 반환할 때 LOCAL login 요청은 어느 협력 단계까지 진행할까요?",
        "prediction": {
          "prompt": "이 계정 유형에서 AuthService.login 호출의 관찰 대상은 무엇일까요?",
          "options": [
            {
              "id": "continue-credentials",
              "label": "비밀번호를 비교하고 access token을 만든다"
            },
            {
              "id": "stop-at-provider-policy",
              "label": "계정 유형 확인 뒤 기대 예외와 비교한다"
            }
          ],
          "answer": "stop-at-provider-policy",
          "explanation": "AuthService는 password 로그인에서 LOCAL 계정만 허용하므로 GOOGLE 사용자는 비밀번호 비교 전에 InvalidCredentialsException으로 전환됩니다."
        },
        "diagram": {
          "caption": "AuthServiceTest는 UserRepository만 mock으로 두고 실제 BCryptPasswordEncoder와 JwtTokenProvider를 주입합니다. GOOGLE 계정 fixture는 provider 정책에서 거절되므로 Service의 password 비교와 token 생성에는 도달하지 않습니다.",
          "lanes": [
            {
              "id": "auth-arrange",
              "label": "Given · Arrange",
              "description": "login request와 GOOGLE 사용자 fixture를 만들고 UserRepository 조회 결과만 stub으로 준비합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "fixtureFactory",
                  "verb": "로그인 입력 생성",
                  "payload": "LoginRequest",
                  "kind": "call",
                  "codePointIds": [
                    "fixture-factory"
                  ]
                },
                {
                  "from": "fixtureFactory",
                  "to": "testMethod",
                  "verb": "request 반환",
                  "payload": "email + password",
                  "kind": "response"
                },
                {
                  "from": "testMethod",
                  "to": "passwordEncoder",
                  "verb": "fixture 비밀번호 encoding",
                  "payload": "request.password",
                  "kind": "call",
                  "concept": "Real collaborator"
                },
                {
                  "from": "passwordEncoder",
                  "to": "testMethod",
                  "verb": "encoded password 반환",
                  "payload": "bcrypt hash",
                  "kind": "response"
                },
                {
                  "from": "testMethod",
                  "to": "fixtureFactory",
                  "verb": "GOOGLE 사용자 생성",
                  "payload": "authProvider = GOOGLE + providerId",
                  "kind": "call"
                },
                {
                  "from": "fixtureFactory",
                  "to": "testMethod",
                  "verb": "사용자 fixture 반환",
                  "payload": "oauthUser",
                  "kind": "response"
                },
                {
                  "from": "testMethod",
                  "to": "mockUserRepository",
                  "verb": "사용자 조회 stub",
                  "payload": "findByEmail → GOOGLE user",
                  "kind": "config",
                  "concept": "Mock"
                }
              ]
            },
            {
              "id": "auth-act",
              "label": "When · Act",
              "description": "AuthService가 조회한 사용자의 AuthProvider를 password 로그인 정책과 비교합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "authService",
                  "verb": "로그인 실행",
                  "payload": "login(request)",
                  "kind": "call"
                },
                {
                  "from": "authService",
                  "to": "mockUserRepository",
                  "verb": "사용자 조회",
                  "payload": "findByEmail(tester@example.com)",
                  "kind": "call"
                },
                {
                  "from": "mockUserRepository",
                  "to": "authService",
                  "verb": "GOOGLE 사용자 반환",
                  "payload": "oauthUser",
                  "kind": "response"
                },
                {
                  "from": "authService",
                  "to": "testMethod",
                  "verb": "계정 유형 거절",
                  "payload": "throw InvalidCredentialsException",
                  "kind": "failure",
                  "concept": "AuthProvider policy"
                }
              ]
            },
            {
              "id": "auth-assert",
              "label": "Then · Assert",
              "description": "기대 예외 타입과 실제 결과를 비교합니다.",
              "steps": [
                {
                  "from": "testMethod",
                  "to": "assertionOracle",
                  "verb": "예외 타입 비교",
                  "payload": "assertThrows(InvalidCredentialsException)",
                  "kind": "compare",
                  "concept": "Expected failure"
                },
                {
                  "from": "assertionOracle",
                  "to": "testMethod",
                  "verb": "정책 결과 확인",
                  "payload": "PASS",
                  "kind": "response"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "PasswordEncoder.matches",
              "reason": "AuthProvider가 LOCAL이 아닌 분기에서 먼저 예외가 발생합니다. 실제 encoder는 fixture hash 생성에만 사용됩니다."
            },
            {
              "label": "JwtTokenProvider",
              "reason": "계정 유형 확인에서 예외가 발생해 token 생성 코드에 도달하지 않습니다. 현재 테스트는 token provider 미호출을 별도 verify하지 않습니다."
            }
          ]
        },
        "route": [
          "Test method",
          "TestFixtureFactory",
          "실제 BCryptPasswordEncoder",
          "Mock UserRepository",
          "AuthService",
          "Assertion"
        ],
        "snapshot": [
          { "label": "Repository 반환", "value": "AuthProvider.GOOGLE" },
          { "label": "PasswordEncoder.matches", "value": "도달하지 않음" },
          { "label": "Assertion", "value": "InvalidCredentialsException", "tone": "recovered" }
        ],
        "evidence": "AuthServiceTest는 UserRepository만 mock으로 두고 실제 BCryptPasswordEncoder와 JwtTokenProvider를 주입합니다. GOOGLE 사용자 fixture를 반환하도록 stub한 뒤 login 호출이 InvalidCredentialsException을 던지는지 assertThrows로 확인합니다.",
        "outcome": "OAuth 계정의 password 로그인을 거절하는 AuthService 정책을 외부 OAuth Provider 호출 없이 검증합니다."
      },
      {
        "id": "http-policy-gap",
        "label": "token 없음 · body 제약 위반 · 작성자 불일치",
        "flowId": "status-code-view",
        "tone": "warning",
        "prompt": "이 세 HTTP 요청 조건의 status를 관찰하려면 어느 실행 경계가 필요할까요?",
        "prediction": {
          "prompt": "현재 Service 단위 테스트 결과와 별도로 확인해야 할 경계는 무엇일까요?",
          "options": [
            {
              "id": "unit-enough",
              "label": "Service가 통과했으므로 모든 HTTP 상태도 보장된다"
            },
            {
              "id": "integration-needed",
              "label": "Validation과 Security를 포함한 작은 통합 검증이 별도로 필요하다"
            }
          ],
          "answer": "integration-needed",
          "explanation": "HTTP 상태는 Service 밖의 Validation·Security filter·응답 변환 경계에도 의존합니다."
        },
        "diagram": {
          "caption": "아래 세 lane은 06 필수 Service 단위 테스트가 직접 보장하지 않는 HTTP 정책 경계의 개념 지도입니다. 각 status를 보장하려면 별도 HTTP 통합 테스트 증거가 필요합니다.",
          "lanes": [
            {
              "id": "http-401",
              "label": "401 · token 없는 보호 요청",
              "description": "JWT filter는 Authentication 없이 chain을 계속하고, 보호 endpoint의 authorization 경계가 요청을 거절합니다.",
              "steps": [
                {
                  "from": "httpClient",
                  "to": "securityFilter",
                  "verb": "보호 API 요청",
                  "payload": "Authorization header 없음",
                  "kind": "request",
                  "concept": "Authentication"
                },
                {
                  "from": "securityFilter",
                  "to": "authorizationBoundary",
                  "verb": "chain 계속",
                  "payload": "Authentication 없이 filterChain.doFilter",
                  "kind": "call",
                  "concept": "JwtAuthenticationFilter"
                },
                {
                  "from": "authorizationBoundary",
                  "to": "authenticationEntryPoint",
                  "verb": "미인증 접근 거절",
                  "payload": "보호 endpoint authorization 실패",
                  "kind": "failure",
                  "check": "06 Service 단위 테스트만으로는 이 status를 보장하지 않습니다."
                },
                {
                  "from": "authenticationEntryPoint",
                  "to": "httpClient",
                  "verb": "인증 실패 응답",
                  "payload": "401 Unauthorized + ErrorResponse",
                  "kind": "response"
                }
              ]
            },
            {
              "id": "http-400",
              "label": "400 · Validation 실패",
              "description": "인증된 요청이라도 DTO 제약을 통과하지 못하면 Service 전에 중단됩니다.",
              "steps": [
                {
                  "from": "httpClient",
                  "to": "securityFilter",
                  "verb": "인증된 요청",
                  "payload": "valid Bearer + invalid request body",
                  "kind": "request"
                },
                {
                  "from": "securityFilter",
                  "to": "validation",
                  "verb": "인증 통과",
                  "payload": "request DTO",
                  "kind": "call"
                },
                {
                  "from": "validation",
                  "to": "globalExceptionHandler",
                  "verb": "DTO 제약 위반",
                  "payload": "validation error",
                  "kind": "failure",
                  "concept": "Validation"
                },
                {
                  "from": "globalExceptionHandler",
                  "to": "httpClient",
                  "verb": "검증 실패 응답",
                  "payload": "400 Bad Request + ErrorResponse",
                  "kind": "response"
                }
              ]
            },
            {
              "id": "http-403",
              "label": "403 · 인가 실패",
              "description": "인증과 Validation은 통과했지만 작성자 정책에 맞지 않으면 Service 예외가 403으로 변환됩니다.",
              "steps": [
                {
                  "from": "httpClient",
                  "to": "securityFilter",
                  "verb": "다른 사용자의 수정 요청",
                  "payload": "valid Bearer + PUT /posts/{id}",
                  "kind": "request"
                },
                {
                  "from": "securityFilter",
                  "to": "validation",
                  "verb": "인증 통과",
                  "payload": "authenticated request",
                  "kind": "call"
                },
                {
                  "from": "validation",
                  "to": "postController",
                  "verb": "요청 형식 통과",
                  "payload": "valid PostUpdateRequest",
                  "kind": "call"
                },
                {
                  "from": "postController",
                  "to": "postService",
                  "verb": "작성자 정책 확인 요청",
                  "payload": "id + request + currentUserEmail",
                  "kind": "call"
                },
                {
                  "from": "postService",
                  "to": "globalExceptionHandler",
                  "verb": "인가 실패",
                  "payload": "ForbiddenPostAccessException",
                  "kind": "failure",
                  "concept": "Authorization"
                },
                {
                  "from": "globalExceptionHandler",
                  "to": "httpClient",
                  "verb": "인가 실패 응답",
                  "payload": "403 Forbidden + ErrorResponse",
                  "kind": "response"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "06 Service unit-test guarantee",
              "reason": "이 diagram은 필요한 HTTP 경계를 구분하지만 06 필수 단위 테스트 자체의 실행 증거는 아닙니다."
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
          { "label": "현재 보장", "value": "Service 비즈니스 판단" },
          { "label": "미검증 경계", "value": "HTTP · Validation · Security", "tone": "warning" },
          { "label": "후속 후보", "value": "400 · 401 · 403 통합 테스트" }
        ],
        "evidence": "현재 단위 테스트 대상과 status-code-view의 JWT filter·Spring Security authorization·AuthenticationEntryPoint·Validation·HTTP 응답 경계를 대조합니다.",
        "outcome": "Service 테스트 결과를 HTTP 정책 보장으로 과장하지 않고 작은 통합 테스트가 필요한 범위를 구분합니다."
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
      "summary": "이번 직접 구현은 Service 테스트지만, 400, 401, 403은 이후 통합 테스트에서 구분해야 할 실패 관점입니다.",
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
          "concept": "Verification",
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
      "title": "Service 단위 테스트는 성공 흐름을 고정합니다",
      "file": "src/test/kotlin/com/andi/rest_crud/service/PostServiceTest.kt",
      "language": "kotlin",
      "snippet": "@Test\nfun `create는 현재 로그인 사용자를 작성자로 저장한다`() {\n    val request = TestFixtureFactory.postCreateRequest()\n    val savedPost = TestFixtureFactory.postEntity(\n        id = 1L,\n        title = request.title,\n        content = request.content,\n        author = \"owner@example.com\"\n    )\n    `when`(postRepository.save(any(PostEntity::class.java))).thenReturn(savedPost)\n\n    val result = postService.create(request, \"owner@example.com\")\n\n    assertEquals(1L, result.id)\n    assertEquals(\"owner@example.com\", result.author)\n}",
      "explanation": "테스트는 Service가 어떤 입력을 어떤 응답으로 바꿔야 하는지 고정합니다.",
      "check": "테스트가 DB 연결이 아니라 Service 판단을 검증하는지 확인합니다."
    },
    {
      "id": "fixture-factory",
      "title": "Fixture는 반복 입력을 한 곳에서 만듭니다",
      "file": "src/test/kotlin/com/andi/rest_crud/support/TestFixtureFactory.kt",
      "language": "kotlin",
      "snippet": "fun postCreateRequest(\n    title: String = \"테스트 제목\",\n    content: String = \"테스트 내용\"\n): PostCreateRequest = PostCreateRequest(\n    title = title,\n    content = content\n)",
      "explanation": "반복되는 테스트 입력을 fixture로 만들면 실패 케이스만 선명하게 바꿀 수 있습니다.",
      "check": "fixture 기본값과 테스트별 override 값을 구분합니다."
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
    "지금 작성한 테스트가 어떤 Service 동작을 검증하는지 말할 수 있나요?",
    "fixture를 쓰지 않으면 테스트 본문이 어떻게 복잡해지는지 설명할 수 있나요?",
    "mock을 쓰는 이유를 Service 판단 분리 관점으로 설명할 수 있나요?",
    "400, 401, 403 실패 관점을 구분할 수 있나요?"
  ],
  "next": {
    "id": "07",
    "title": "Redis Cache",
    "reason": "테스트로 기존 흐름을 고정했다면, 다음에는 조회 성능을 위해 캐시를 붙이면서 hit/miss와 DB fallback 흐름을 안전하게 봅니다."
  }
};
