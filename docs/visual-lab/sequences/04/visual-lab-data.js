window.visualLabData = {
  "kind": "sequence",
  "sequence": "04",
  "title": "JWT",
  "subtitle": "Authentication and JWT",
  "goal": "회원가입, 로그인, JWT 발급, 인증 필터, 보호 API 경계를 나눠 인증 흐름을 이해합니다.",
  "problem": "로그인 이후 요청을 구분하지 못하면 보호된 API와 공개 API의 경계가 흐려집니다.",
  "repo": {
    "name": "spring-boot-db-access-lab",
    "path": "spring-boot-db-access-lab"
  },
  "defaultSequence": "04",
  "actors": [
    {
      "id": "user",
      "label": "사용자",
      "kind": "person"
    },
    {
      "id": "client",
      "label": "Client",
      "kind": "client"
    },
    {
      "id": "auth",
      "label": "AuthController",
      "kind": "server"
    },
    {
      "id": "service",
      "label": "AuthService",
      "kind": "logic"
    },
    {
      "id": "jwt",
      "label": "JwtTokenProvider",
      "kind": "logic"
    },
    {
      "id": "filter",
      "label": "JwtAuthenticationFilter",
      "kind": "server"
    }
  ],
  "flows": [
    {
      "id": "login-token",
      "title": "회원가입/로그인과 토큰 발급",
      "summary": "사용자 저장과 비밀번호 확인 이후 JWT가 발급되고 이후 요청의 인증 근거가 됩니다.",
      "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as AuthController\n  participant Service as AuthService\n  participant Repo as UserRepository\n  participant Jwt as JwtTokenProvider\n  Client->>Controller: login request\n  Controller->>Service: login(email, password)\n  Service->>Repo: findByEmail\n  Service->>Service: password check\n  Service->>Jwt: create access token\n  Jwt-->>Service: token\n  Service-->>Controller: token response\n  Controller-->>Client: JSON response",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "LoginRequest",
          "owner": "AuthController",
          "action": "로그인 요청을 받습니다.",
          "output": "email/password",
          "note": "로그인은 토큰을 받기 위한 시작점입니다.",
          "id": "login-token-step-1",
          "from": "Client",
          "to": "AuthController",
          "message": "로그인 요청을 받습니다.",
          "messageKind": "request",
          "problem": "LoginRequest",
          "concept": "AuthController",
          "check": "email/password",
          "codePointIds": [
            "jwt-create",
            "jwt-filter"
          ]
        },
        {
          "order": 2,
          "actor": "AuthController",
          "input": "email/password",
          "owner": "AuthService",
          "action": "사용자를 조회하고 비밀번호를 확인합니다.",
          "output": "Authenticated user",
          "note": "비밀번호는 평문 저장 대상이 아니므로 인코더로 비교합니다.",
          "id": "login-token-step-2",
          "from": "AuthController",
          "to": "AuthService",
          "message": "사용자를 조회하고 비밀번호를 확인합니다.",
          "messageKind": "request",
          "problem": "email/password",
          "concept": "AuthService",
          "check": "Authenticated user",
          "codePointIds": [
            "jwt-filter",
            "jwt-create"
          ]
        },
        {
          "order": 3,
          "actor": "AuthService",
          "input": "Authenticated user",
          "owner": "JwtTokenProvider",
          "action": "이후 요청에서 확인할 access token을 발급합니다.",
          "output": "TokenResponse",
          "note": "토큰은 로그인 이후 요청을 구분하기 위한 압축된 인증 정보입니다.",
          "id": "login-token-step-3",
          "from": "AuthService",
          "to": "JwtTokenProvider",
          "message": "이후 요청에서 확인할 access token을 발급합니다.",
          "messageKind": "response",
          "problem": "Authenticated user",
          "concept": "JwtTokenProvider",
          "check": "TokenResponse",
          "codePointIds": [
            "jwt-create",
            "jwt-filter"
          ]
        },
        {
          "id": "login-token-check-4",
          "order": 4,
          "actor": "JwtTokenProvider",
          "owner": "확인 지점",
          "from": "JwtTokenProvider",
          "to": "확인 지점",
          "message": "결과와 실패 지점을 확인합니다.",
          "messageKind": "response",
          "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
          "concept": "Verification",
          "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
          "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
          "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
          "codePointIds": [
            "jwt-filter"
          ]
        }
      ],
      "bandKind": "scenario"
    },
    {
      "id": "protected-api",
      "title": "보호 API와 인증 필터",
      "summary": "토큰이 있는 이후 요청은 Controller보다 먼저 인증 필터를 지나고, 실패하면 Controller까지 도달하지 않습니다.",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "Authorization header",
          "owner": "JwtAuthenticationFilter",
          "action": "요청에서 token을 꺼내 유효성을 확인합니다.",
          "output": "Authentication or failure",
          "note": "인증 필터는 Controller보다 먼저 실행됩니다.",
          "id": "protected-api-step-1",
          "from": "Client",
          "to": "JwtAuthenticationFilter",
          "message": "요청에서 token을 꺼내 유효성을 확인합니다.",
          "messageKind": "request",
          "problem": "Authorization header",
          "concept": "JwtAuthenticationFilter",
          "check": "Authentication or failure",
          "codePointIds": [
            "jwt-create",
            "jwt-filter"
          ]
        },
        {
          "order": 2,
          "actor": "JwtAuthenticationFilter",
          "input": "Valid token",
          "owner": "Security Context",
          "action": "인증된 사용자 정보를 요청 흐름에 등록합니다.",
          "output": "Authenticated request",
          "note": "Controller는 인증된 요청이라는 전제를 받고 실행됩니다.",
          "id": "protected-api-step-2",
          "from": "JwtAuthenticationFilter",
          "to": "Security Context",
          "message": "인증된 사용자 정보를 요청 흐름에 등록합니다.",
          "messageKind": "request",
          "problem": "Valid token",
          "concept": "Security Context",
          "check": "Authenticated request",
          "codePointIds": [
            "jwt-filter",
            "jwt-create"
          ]
        },
        {
          "order": 3,
          "actor": "JwtAuthenticationFilter",
          "input": "Missing or invalid token",
          "owner": "Security boundary",
          "action": "보호 API 접근을 막고 실패 응답으로 끝냅니다.",
          "output": "Unauthorized response",
          "note": "Controller에 도달하지 못하는 실패도 정상적인 보안 흐름입니다.",
          "id": "protected-api-step-3",
          "from": "JwtAuthenticationFilter",
          "to": "Security boundary",
          "message": "보호 API 접근을 막고 실패 응답으로 끝냅니다.",
          "messageKind": "error",
          "problem": "Missing or invalid token",
          "concept": "Security boundary",
          "check": "Unauthorized response",
          "codePointIds": [
            "jwt-create",
            "jwt-filter"
          ]
        },
        {
          "id": "protected-api-check-4",
          "order": 4,
          "actor": "Security boundary",
          "owner": "확인 지점",
          "from": "Security boundary",
          "to": "확인 지점",
          "message": "결과와 실패 지점을 확인합니다.",
          "messageKind": "response",
          "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
          "concept": "Verification",
          "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
          "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
          "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
          "codePointIds": [
            "jwt-filter"
          ]
        }
      ],
      "bandKind": "scenario"
    }
  ],
  "flow": [
    {
      "id": "login-token-step-1",
      "label": "AuthController",
      "problem": "LoginRequest",
      "concept": "AuthController",
      "action": "로그인 요청을 받습니다.",
      "check": "email/password",
      "codePointIds": [
        "jwt-create",
        "jwt-filter"
      ]
    },
    {
      "id": "login-token-step-2",
      "label": "AuthService",
      "problem": "email/password",
      "concept": "AuthService",
      "action": "사용자를 조회하고 비밀번호를 확인합니다.",
      "check": "Authenticated user",
      "codePointIds": [
        "jwt-filter",
        "jwt-create"
      ]
    },
    {
      "id": "login-token-step-3",
      "label": "JwtTokenProvider",
      "problem": "Authenticated user",
      "concept": "JwtTokenProvider",
      "action": "이후 요청에서 확인할 access token을 발급합니다.",
      "check": "TokenResponse",
      "codePointIds": [
        "jwt-create",
        "jwt-filter"
      ]
    },
    {
      "id": "login-token-check-4",
      "label": "확인 지점",
      "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
      "concept": "Verification",
      "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
      "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
      "codePointIds": [
        "jwt-filter"
      ]
    }
  ],
  "codePoints": [
    {
      "id": "jwt-create",
      "title": "로그인 성공 결과로 JWT를 발급합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/security/JwtTokenProvider.kt",
      "language": "kotlin",
      "snippet": "fun createToken(email: String): String {\n    return Jwts.builder()\n        .subject(email)\n        .issuedAt(Date())\n        .expiration(Date(System.currentTimeMillis() + expirationMs))\n        .signWith(signingKey)\n        .compact()\n}",
      "explanation": "토큰 발급은 로그인 응답에서 일어나고, 다음 요청 인증과 분리해서 봅니다.",
      "check": "발급된 token이 어떤 사용자 식별값을 담는지 확인합니다."
    },
    {
      "id": "jwt-filter",
      "title": "필터는 Authorization 헤더의 토큰을 검증합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/security/JwtAuthenticationFilter.kt",
      "language": "kotlin",
      "snippet": "val token = resolveToken(request)\n\nif (token != null && jwtTokenProvider.validateToken(token)) {\n    val email = jwtTokenProvider.getEmail(token)\n    val authentication = UsernamePasswordAuthenticationToken(email, null, emptyList())\n    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)\n    SecurityContextHolder.getContext().authentication = authentication\n}\n\nfilterChain.doFilter(request, response)",
      "explanation": "보호 API 요청은 필터에서 현재 사용자를 SecurityContext에 넣은 뒤 이어집니다.",
      "check": "토큰 없음은 401, 작성자 불일치는 403으로 분리해 봅니다."
    }
  ],
  "concepts": [
    {
      "title": "인증은 사용자를 확인하는 일입니다",
      "body": "로그인과 토큰 검증은 사용자가 누구인지 확인하는 흐름입니다."
    },
    {
      "title": "발급과 검증은 다릅니다",
      "body": "로그인은 토큰을 발급하고, 이후 요청은 발급된 토큰을 검증합니다."
    },
    {
      "title": "필터는 Controller보다 앞에 있습니다",
      "body": "보호 API 실패는 Controller 코드가 실행되기 전 끝날 수 있습니다."
    },
    {
      "title": "공개 API와 보호 API를 나눕니다",
      "body": "로그인 없이 가능한 요청과 토큰이 필요한 요청의 경계를 설정합니다."
    }
  ],
  "practice": [
    "로그인 요청과 이후 보호 API 요청은 어떤 흐름이 다른가요?",
    "토큰 검증이 Controller보다 먼저 일어나는 이유를 설명할 수 있나요?",
    "401과 403의 차이를 실제 API 상황으로 말할 수 있나요?",
    "OAuth2와 refresh token을 이번 범위 밖으로 남기는 이유를 설명할 수 있나요?"
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
      "id": "04",
      "title": "JWT",
      "topic": "Authentication and JWT",
      "question": "로그인 이후 요청은 서버가 어떻게 같은 사용자 요청이라고 판단할까?",
      "goal": "회원가입, 로그인, JWT 발급, 인증 필터, 보호 API 경계를 나눠 인증 흐름을 이해합니다.",
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
        "problem": "로그인 이후 요청을 구분하지 못하면 보호된 API와 공개 API의 경계가 흐려집니다.",
        "limits": [
          "회원가입과 로그인, 토큰 발급, 토큰 검증을 한 흐름으로 뭉치면 실패 위치가 보이지 않습니다.",
          "인증과 인가를 섞으면 토큰이 없는 상황과 권한이 부족한 상황을 구분하기 어렵습니다.",
          "Controller에 도달하지 못하는 보안 실패도 정상적인 흐름이라는 점을 놓치기 쉽습니다."
        ],
        "choice": "로그인은 토큰 발급 흐름으로, 이후 요청은 인증 필터의 토큰 검증 흐름으로 나누어 봅니다."
      },
      "overview": [
        "Login Request",
        "AuthService",
        "PasswordEncoder",
        "JwtTokenProvider",
        "JwtAuthenticationFilter",
        "Protected API"
      ],
      "flows": [
        {
          "id": "login-token",
          "title": "회원가입/로그인과 토큰 발급",
          "summary": "사용자 저장과 비밀번호 확인 이후 JWT가 발급되고 이후 요청의 인증 근거가 됩니다.",
          "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as AuthController\n  participant Service as AuthService\n  participant Repo as UserRepository\n  participant Jwt as JwtTokenProvider\n  Client->>Controller: login request\n  Controller->>Service: login(email, password)\n  Service->>Repo: findByEmail\n  Service->>Service: password check\n  Service->>Jwt: create access token\n  Jwt-->>Service: token\n  Service-->>Controller: token response\n  Controller-->>Client: JSON response",
          "steps": [
            {
              "order": 1,
              "actor": "Client",
              "input": "LoginRequest",
              "owner": "AuthController",
              "action": "로그인 요청을 받습니다.",
              "output": "email/password",
              "note": "로그인은 토큰을 받기 위한 시작점입니다.",
              "id": "login-token-step-1",
              "from": "Client",
              "to": "AuthController",
              "message": "로그인 요청을 받습니다.",
              "messageKind": "request",
              "problem": "LoginRequest",
              "concept": "AuthController",
              "check": "email/password",
              "codePointIds": [
                "jwt-create",
                "jwt-filter"
              ]
            },
            {
              "order": 2,
              "actor": "AuthController",
              "input": "email/password",
              "owner": "AuthService",
              "action": "사용자를 조회하고 비밀번호를 확인합니다.",
              "output": "Authenticated user",
              "note": "비밀번호는 평문 저장 대상이 아니므로 인코더로 비교합니다.",
              "id": "login-token-step-2",
              "from": "AuthController",
              "to": "AuthService",
              "message": "사용자를 조회하고 비밀번호를 확인합니다.",
              "messageKind": "request",
              "problem": "email/password",
              "concept": "AuthService",
              "check": "Authenticated user",
              "codePointIds": [
                "jwt-filter",
                "jwt-create"
              ]
            },
            {
              "order": 3,
              "actor": "AuthService",
              "input": "Authenticated user",
              "owner": "JwtTokenProvider",
              "action": "이후 요청에서 확인할 access token을 발급합니다.",
              "output": "TokenResponse",
              "note": "토큰은 로그인 이후 요청을 구분하기 위한 압축된 인증 정보입니다.",
              "id": "login-token-step-3",
              "from": "AuthService",
              "to": "JwtTokenProvider",
              "message": "이후 요청에서 확인할 access token을 발급합니다.",
              "messageKind": "response",
              "problem": "Authenticated user",
              "concept": "JwtTokenProvider",
              "check": "TokenResponse",
              "codePointIds": [
                "jwt-create",
                "jwt-filter"
              ]
            },
            {
              "id": "login-token-check-4",
              "order": 4,
              "actor": "JwtTokenProvider",
              "owner": "확인 지점",
              "from": "JwtTokenProvider",
              "to": "확인 지점",
              "message": "결과와 실패 지점을 확인합니다.",
              "messageKind": "response",
              "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
              "concept": "Verification",
              "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
              "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
              "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
              "codePointIds": [
                "jwt-filter"
              ]
            }
          ],
          "bandKind": "scenario"
        },
        {
          "id": "protected-api",
          "title": "보호 API와 인증 필터",
          "summary": "토큰이 있는 이후 요청은 Controller보다 먼저 인증 필터를 지나고, 실패하면 Controller까지 도달하지 않습니다.",
          "steps": [
            {
              "order": 1,
              "actor": "Client",
              "input": "Authorization header",
              "owner": "JwtAuthenticationFilter",
              "action": "요청에서 token을 꺼내 유효성을 확인합니다.",
              "output": "Authentication or failure",
              "note": "인증 필터는 Controller보다 먼저 실행됩니다.",
              "id": "protected-api-step-1",
              "from": "Client",
              "to": "JwtAuthenticationFilter",
              "message": "요청에서 token을 꺼내 유효성을 확인합니다.",
              "messageKind": "request",
              "problem": "Authorization header",
              "concept": "JwtAuthenticationFilter",
              "check": "Authentication or failure",
              "codePointIds": [
                "jwt-create",
                "jwt-filter"
              ]
            },
            {
              "order": 2,
              "actor": "JwtAuthenticationFilter",
              "input": "Valid token",
              "owner": "Security Context",
              "action": "인증된 사용자 정보를 요청 흐름에 등록합니다.",
              "output": "Authenticated request",
              "note": "Controller는 인증된 요청이라는 전제를 받고 실행됩니다.",
              "id": "protected-api-step-2",
              "from": "JwtAuthenticationFilter",
              "to": "Security Context",
              "message": "인증된 사용자 정보를 요청 흐름에 등록합니다.",
              "messageKind": "request",
              "problem": "Valid token",
              "concept": "Security Context",
              "check": "Authenticated request",
              "codePointIds": [
                "jwt-filter",
                "jwt-create"
              ]
            },
            {
              "order": 3,
              "actor": "JwtAuthenticationFilter",
              "input": "Missing or invalid token",
              "owner": "Security boundary",
              "action": "보호 API 접근을 막고 실패 응답으로 끝냅니다.",
              "output": "Unauthorized response",
              "note": "Controller에 도달하지 못하는 실패도 정상적인 보안 흐름입니다.",
              "id": "protected-api-step-3",
              "from": "JwtAuthenticationFilter",
              "to": "Security boundary",
              "message": "보호 API 접근을 막고 실패 응답으로 끝냅니다.",
              "messageKind": "error",
              "problem": "Missing or invalid token",
              "concept": "Security boundary",
              "check": "Unauthorized response",
              "codePointIds": [
                "jwt-create",
                "jwt-filter"
              ]
            },
            {
              "id": "protected-api-check-4",
              "order": 4,
              "actor": "Security boundary",
              "owner": "확인 지점",
              "from": "Security boundary",
              "to": "확인 지점",
              "message": "결과와 실패 지점을 확인합니다.",
              "messageKind": "response",
              "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
              "concept": "Verification",
              "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
              "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
              "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
              "codePointIds": [
                "jwt-filter"
              ]
            }
          ],
          "bandKind": "scenario"
        }
      ],
      "responsibilities": [
        {
          "name": "AuthController",
          "role": "회원가입과 로그인 요청의 HTTP 경계를 담당합니다.",
          "caution": "토큰 생성 세부 로직을 직접 담지 않습니다."
        },
        {
          "name": "AuthService",
          "role": "사용자 조회, 비밀번호 확인, 토큰 발급 요청을 조립합니다.",
          "caution": "필터처럼 매 요청 토큰 검증을 맡지 않습니다."
        },
        {
          "name": "JwtTokenProvider",
          "role": "토큰 생성과 검증 기준을 담당합니다.",
          "caution": "토큰 자체가 모든 권한 정책을 대신하지 않습니다."
        },
        {
          "name": "JwtAuthenticationFilter",
          "role": "보호 API 요청이 Controller에 도달하기 전 token을 확인합니다.",
          "caution": "로그인 API와 이후 요청 검증은 다른 흐름입니다."
        }
      ],
      "concepts": [
        {
          "title": "인증은 사용자를 확인하는 일입니다",
          "body": "로그인과 토큰 검증은 사용자가 누구인지 확인하는 흐름입니다."
        },
        {
          "title": "발급과 검증은 다릅니다",
          "body": "로그인은 토큰을 발급하고, 이후 요청은 발급된 토큰을 검증합니다."
        },
        {
          "title": "필터는 Controller보다 앞에 있습니다",
          "body": "보호 API 실패는 Controller 코드가 실행되기 전 끝날 수 있습니다."
        },
        {
          "title": "공개 API와 보호 API를 나눕니다",
          "body": "로그인 없이 가능한 요청과 토큰이 필요한 요청의 경계를 설정합니다."
        }
      ],
      "glossary": [
        {
          "term": "Authentication",
          "meaning": "요청한 사용자가 누구인지 확인하는 과정입니다.",
          "caution": "특정 작업을 해도 되는지 판단하는 인가와 구분합니다."
        },
        {
          "term": "JWT",
          "meaning": "로그인 결과를 이후 요청에서 확인할 수 있게 담은 토큰입니다.",
          "caution": "토큰을 발급하는 일과 검증하는 일은 다른 흐름입니다."
        },
        {
          "term": "Security filter",
          "meaning": "Controller보다 먼저 요청을 검사하는 보안 경계입니다.",
          "caution": "필터에서 끝나는 실패도 정상적인 요청 처리 흐름입니다."
        },
        {
          "term": "401 / 403",
          "meaning": "401은 인증 실패, 403은 인증 후 권한 부족을 뜻합니다.",
          "caution": "두 상태를 같은 실패로 보면 원인 분석이 흐려집니다."
        }
      ],
      "practical": [
        {
          "title": "JWT는 외부 로그인과 같은 말이 아닙니다",
          "body": "JWT는 우리 서비스 API 요청을 구분하는 방식이고, OAuth2는 다음 시퀀스에서 외부 인증 결과를 받는 흐름입니다."
        },
        {
          "title": "토큰은 로그와 문서에 남기지 않습니다",
          "body": "인증 정보는 디버깅 편의를 위해 노출하면 안 되는 값입니다."
        },
        {
          "title": "refresh token은 이번 범위가 아닙니다",
          "body": "먼저 access token 발급과 검증 흐름을 정확히 말할 수 있어야 합니다."
        }
      ],
      "checks": [
        "로그인 요청과 이후 보호 API 요청은 어떤 흐름이 다른가요?",
        "토큰 검증이 Controller보다 먼저 일어나는 이유를 설명할 수 있나요?",
        "401과 403의 차이를 실제 API 상황으로 말할 수 있나요?",
        "OAuth2와 refresh token을 이번 범위 밖으로 남기는 이유를 설명할 수 있나요?"
      ],
      "next": {
        "id": "05",
        "title": "OAuth2 + SMTP",
        "reason": "자체 로그인과 JWT 발급/검증을 이해했다면, 다음에는 외부 인증 결과를 내부 사용자와 연결하고 계정 복구 메일 흐름을 다룹니다."
      },
      "actors": [
        {
          "id": "user",
          "label": "사용자",
          "kind": "person"
        },
        {
          "id": "client",
          "label": "Client",
          "kind": "client"
        },
        {
          "id": "auth",
          "label": "AuthController",
          "kind": "server"
        },
        {
          "id": "service",
          "label": "AuthService",
          "kind": "logic"
        },
        {
          "id": "jwt",
          "label": "JwtTokenProvider",
          "kind": "logic"
        },
        {
          "id": "filter",
          "label": "JwtAuthenticationFilter",
          "kind": "server"
        }
      ],
      "codePoints": [
        {
          "id": "jwt-create",
          "title": "로그인 성공 결과로 JWT를 발급합니다",
          "file": "src/main/kotlin/com/andi/rest_crud/security/JwtTokenProvider.kt",
          "language": "kotlin",
          "snippet": "fun createToken(email: String): String {\n    return Jwts.builder()\n        .subject(email)\n        .issuedAt(Date())\n        .expiration(Date(System.currentTimeMillis() + expirationMs))\n        .signWith(signingKey)\n        .compact()\n}",
          "explanation": "토큰 발급은 로그인 응답에서 일어나고, 다음 요청 인증과 분리해서 봅니다.",
          "check": "발급된 token이 어떤 사용자 식별값을 담는지 확인합니다."
        },
        {
          "id": "jwt-filter",
          "title": "필터는 Authorization 헤더의 토큰을 검증합니다",
          "file": "src/main/kotlin/com/andi/rest_crud/security/JwtAuthenticationFilter.kt",
          "language": "kotlin",
          "snippet": "val token = resolveToken(request)\n\nif (token != null && jwtTokenProvider.validateToken(token)) {\n    val email = jwtTokenProvider.getEmail(token)\n    val authentication = UsernamePasswordAuthenticationToken(email, null, emptyList())\n    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)\n    SecurityContextHolder.getContext().authentication = authentication\n}\n\nfilterChain.doFilter(request, response)",
          "explanation": "보호 API 요청은 필터에서 현재 사용자를 SecurityContext에 넣은 뒤 이어집니다.",
          "check": "토큰 없음은 401, 작성자 불일치는 403으로 분리해 봅니다."
        }
      ],
      "problem": "로그인 이후 요청을 구분하지 못하면 보호된 API와 공개 API의 경계가 흐려집니다."
    }
  ]
};
