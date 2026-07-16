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
  "workbench": {
    "kind": "auth",
    "title": "로그인과 권한을 판단하는 경계",
    "instruction": "로그인과 보호 API 시나리오를 바꾸며 token 발급, 요청 인증, 작성자 인가가 서로 다른 경계에서 판단되는지 확인하세요.",
    "visual": {
      "src": "../../assets/diagrams/04-auth-boundaries.svg",
      "alt": "로그인 자격 확인과 JWT 발급, 보호 요청 인증, 작성자 인가를 분리한 보안 경계 지도",
      "caption": "인증되지 않음과 권한 부족을 서로 다른 판단과 상태로 구분합니다."
    },
    "terms": [
      {
        "term": "인증",
        "meaning": "요청을 보낸 사용자가 누구인지 확인하는 과정입니다."
      },
      {
        "term": "인가",
        "meaning": "확인된 사용자가 특정 동작을 할 수 있는지 정책으로 판단하는 과정입니다."
      },
      {
        "term": "JWT",
        "meaning": "이후 요청에서 사용자 신원을 확인할 수 있도록 서버가 서명해 발급하는 token입니다."
      },
      {
        "term": "SecurityContext",
        "meaning": "인증을 통과한 사용자 정보를 현재 요청 처리에 전달하는 Spring Security 상태입니다."
      }
    ],
    "comparison": {
      "label": "보호 요청 실패의 두 의미",
      "left": {
        "title": "401 · 인증 필요",
        "body": "유효한 사용자 근거가 없어 보호된 Controller에 도달하지 못합니다."
      },
      "right": {
        "title": "403 · 권한 부족",
        "body": "사용자는 확인됐지만 작성자 같은 정책을 만족하지 못해 변경을 막습니다."
      }
    },
    "nodes": {
      "client": {
        "label": "Client",
        "icon": "client",
        "kind": "client",
        "role": "로그인 요청과 보호 API 요청을 보내고 상태 코드를 읽습니다.",
        "systemLayer": "outside",
        "boundary": "HTTP 외부"
      },
      "auth-controller": {
        "label": "AuthController",
        "icon": "api",
        "kind": "api",
        "role": "로그인 HTTP 요청을 AuthService와 연결합니다.",
        "systemLayer": "interface",
        "boundary": "공개 인증 API"
      },
      "auth-service": {
        "label": "AuthService",
        "icon": "service",
        "kind": "service",
        "role": "사용자와 비밀번호를 확인하고 token 발급을 요청합니다.",
        "systemLayer": "application",
        "boundary": "자격 정보 검증",
        "codePointIds": ["jwt-create"]
      },
      "user-repository": {
        "label": "UserRepository",
        "icon": "repository",
        "kind": "repository",
        "role": "email로 내부 사용자를 조회합니다.",
        "systemLayer": "resource",
        "boundary": "사용자 저장소"
      },
      "password-encoder": {
        "label": "PasswordEncoder",
        "icon": "security",
        "kind": "security",
        "role": "raw password와 저장된 hash가 일치하는지 비교합니다.",
        "systemLayer": "application",
        "boundary": "비밀번호 검증"
      },
      "jwt-provider": {
        "label": "JwtTokenProvider",
        "icon": "token",
        "kind": "token",
        "role": "로그인 성공 시 token을 만들고 다음 요청의 token을 검증합니다.",
        "systemLayer": "application",
        "boundary": "Token 발급·검증",
        "codePointIds": ["jwt-create", "jwt-filter"]
      },
      "jwt-filter": {
        "label": "JwtAuthenticationFilter",
        "icon": "security",
        "kind": "security",
        "role": "Bearer token이 유효할 때 Authentication을 만듭니다.",
        "systemLayer": "interface",
        "boundary": "요청 인증",
        "codePointIds": ["jwt-filter"]
      },
      "security-context": {
        "label": "SecurityContext",
        "icon": "security",
        "kind": "security",
        "role": "현재 요청의 인증된 email을 보관합니다.",
        "systemLayer": "interface",
        "boundary": "요청별 인증 상태"
      },
      "security-boundary": {
        "label": "Spring Security authorization",
        "icon": "gate",
        "kind": "gate",
        "role": "authenticated 규칙을 확인하고 Authentication이 없는 보호 요청을 거절합니다.",
        "systemLayer": "interface",
        "boundary": "보호 API 경계",
        "codePointIds": ["jwt-filter"]
      },
      "auth-entry-point": {
        "label": "CustomAuthenticationEntryPoint",
        "icon": "handler",
        "kind": "handler",
        "role": "authorization 경계의 미인증 접근을 401 ErrorResponse로 변환합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP 응답 경계"
      },
      "post-controller": {
        "label": "PostController",
        "icon": "api",
        "kind": "api",
        "role": "인증된 Principal과 게시글 요청을 PostService에 전달합니다.",
        "systemLayer": "interface",
        "boundary": "보호된 게시글 API"
      },
      "post-service": {
        "label": "PostService",
        "icon": "service",
        "kind": "service",
        "role": "현재 사용자와 게시글 작성자를 비교해 resource 인가를 판단합니다.",
        "systemLayer": "application",
        "boundary": "작성자 인가"
      },
      "post-repository": {
        "label": "PostRepository",
        "icon": "repository",
        "kind": "repository",
        "role": "대상 게시글을 조회하고 허용된 변경만 반영합니다.",
        "systemLayer": "resource",
        "boundary": "게시글 영속성"
      },
      "exception-handler": {
        "label": "GlobalExceptionHandler",
        "icon": "handler",
        "kind": "handler",
        "role": "로그인 실패와 작성자 인가 실패를 401·403 ErrorResponse로 변환합니다.",
        "systemLayer": "interface",
        "boundary": "공통 실패 응답"
      }
    },
    "scenarios": [
      {
        "id": "login-success",
        "label": "email·password 로그인 요청",
        "flowId": "login-token",
        "tone": "recovered",
        "prompt": "email과 password가 담긴 로그인 요청에서 서버는 무엇을 먼저 확인해야 할까요?",
        "observationTitle": "저장된 사용자와 password가 맞을 때만 JWT가 발급되는가?",
        "reflection": {
          "prompt": "로그인 자격 증명이 access token으로 바뀌는 두 확인 지점을 설명해 보세요.",
          "hint": "email 조회와 password `matches`가 성공하는지 차례로 확인합니다."
        },
        "theoryRef": "../../../theory.md#seq-04",
        "prediction": {
          "prompt": "token 발급 여부를 정하기 전에 어떤 확인이 필요할까요?",
          "options": [
            {
              "id": "before-password",
              "label": "email만 받으면 비밀번호 확인 전에 발급한다"
            },
            {
              "id": "after-credentials",
              "label": "사용자와 비밀번호를 확인한 뒤 발급한다"
            }
          ],
          "answer": "after-credentials",
          "explanation": "올바른 자격 정보가 확인된 뒤에만 이후 보호 요청의 인증 근거를 만들 수 있습니다."
        },
        "diagram": {
          "caption": "로그인은 저장된 사용자와 password hash를 검증한 뒤 JWT를 발급하며, 그 token의 사용은 다음 요청에서 별도로 시작됩니다.",
          "lanes": [
            {
              "id": "credential-check",
              "label": "자격 정보 확인",
              "description": "LoginRequest의 email로 사용자를 찾고 raw password와 저장된 hash를 비교합니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "auth-controller",
                  "verb": "요청",
                  "payload": "POST /auth/login + LoginRequest",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "POST /auth/login + LoginRequest",
                    "before": "Client: POST /auth/login + LoginRequest 전송 준비",
                    "after": "AuthController: POST /auth/login + LoginRequest 수신"
                  },
                  "evidenceScope": "manual",
                  "concept": "공개 로그인 API",
                  "check": "email과 raw password가 요청 body에 있는지 확인합니다."
                },
                {
                  "from": "auth-controller",
                  "to": "auth-service",
                  "verb": "호출",
                  "payload": "login(request)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "login(request)",
                    "before": "AuthController: method argument login(request) 구성",
                    "after": "AuthService: login(request) method 진입"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-service",
                  "to": "user-repository",
                  "verb": "조회",
                  "payload": "findByEmail(request.email)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "findByEmail(request.email)",
                    "before": "AuthService: findByEmail(request.email)에 사용할 id 또는 email 보유",
                    "after": "UserRepository: findByEmail(request.email) 조회 실행"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "user-repository",
                  "to": "auth-service",
                  "verb": "반환",
                  "payload": "User { password }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "User { password }",
                    "before": "AuthService: email에 해당하는 User 없음",
                    "after": "AuthService: encoded password를 가진 User 확보"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-service",
                  "to": "password-encoder",
                  "verb": "비교",
                  "payload": "matches(request.password, user.password)",
                  "kind": "compare",
                  "effect": {
                    "kind": "verify",
                    "subject": "matches(request.password, user.password)",
                    "before": "raw password와 저장 hash: 일치 여부 미평가",
                    "after": "PasswordEncoder.matches: true 또는 false"
                  },
                  "evidenceScope": "code",
                  "concept": "hash 비교",
                  "check": "복호화가 아니라 matches 비교인지 확인합니다."
                },
                {
                  "from": "password-encoder",
                  "to": "auth-service",
                  "verb": "결과",
                  "payload": "matched = true",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "matched = true",
                    "before": "AuthService: password 일치 여부 미확정",
                    "after": "AuthService: PasswordEncoder.matches=true"
                  },
                  "evidenceScope": "code"
                }
              ]
            },
            {
              "id": "token-issuance",
              "label": "Token 발급",
              "description": "자격 정보 검증이 끝난 뒤 우리 서비스 JWT를 만들어 응답합니다.",
              "steps": [
                {
                  "from": "auth-service",
                  "to": "jwt-provider",
                  "verb": "발급 요청",
                  "payload": "createToken(user.email)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "createToken(user.email)",
                    "before": "AuthService: method argument createToken(user.email) 구성",
                    "after": "JwtTokenProvider: createToken(user.email) method 진입"
                  },
                  "evidenceScope": "code",
                  "concept": "JWT issuance",
                  "check": "비밀번호 불일치 분기에서는 호출되지 않는지 확인합니다.",
                  "codePointIds": [
                    "jwt-create"
                  ]
                },
                {
                  "from": "jwt-provider",
                  "to": "auth-service",
                  "verb": "반환",
                  "payload": "signed JWT",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "signed JWT",
                    "before": "AuthService: access token 없음",
                    "after": "AuthService: email subject와 만료를 가진 signed JWT 확보"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-service",
                  "to": "auth-controller",
                  "verb": "포장",
                  "payload": "TokenResponse { accessToken }",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "TokenResponse { accessToken }",
                    "before": "AuthService: 서명된 JWT 문자열 보유",
                    "after": "AuthController 반환값: accessToken을 담은 TokenResponse"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-controller",
                  "to": "client",
                  "verb": "응답",
                  "payload": "200 OK + TokenResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "200 OK + TokenResponse",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 200 OK + TokenResponse"
                  },
                  "evidenceScope": "runtime",
                  "check": "로그인 응답의 accessToken을 확인합니다."
                }
              ]
            }
          ]
        },
        "route": [
          "Client",
          "AuthController",
          "AuthService",
          "UserRepository",
          "PasswordEncoder",
          "JwtTokenProvider",
          "Client"
        ],
        "snapshot": [
          { "label": "Credential", "value": "일치" },
          { "label": "인증 결과", "value": "사용자 확인", "tone": "recovered" },
          { "label": "Response", "value": "JWT" }
        ],
        "evidence": "로그인 성공 응답의 token과 AuthService의 사용자 조회·비밀번호 확인·token 발급 순서를 확인합니다.",
        "outcome": "로그인 결과로 발급한 JWT가 이후 보호 API 요청에서 사용자를 확인할 근거가 됩니다."
      },
      {
        "id": "login-failure",
        "label": "비밀번호 불일치",
        "flowId": "login-token",
        "tone": "blocked",
        "prompt": "비밀번호가 맞지 않을 때 token 발급은 어느 판단 뒤에 멈춰야 할까요?",
        "observationTitle": "password 불일치가 token 생성 전에 401 흐름을 여는가?",
        "reflection": {
          "prompt": "비밀번호 불일치가 JWT 부재와 401 응답으로 이어지는 규칙은 무엇인가요?",
          "hint": "`matches=false`에서 예외가 발생하므로 `createToken`은 실행되지 않습니다."
        },
        "theoryRef": "../../../theory.md#seq-04",
        "prediction": {
          "prompt": "비밀번호가 일치하지 않으면 JwtTokenProvider 호출은 어떻게 되어야 할까요?",
          "options": [
            {
              "id": "issue-token",
              "label": "실패 정보와 함께 token도 발급한다"
            },
            {
              "id": "stop-before-token",
              "label": "인증 실패로 전환하고 token 발급 전에 멈춘다"
            }
          ],
          "answer": "stop-before-token",
          "explanation": "자격 정보 검증 실패는 token 생성 경계까지 도달하면 안 됩니다."
        },
        "diagram": {
          "caption": "비밀번호 hash 비교가 실패하면 JWT 발급 없이 InvalidCredentialsException이 401 ErrorResponse로 돌아갑니다.",
          "lanes": [
            {
              "id": "failed-credential-check",
              "label": "비밀번호 불일치",
              "description": "사용자는 찾았지만 raw password가 저장된 hash와 일치하지 않습니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "auth-controller",
                  "verb": "요청",
                  "payload": "POST /auth/login + LoginRequest",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "POST /auth/login + LoginRequest",
                    "before": "Client: POST /auth/login + LoginRequest 전송 준비",
                    "after": "AuthController: POST /auth/login + LoginRequest 수신"
                  },
                  "evidenceScope": "manual"
                },
                {
                  "from": "auth-controller",
                  "to": "auth-service",
                  "verb": "호출",
                  "payload": "login(request)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "login(request)",
                    "before": "AuthController: method argument login(request) 구성",
                    "after": "AuthService: login(request) method 진입"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-service",
                  "to": "user-repository",
                  "verb": "조회",
                  "payload": "findByEmail(request.email)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "findByEmail(request.email)",
                    "before": "AuthService: findByEmail(request.email)에 사용할 id 또는 email 보유",
                    "after": "UserRepository: findByEmail(request.email) 조회 실행"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "user-repository",
                  "to": "auth-service",
                  "verb": "반환",
                  "payload": "User { password }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "User { password }",
                    "before": "AuthService: email에 해당하는 User 없음",
                    "after": "AuthService: encoded password를 가진 User 확보"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-service",
                  "to": "password-encoder",
                  "verb": "비교",
                  "payload": "matches(request.password, user.password)",
                  "kind": "compare",
                  "effect": {
                    "kind": "verify",
                    "subject": "matches(request.password, user.password)",
                    "before": "raw password와 저장 hash: 일치 여부 미평가",
                    "after": "PasswordEncoder.matches: true 또는 false"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "password-encoder",
                  "to": "auth-service",
                  "verb": "결과",
                  "payload": "matched = false",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "matched = false",
                    "before": "저장 hash와 요청 password의 일치 여부 미평가",
                    "after": "PasswordEncoder.matches=false; JWT 생성 조건 불충족"
                  },
                  "evidenceScope": "code",
                  "check": "token 발급 조건이 충족되지 않았는지 확인합니다."
                }
              ]
            },
            {
              "id": "failed-login-response",
              "label": "인증 실패 반환",
              "description": "Service 예외를 공통 handler가 401 응답으로 바꿉니다.",
              "steps": [
                {
                  "from": "auth-service",
                  "to": "exception-handler",
                  "verb": "던짐",
                  "payload": "InvalidCredentialsException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "InvalidCredentialsException",
                    "before": "AuthService: JWT 발급 분기 진입 가능",
                    "after": "InvalidCredentialsException 발생; createToken 호출과 token 응답 차단"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "exception-handler",
                  "to": "client",
                  "verb": "응답",
                  "payload": "401 ErrorResponse { INVALID_CREDENTIALS }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "401 ErrorResponse { INVALID_CREDENTIALS }",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 401 ErrorResponse { INVALID_CREDENTIALS }"
                  },
                  "evidenceScope": "runtime",
                  "check": "로그인 실패가 성공 응답으로 처리되지 않는지 확인합니다."
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "JwtTokenProvider",
              "reason": "비밀번호 불일치로 token 발급 조건을 충족하지 못했습니다."
            }
          ]
        },
        "route": [
          "Client",
          "AuthController",
          "AuthService",
          "GlobalExceptionHandler",
          "Client"
        ],
        "snapshot": [
          { "label": "Credential", "value": "불일치", "tone": "blocked" },
          { "label": "Token", "value": "발급하지 않음" },
          { "label": "인증", "value": "실패" }
        ],
        "evidence": "Swagger 또는 HTTP Client에서 잘못된 비밀번호로 로그인해 401 ErrorResponse를 확인하고, AuthService.login의 비밀번호 비교 뒤 InvalidCredentialsException 분기와 token 생성 위치를 코드로 대조합니다.",
        "outcome": "사용자 확인에 실패하면 JwtTokenProvider까지 신호를 보내지 않습니다.",
        "stopAfter": 2
      },
      {
        "id": "missing-token",
        "label": "토큰 없는 보호 요청",
        "flowId": "protected-api",
        "tone": "blocked",
        "prompt": "Authorization header가 없는 보호 API 요청은 filter chain에서 어떤 경계를 거칠까요?",
        "observationTitle": "Bearer token이 없으면 Authentication 없이 인가 단계에 도달하는가?",
        "reflection": {
          "prompt": "filter의 계속 진행과 인가 거절이 함께 401을 만드는 규칙을 설명해 보세요.",
          "hint": "filter가 직접 401을 쓰는 것이 아니라 빈 SecurityContext로 chain을 넘긴 뒤 entry point가 응답합니다."
        },
        "theoryRef": "../../../theory.md#seq-04",
        "prediction": {
          "prompt": "JWT filter가 Authentication을 만들지 못한 뒤 어느 구성 요소가 401 응답을 완성할까요?",
          "options": [
            {
              "id": "controller-first",
              "label": "Controller가 실행된 뒤 401을 만든다"
            },
            {
              "id": "authorization-entry-point",
              "label": "filter가 chain을 계속하고 authorization 경계와 entry point가 처리한다"
            }
          ],
          "answer": "authorization-entry-point",
          "explanation": "JWT filter는 Authentication 없이 chain을 계속하고, 보호 endpoint의 authorization 경계가 요청을 거절하면 entry point가 401을 씁니다."
        },
        "diagram": {
          "caption": "JWT filter는 header가 없을 때 직접 401을 쓰지 않고 인증 객체 없이 chain을 계속하며, 보호 API 경계의 entry point가 401을 반환합니다.",
          "lanes": [
            {
              "id": "missing-token-return",
              "label": "미인증 보호 요청",
              "description": "Authentication이 만들어지지 않은 요청이 authorization 경계에서 거절됩니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "jwt-filter",
                  "verb": "전송",
                  "payload": "보호 API request + Authorization 없음",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "보호 API request + Authorization 없음",
                    "before": "Client: 보호 API request + Authorization 없음 전송 준비",
                    "after": "JwtAuthenticationFilter: 보호 API request + Authorization 없음 수신"
                  },
                  "evidenceScope": "manual",
                  "concept": "Bearer token 누락",
                  "check": "Authorization header가 없는지 확인합니다."
                },
                {
                  "from": "jwt-filter",
                  "to": "security-boundary",
                  "verb": "계속",
                  "payload": "Authentication 없이 filter chain 진행",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Authentication 없이 filter chain 진행",
                    "before": "JwtAuthenticationFilter: Authentication을 만들지 못한 요청",
                    "after": "Spring Security authorization: principal 없는 요청의 authorization 평가 시작"
                  },
                  "evidenceScope": "code",
                  "concept": "filter와 authorization 책임 분리",
                  "check": "filter가 직접 401을 반환한다고 설명하지 않습니다.",
                  "codePointIds": [
                    "jwt-filter"
                  ]
                },
                {
                  "from": "security-boundary",
                  "to": "auth-entry-point",
                  "verb": "미인증 접근 거절",
                  "payload": "보호 endpoint authorization 실패",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "보호 endpoint authorization 실패",
                    "before": "보호 endpoint: 인증된 principal 없이 접근 시도",
                    "after": "authorization 거절; Controller method는 실행되지 않음"
                  },
                  "evidenceScope": "code",
                  "concept": "AuthenticationEntryPoint",
                  "check": "보호 Controller가 실행되지 않는지 확인합니다."
                },
                {
                  "from": "auth-entry-point",
                  "to": "client",
                  "verb": "응답 작성",
                  "payload": "401 Unauthorized + ErrorResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "401 Unauthorized + ErrorResponse",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 401 Unauthorized + ErrorResponse"
                  },
                  "evidenceScope": "runtime"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "SecurityContext Authentication",
              "reason": "유효한 Bearer token이 없어 인증 객체를 만들지 않았습니다."
            },
            {
              "label": "PostController / PostService",
              "reason": "보호 API authorization 경계에서 요청이 거절됐습니다."
            }
          ]
        },
        "route": [
          "Client",
          "JwtAuthenticationFilter",
          "Spring Security authorization",
          "CustomAuthenticationEntryPoint",
          "Client"
        ],
        "snapshot": [
          { "label": "Authorization", "value": "없음", "tone": "blocked" },
          { "label": "Authentication", "value": "만들지 않음" },
          { "label": "Response", "value": "401 Unauthorized" }
        ],
        "evidence": "토큰 없이 보호 API를 호출해 401이 반환되고 Controller 로직이 실행되지 않는지 확인합니다.",
        "outcome": "JWT filter가 chain을 계속하더라도 Authentication이 없는 보호 요청은 authorization 경계에서 거절되고 entry point가 401을 반환합니다.",
        "stopAfter": 2
      },
      {
        "id": "foreign-author",
        "label": "다른 작성자의 글 수정",
        "flowId": "protected-api",
        "tone": "blocked",
        "prompt": "유효한 token이 있어도 게시글을 수정할 수 없는 경우는 어느 정책에서 결정될까요?",
        "observationTitle": "인증된 사용자라도 작성자가 다르면 DB 변경 전에 403이 되는가?",
        "reflection": {
          "prompt": "인증 성공과 게시글 수정 권한이 서로 다른 gate인 이유를 설명해 보세요.",
          "hint": "token은 사용자를 식별하고, `validateAuthor`는 그 사용자와 게시글 author를 다시 비교합니다."
        },
        "theoryRef": "../../../theory.md#seq-04",
        "prediction": {
          "prompt": "유효한 token으로 다른 작성자의 글을 수정하면 어떤 의미의 실패일까요?",
          "options": [
            {
              "id": "unauthenticated",
              "label": "사용자를 알 수 없는 401"
            },
            {
              "id": "forbidden",
              "label": "사용자는 알지만 권한이 없는 403"
            }
          ],
          "answer": "forbidden",
          "explanation": "인증은 통과했지만 작성자 정책을 만족하지 않으므로 인가 실패입니다."
        },
        "diagram": {
          "caption": "유효한 JWT는 요청자를 인증하지만, 게시글 수정 권한은 PostService가 principal email과 작성자를 다시 비교해 결정합니다.",
          "lanes": [
            {
              "id": "authenticated-request",
              "label": "Bearer 검증과 subject 추출",
              "description": "validateToken의 Boolean 결과를 확인한 뒤 getEmail로 subject를 별도로 읽습니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "jwt-filter",
                  "verb": "전송",
                  "payload": "PUT /posts/{id} + Authorization: Bearer <token>",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "PUT /posts/{id} + Authorization: Bearer <token>",
                    "before": "Client: PUT /posts/{id} + Authorization: Bearer <token> 전송 준비",
                    "after": "JwtAuthenticationFilter: PUT /posts/{id} + Authorization: Bearer <token> 수신"
                  },
                  "evidenceScope": "manual"
                },
                {
                  "from": "jwt-filter",
                  "to": "jwt-provider",
                  "verb": "검증",
                  "payload": "validateToken(token)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "validateToken(token)",
                    "before": "JwtAuthenticationFilter: Bearer token 문자열 추출",
                    "after": "JwtTokenProvider: token 서명·만료 검증 실행"
                  },
                  "evidenceScope": "code",
                  "concept": "JWT signature / validity",
                  "check": "token 유효성 검증을 확인합니다."
                },
                {
                  "from": "jwt-provider",
                  "to": "jwt-filter",
                  "verb": "반환",
                  "payload": "valid = true",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "valid = true",
                    "before": "JwtAuthenticationFilter: token 유효 여부 미확정",
                    "after": "JwtAuthenticationFilter: validateToken 결과 true"
                  },
                  "evidenceScope": "code",
                  "concept": "JWT validity",
                  "check": "validateToken의 반환형이 Boolean인지 확인합니다."
                },
                {
                  "from": "jwt-filter",
                  "to": "jwt-provider",
                  "verb": "subject 조회",
                  "payload": "getEmail(token)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "getEmail(token)",
                    "before": "JwtAuthenticationFilter: valid=true지만 principal email 없음",
                    "after": "JwtTokenProvider: 검증된 token의 subject 추출"
                  },
                  "evidenceScope": "code",
                  "concept": "JWT subject"
                },
                {
                  "from": "jwt-provider",
                  "to": "jwt-filter",
                  "verb": "email 반환",
                  "payload": "email",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "email",
                    "before": "JwtAuthenticationFilter: Authentication principal 없음",
                    "after": "JwtAuthenticationFilter: token subject email 확보"
                  },
                  "evidenceScope": "code",
                  "check": "UserRepository 재조회 없이 subject를 읽는지 확인합니다."
                }
              ]
            },
            {
              "id": "security-context-authorization",
              "label": "현재 사용자 등록과 endpoint 허용",
              "description": "email principal을 SecurityContext에 등록하고 보호 endpoint의 인증 조건을 통과합니다.",
              "steps": [
                {
                  "from": "jwt-filter",
                  "to": "security-context",
                  "verb": "등록",
                  "payload": "Authentication(email)",
                  "kind": "event",
                  "effect": {
                    "kind": "persist",
                    "subject": "Authentication(email)",
                    "before": "SecurityContext: authentication 비어 있음",
                    "after": "SecurityContext: Authentication(email) 등록"
                  },
                  "evidenceScope": "code",
                  "concept": "현재 요청의 사용자"
                },
                {
                  "from": "security-context",
                  "to": "security-boundary",
                  "verb": "제공",
                  "payload": "authenticated principal",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "authenticated principal",
                    "before": "Authorization: principal 없음",
                    "after": "Authorization: Authentication(email)의 principal 사용 가능"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "security-boundary",
                  "to": "post-controller",
                  "verb": "허용",
                  "payload": "authenticated PUT request",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "authenticated PUT request",
                    "before": "Spring Security authorization: Authentication(email)로 endpoint 정책 통과",
                    "after": "PostController: principal이 있는 PUT method 진입"
                  },
                  "evidenceScope": "code",
                  "concept": "endpoint authentication policy",
                  "check": "`.authenticated()` 조건을 통과했는지 확인합니다."
                }
              ]
            },
            {
              "id": "ownership-denied",
              "label": "게시글 작성자 인가 실패",
              "description": "인증된 사용자라도 대상 게시글의 작성자가 아니면 Service 정책에서 실패합니다.",
              "steps": [
                {
                  "from": "post-controller",
                  "to": "post-service",
                  "verb": "호출",
                  "payload": "update(id, request, principal.name)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "update(id, request, principal.name)",
                    "before": "PostController: method argument update(id, request, principal.name) 구성",
                    "after": "PostService: update(id, request, principal.name) method 진입"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "post-service",
                  "to": "post-repository",
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
                  "from": "post-repository",
                  "to": "post-service",
                  "verb": "반환",
                  "payload": "PostEntity { author }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "PostEntity { author }",
                    "before": "PostService: 대상 row 또는 Entity 없음",
                    "after": "PostService: PostEntity { author } 확보"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "post-service",
                  "to": "exception-handler",
                  "verb": "비교·던짐",
                  "payload": "principal email != post.author → ForbiddenPostAccessException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "principal email != post.author → ForbiddenPostAccessException",
                    "before": "PostEntity: 다른 작성자의 기존 값 유지",
                    "after": "작성자 불일치 예외 발생; UPDATE와 save 호출 차단"
                  },
                  "evidenceScope": "code",
                  "concept": "resource ownership authorization",
                  "check": "role이 아니라 작성자 비교에서 실패하는지 확인합니다."
                },
                {
                  "from": "exception-handler",
                  "to": "client",
                  "verb": "응답",
                  "payload": "403 ErrorResponse { FORBIDDEN_POST_ACCESS }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "403 ErrorResponse { FORBIDDEN_POST_ACCESS }",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 403 ErrorResponse { FORBIDDEN_POST_ACCESS }"
                  },
                  "evidenceScope": "runtime",
                  "check": "403과 DB 무변경을 확인합니다."
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "PostRepository mutation",
              "reason": "작성자 비교에서 실패해 Entity 변경과 저장이 실행되지 않습니다."
            }
          ]
        },
        "route": [
          "Client",
          "JwtAuthenticationFilter",
          "Security Context",
          "PostService 작성자 검증",
          "PostRepository"
        ],
        "snapshot": [
          { "label": "Authentication", "value": "성공" },
          { "label": "작성자 일치", "value": "아님", "tone": "blocked" },
          { "label": "Response", "value": "403 Forbidden" }
        ],
        "evidence": "현재 사용자 email과 게시글 작성자가 다를 때 작성자 정책 테스트가 403을 반환하는지 확인합니다.",
        "outcome": "인증은 통과하지만 인가에 실패하므로 Repository 변경은 실행하지 않습니다.",
        "stopAfter": 3
      }
    ]
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
  "flows": [
    {
      "id": "login-token",
      "title": "회원가입/로그인과 토큰 발급",
      "summary": "사용자 저장과 비밀번호 확인 이후 JWT가 발급되고 이후 요청의 인증 근거가 됩니다.",
      "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as AuthController\n  participant Service as AuthService\n  participant Jwt as JwtTokenProvider\n  participant Filter as JwtAuthenticationFilter\n  participant Context as SecurityContext\n  participant Authz as Authorization\n  Client->>Controller: POST /auth/login + LoginRequest\n  Controller->>Service: login(request)\n  Service->>Jwt: createToken(user.email)\n  Jwt-->>Client: TokenResponse\n  Client->>Filter: 보호 요청 + Bearer token\n  Filter->>Jwt: validateToken(token)\n  Jwt-->>Filter: true\n  Filter->>Jwt: getEmail(token)\n  Filter->>Context: Authentication(email)\n  Context->>Authz: authenticated principal",
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
          "concept": "로그인 결과 확인",
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
          "concept": "보호 요청 확인",
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
      "concept": "인증 흐름 확인",
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
      "snippet": "// 로그인한 email을 subject로 넣어 만료 시간이 있는 JWT를 만듭니다.\nfun createToken(email: String): String {\n    return Jwts.builder()\n        .subject(email)\n        .issuedAt(Date())\n        .expiration(Date(System.currentTimeMillis() + expirationMs))\n        .signWith(signingKey)\n        .compact()\n}",
      "explanation": "토큰 발급은 로그인 응답에서 일어나고, 다음 요청 인증과 분리해서 봅니다.",
      "check": "발급된 token이 어떤 사용자 식별값을 담는지 확인합니다."
    },
    {
      "id": "jwt-filter",
      "title": "필터는 Authorization 헤더의 토큰을 검증합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/security/JwtAuthenticationFilter.kt",
      "language": "kotlin",
      "snippet": "// 유효한 Bearer token만 현재 요청의 Authentication으로 등록합니다.\nval token = resolveToken(request)\nif (token != null && jwtTokenProvider.validateToken(token)) {\n    val email = jwtTokenProvider.getEmail(token)\n    val authentication = UsernamePasswordAuthenticationToken(email, null, emptyList())\n    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)\n    SecurityContextHolder.getContext().authentication = authentication\n}\nfilterChain.doFilter(request, response)",
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
  "topic": "Authentication and JWT",
  "question": "로그인 이후 요청은 서버가 어떻게 같은 사용자 요청이라고 판단할까?",
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
  }
};
