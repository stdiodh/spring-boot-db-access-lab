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
          "owner": "Security Filter",
          "action": "토큰이 없거나 잘못되면 인증 실패로 멈춥니다.",
          "output": "401",
          "note": "인증 실패는 Controller 전 단계에서 끝날 수 있습니다.",
          "id": "status-code-view-step-1",
          "from": "Client",
          "to": "Security Filter",
          "message": "토큰이 없거나 잘못되면 인증 실패로 멈춥니다.",
          "messageKind": "error",
          "problem": "HTTP request",
          "concept": "Security Filter",
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
      "snippet": "@Test\nfun `create는 요청 값을 저장하고 응답으로 돌려준다`() {\n    val request = TestFixtureFactory.postCreateRequest()\n    val savedPost = TestFixtureFactory.postEntity(id = 1L)\n    `when`(postRepository.save(any(PostEntity::class.java)))\n        .thenReturn(savedPost)\n\n    val result = postService.create(request)\n\n    assertEquals(1L, result.id)\n    assertEquals(request.title, result.title)\n}",
      "explanation": "테스트는 Service가 어떤 입력을 어떤 응답으로 바꿔야 하는지 고정합니다.",
      "check": "테스트가 DB 연결이 아니라 Service 판단을 검증하는지 확인합니다."
    },
    {
      "id": "fixture-factory",
      "title": "Fixture는 반복 입력을 한 곳에서 만듭니다",
      "file": "src/test/kotlin/com/andi/rest_crud/support/TestFixtureFactory.kt",
      "language": "kotlin",
      "snippet": "fun postCreateRequest(\n    title: String = \"테스트 제목\",\n    content: String = \"테스트 내용\",\n    author: String = \"tester\"\n): PostCreateRequest = PostCreateRequest(\n    title = title,\n    content = content,\n    author = author\n)",
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
      "label": "레포 가이드",
      "href": "../../../repo-guide.md"
    },
    {
      "label": "시퀀스 맵",
      "href": "../../../sequence-map.md"
    },
    {
      "label": "브랜치 가이드",
      "href": "../../../branch-guide.md"
    }
  ],
  "relatedCode": [],
  "sequences": [
    {
      "id": "06",
      "title": "Testing",
      "topic": "Testing and verification",
      "question": "기능이 많아진 뒤에도 기존 동작을 어떻게 믿을 수 있을까?",
      "goal": "Service 단위 테스트, fixture, mock, assertion으로 정상/실패 흐름을 실행 가능한 검증으로 남깁니다.",
      "sourceDocs": [
        {
          "label": "레포 가이드",
          "href": "../../../repo-guide.md"
        },
        {
          "label": "시퀀스 맵",
          "href": "../../../sequence-map.md"
        },
        {
          "label": "브랜치 가이드",
          "href": "../../../branch-guide.md"
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
              "owner": "Security Filter",
              "action": "토큰이 없거나 잘못되면 인증 실패로 멈춥니다.",
              "output": "401",
              "note": "인증 실패는 Controller 전 단계에서 끝날 수 있습니다.",
              "id": "status-code-view-step-1",
              "from": "Client",
              "to": "Security Filter",
              "message": "토큰이 없거나 잘못되면 인증 실패로 멈춥니다.",
              "messageKind": "error",
              "problem": "HTTP request",
              "concept": "Security Filter",
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
      "codePoints": [
        {
          "id": "service-unit-test",
          "title": "Service 단위 테스트는 성공 흐름을 고정합니다",
          "file": "src/test/kotlin/com/andi/rest_crud/service/PostServiceTest.kt",
          "language": "kotlin",
          "snippet": "@Test\nfun `create는 요청 값을 저장하고 응답으로 돌려준다`() {\n    val request = TestFixtureFactory.postCreateRequest()\n    val savedPost = TestFixtureFactory.postEntity(id = 1L)\n    `when`(postRepository.save(any(PostEntity::class.java)))\n        .thenReturn(savedPost)\n\n    val result = postService.create(request)\n\n    assertEquals(1L, result.id)\n    assertEquals(request.title, result.title)\n}",
          "explanation": "테스트는 Service가 어떤 입력을 어떤 응답으로 바꿔야 하는지 고정합니다.",
          "check": "테스트가 DB 연결이 아니라 Service 판단을 검증하는지 확인합니다."
        },
        {
          "id": "fixture-factory",
          "title": "Fixture는 반복 입력을 한 곳에서 만듭니다",
          "file": "src/test/kotlin/com/andi/rest_crud/support/TestFixtureFactory.kt",
          "language": "kotlin",
          "snippet": "fun postCreateRequest(\n    title: String = \"테스트 제목\",\n    content: String = \"테스트 내용\",\n    author: String = \"tester\"\n): PostCreateRequest = PostCreateRequest(\n    title = title,\n    content = content,\n    author = author\n)",
          "explanation": "반복되는 테스트 입력을 fixture로 만들면 실패 케이스만 선명하게 바꿀 수 있습니다.",
          "check": "fixture 기본값과 테스트별 override 값을 구분합니다."
        }
      ],
      "problem": "기능이 늘어날수록 사람이 정상 케이스와 실패 케이스를 기억으로 확인하기 어렵습니다."
    }
  ]
};
