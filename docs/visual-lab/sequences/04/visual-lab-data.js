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
        "role": "사용자와 LOCAL 로그인 방식, 비밀번호를 확인하고 token 발급을 요청합니다.",
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
        "codePointIds": ["jwt-create", "jwt-validate"]
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
        "prompt": "LoginRequest에 email과 raw password가 있고 저장된 User에는 로그인 방식과 password hash가 있습니다.",
        "observationTitle": "자격 정보 확인 뒤 JWT가 생기는 경로",
        "reflection": {
          "prompt": "사용자 조회, LOCAL 방식 확인, password 비교가 각각 무엇을 확인하는지 자기 말로 적어 보세요.",
          "hint": "email로 계정을 찾고 LOCAL 계정인지 확인한 뒤 password `matches`를 실행합니다."
        },
        "theoryRef": "../../../theory.md#seq-04",
        "prediction": {
          "prompt": "token을 만들기 전에 통과해야 할 세 확인은 무엇일까요?",
          "options": [
            {
              "id": "before-password",
              "label": "email만 받으면 비밀번호 확인 전에 발급한다"
            },
            {
              "id": "after-credentials",
              "label": "사용자, LOCAL 방식, 비밀번호를 확인한 뒤 발급한다"
            }
          ],
          "answer": "after-credentials",
          "explanation": "Repository에서 사용자를 찾고 LOCAL 로그인 방식인지 확인한 뒤 PasswordEncoder로 raw·hash 일치를 판정합니다."
        },
        "diagram": {
          "caption": "AuthService가 User 조회 → LOCAL 방식 → password 일치를 확인한 뒤 JWT 발급을 요청하고 TokenResponse를 반환합니다.",
          "lanes": [
            {
              "id": "credential-check",
              "label": "자격 정보 확인",
              "description": "email 사용자 조회, LOCAL 로그인 방식, raw·hash password 일치를 차례로 확인합니다.",
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
                  "payload": "normalizeEmail → findByEmail(email)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "정규화된 email",
                    "before": "AuthService: 요청 email 원문 보유",
                    "after": "UserRepository: Locale.ROOT로 소문자화한 email 조회 실행"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "user-repository",
                  "to": "auth-service",
                  "verb": "반환",
                  "payload": "User { authProvider, password }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "User { authProvider, password }",
                    "before": "AuthService: email에 해당하는 User 없음",
                    "after": "AuthService: LOCAL 여부와 encoded password를 가진 User 확보"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-service",
                  "to": "auth-service",
                  "verb": "로그인 방식 확인",
                  "payload": "user.authProvider == LOCAL",
                  "kind": "compare",
                  "effect": {
                    "kind": "gate",
                    "subject": "LOCAL password 로그인",
                    "before": "AuthService: 계정의 로그인 방식 미확인",
                    "after": "AuthService: LOCAL 계정만 password 비교 단계로 진행"
                  },
                  "evidenceScope": "code",
                  "concept": "인증 방식 경계",
                  "check": "OAuth 계정을 password 로그인으로 처리하지 않는지 확인합니다."
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
              "description": "세 자격 확인을 통과한 email로 우리 서비스 JWT를 만듭니다.",
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
                  "payload": "TokenResponse { accessToken, tokenType, expiresIn }",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "TokenResponse { accessToken, tokenType, expiresIn }",
                    "before": "AuthService: 서명된 JWT 문자열 보유",
                    "after": "AuthController 반환값: Bearer token과 초 단위 만료 시간을 담은 TokenResponse"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-controller",
                  "to": "client",
                  "verb": "응답",
                  "payload": "200 OK + TokenResponse + Cache-Control: no-store",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "200 OK + no-store",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 200 OK, accessToken/tokenType/expiresIn, Cache-Control: no-store"
                  },
                  "evidenceScope": "runtime",
                  "check": "accessToken, tokenType, expiresIn과 no-store header를 확인합니다."
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
        "evidence": "로그인 성공 응답과 AuthService의 사용자 조회 → LOCAL 방식 → password 비교 → token 생성 순서를 대조합니다. 이 응답만으로 다음 요청 인증은 증명하지 않습니다.",
        "outcome": "사용자 조회, LOCAL 방식, password 일치를 모두 통과한 경우에만 JWT가 발급됩니다."
      },
      {
        "id": "login-failure",
        "label": "비밀번호 불일치",
        "flowId": "login-token",
        "tone": "blocked",
        "prompt": "email의 User는 있지만 raw password가 저장 hash와 다릅니다.",
        "observationTitle": "password 불일치가 token을 막는 지점",
        "reflection": {
          "prompt": "성공 로그인과 이 요청이 처음 갈라지는 지점을 자기 말로 추적해 보세요.",
          "hint": "`matches=false`에서 예외가 발생하므로 `createToken`은 실행되지 않습니다."
        },
        "theoryRef": "../../../theory.md#seq-04",
        "prediction": {
          "prompt": "password가 일치하지 않으면 JwtTokenProvider는 호출되어야 할까요?",
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
          "explanation": "password 비교는 token 생성보다 앞선 자격 정보 gate이므로 실패 뒤 발급을 진행할 수 없습니다."
        },
        "diagram": {
          "caption": "User 조회 뒤 PasswordEncoder.matches가 false이면 Service 예외를 handler가 401로 바꾸고 token 경로는 건너뜁니다.",
          "lanes": [
            {
              "id": "failed-credential-check",
              "label": "비밀번호 불일치",
              "description": "찾은 User의 hash와 요청 password가 일치하는지 판정합니다.",
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
                  "payload": "normalizeEmail → findByEmail(email)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "정규화된 email",
                    "before": "AuthService: 요청 email 원문 보유",
                    "after": "UserRepository: Locale.ROOT로 소문자화한 email 조회 실행"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "user-repository",
                  "to": "auth-service",
                  "verb": "반환",
                  "payload": "User { authProvider, password }",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "User { authProvider, password }",
                    "before": "AuthService: email에 해당하는 User 없음",
                    "after": "AuthService: LOCAL 여부와 encoded password를 가진 User 확보"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "auth-service",
                  "to": "auth-service",
                  "verb": "로그인 방식 확인",
                  "payload": "user.authProvider == LOCAL",
                  "kind": "compare",
                  "effect": {
                    "kind": "gate",
                    "subject": "LOCAL password 로그인",
                    "before": "AuthService: 계정의 로그인 방식 미확인",
                    "after": "AuthService: LOCAL 계정만 password 비교 단계로 진행"
                  },
                  "evidenceScope": "code",
                  "concept": "인증 방식 경계"
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
              "description": "자격 정보 예외를 token 없이 401 공통 응답으로 바꿉니다.",
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
                  "payload": "401 + WWW-Authenticate: Bearer + INVALID_CREDENTIALS",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "401 INVALID_CREDENTIALS",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 401, WWW-Authenticate: Bearer, INVALID_CREDENTIALS"
                  },
                  "evidenceScope": "runtime",
                  "check": "두 로그인 실패가 같은 code/message와 Bearer challenge를 반환하는지 확인합니다."
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
        "evidence": "잘못된 password의 401 응답과 AuthService의 matches 실패 분기를 대조하고 token 생성이 뒤에 있음을 확인합니다.",
        "outcome": "matches가 false이면 JWT를 만들지 않고 InvalidCredentialsException을 401로 변환합니다.",
        "stopAfter": 2
      },
      {
        "id": "missing-token",
        "label": "토큰 없는 보호 요청",
        "flowId": "protected-api",
        "tone": "blocked",
        "prompt": "Authorization header 없이 보호 API를 요청합니다.",
        "observationTitle": "미인증 요청의 filter와 401 책임",
        "reflection": {
          "prompt": "JWT filter와 entry point가 각각 맡는 일을 자기 말로 나눠 보세요.",
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
          "explanation": "token 추출과 보호 endpoint 허용 여부는 서로 다른 책임에서 결정됩니다."
        },
        "diagram": {
          "caption": "요청 → JWT filter에서 Authentication을 만들지 못한 뒤 authorization gate가 거절하고 entry point가 401을 씁니다.",
          "lanes": [
            {
              "id": "missing-token-return",
              "label": "미인증 보호 요청",
              "description": "filter 통과 뒤에도 비어 있는 Authentication을 authorization에서 판정합니다.",
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
                  "payload": "401 + WWW-Authenticate: Bearer + ErrorResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "401 Unauthorized",
                    "before": "Client: HTTP status와 body 미확정",
                    "after": "Client: 401, WWW-Authenticate: Bearer, ErrorResponse"
                  },
                  "evidenceScope": "runtime",
                  "check": "Bearer challenge와 JSON ErrorResponse를 함께 확인합니다."
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
        "evidence": "token 없는 보호 요청의 401과 Controller 미실행을 확인합니다. filter가 직접 401을 썼다는 증거로 해석하지 않습니다.",
        "outcome": "filter chain 진행은 접근 허용이 아니며 Authentication 없는 보호 요청은 authorization에서 401이 됩니다.",
        "stopAfter": 2
      },
      {
        "id": "foreign-author",
        "label": "다른 작성자의 글 수정",
        "flowId": "protected-api",
        "tone": "blocked",
        "prompt": "유효한 token의 email과 수정할 게시글의 author가 다릅니다.",
        "observationTitle": "인증 뒤 작성자 gate가 쓰기를 막는 지점",
        "reflection": {
          "prompt": "같은 token이 본인 글과 다른 사람 글에서 다른 결과를 내는 이유를 적어 보세요.",
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
          "caption": "JWT filter → SecurityContext가 사용자를 등록하고 PostService가 principal email과 author를 비교해 403으로 멈춥니다.",
          "lanes": [
            {
              "id": "authenticated-request",
              "label": "Bearer token을 한 번 검증",
              "description": "token을 한 번 파싱해 서명·만료·issuer·audience와 필수 claim을 확인하고 subject email을 돌려줍니다.",
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
                  "verb": "검증·subject 요청",
                  "payload": "getValidatedSubject(token)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "아직 신뢰하지 않은 Bearer token",
                    "before": "JwtAuthenticationFilter: Bearer token 문자열 추출",
                    "after": "JwtTokenProvider: 한 번의 parsing으로 서명·만료·issuer·audience·issuedAt·subject 검증"
                  },
                  "evidenceScope": "code",
                  "concept": "JWT 단일 parsing",
                  "check": "검증과 subject 추출을 위해 token을 두 번 파싱하지 않는지 확인합니다.",
                  "codePointIds": [
                    "jwt-validate"
                  ]
                },
                {
                  "from": "jwt-provider",
                  "to": "jwt-filter",
                  "verb": "검증된 subject 반환",
                  "payload": "verified subject(email)",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "검증된 email subject",
                    "before": "JwtAuthenticationFilter: Authentication principal 없음",
                    "after": "JwtAuthenticationFilter: Authentication을 만들 수 있는 email 확보"
                  },
                  "evidenceScope": "code",
                  "concept": "검증된 JWT subject",
                  "check": "실패 시 null, 성공 시 email이 반환되고 UserRepository를 다시 조회하지 않는지 확인합니다."
                }
              ]
            },
            {
              "id": "security-context-authorization",
              "label": "현재 사용자 등록과 endpoint 허용",
              "description": "email principal을 현재 요청에 등록해 인증 조건을 통과시킵니다.",
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
              "description": "principal과 author가 다르면 Repository 쓰기 전에 거절합니다.",
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
        "evidence": "작성자 불일치 요청의 403과 Repository 변경 부재를 확인합니다. token 유효성은 이미 통과한 조건입니다.",
        "outcome": "인증은 사용자 신원만 증명하며 author 불일치는 Repository 쓰기 전에 403을 만듭니다.",
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
      "title": "로그인과 토큰 발급",
      "summary": "사용자 조회, LOCAL 방식, 비밀번호 일치 이후 JWT가 발급되고 다음 보호 요청의 인증 근거가 됩니다.",
      "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as AuthController\n  participant Service as AuthService\n  participant Jwt as JwtTokenProvider\n  participant Filter as JwtAuthenticationFilter\n  participant Context as SecurityContext\n  participant Authz as Authorization\n  Client->>Controller: POST /auth/login + LoginRequest\n  Controller->>Service: login(request)\n  Service->>Jwt: createToken(user.email)\n  Jwt-->>Service: signed JWT\n  Service-->>Controller: TokenResponse\n  Controller-->>Client: 200 + TokenResponse + no-store\n  Client->>Filter: 보호 요청 + Bearer token\n  Filter->>Jwt: getValidatedSubject(token)\n  Jwt-->>Filter: verified subject(email)\n  Filter->>Context: Authentication(email)\n  Context->>Authz: authenticated principal",
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
          "action": "사용자, LOCAL 로그인 방식, 비밀번호를 확인합니다.",
          "output": "Authenticated user",
          "note": "비밀번호는 평문 저장 대상이 아니므로 인코더로 비교합니다.",
          "id": "login-token-step-2",
          "from": "AuthController",
          "to": "AuthService",
          "message": "사용자, LOCAL 로그인 방식, 비밀번호를 확인합니다.",
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
          "output": "accessToken + tokenType + expiresIn",
          "note": "토큰은 로그인 이후 요청을 구분하기 위한 압축된 인증 정보입니다.",
          "id": "login-token-step-3",
          "from": "AuthService",
          "to": "JwtTokenProvider",
          "message": "이후 요청에서 확인할 access token을 발급합니다.",
          "messageKind": "response",
          "problem": "Authenticated user",
          "concept": "JwtTokenProvider",
          "check": "TokenResponse + Cache-Control: no-store",
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
      "summary": "보호 요청의 token은 Controller보다 먼저 한 번 검증되고, 검증된 subject만 현재 사용자로 등록됩니다.",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "Authorization header",
          "owner": "JwtAuthenticationFilter",
          "action": "요청에서 token을 꺼내 한 번 파싱하고 검증된 subject를 받습니다.",
          "output": "verified subject 또는 null",
          "note": "서명·만료·issuer·audience·issuedAt·subject를 같은 parsing 결과에서 확인합니다.",
          "id": "protected-api-step-1",
          "from": "Client",
          "to": "JwtAuthenticationFilter",
          "message": "token을 한 번 검증해 subject를 받습니다.",
          "messageKind": "request",
          "problem": "Authorization header",
          "concept": "JwtAuthenticationFilter",
          "check": "getValidatedSubject(token)",
          "codePointIds": [
            "jwt-validate",
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
          "action": "Authentication 없이 계속된 보호 요청을 authorization 경계가 거절합니다.",
          "output": "Unauthorized response",
          "note": "Controller에 도달하지 못하는 실패도 정상적인 보안 흐름입니다.",
          "id": "protected-api-step-3",
          "from": "JwtAuthenticationFilter",
          "to": "Security boundary",
          "message": "보호 요청의 미인증 접근을 401로 바꿉니다.",
          "messageKind": "error",
          "problem": "Missing or invalid token",
          "concept": "Security boundary",
          "check": "401 + WWW-Authenticate: Bearer",
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
      "action": "사용자, LOCAL 로그인 방식, 비밀번호를 확인합니다.",
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
      "snippet": "// 같은 시각과 계약으로 issuer, audience, subject, 만료를 기록합니다.\nval issuedAt = clock.instant()\nreturn Jwts.builder()\n    .issuer(issuer)\n    .audience().add(audience).and()\n    .subject(email)\n    .issuedAt(Date.from(issuedAt))\n    .expiration(Date.from(issuedAt.plusMillis(expirationMs)))\n    .signWith(signingKey, Jwts.SIG.HS256)\n    .compact()",
      "explanation": "발급은 LOCAL 로그인 성공 뒤에만 일어나고, 응답은 tokenType과 expiresIn을 함께 알립니다.",
      "check": "HS256과 issuer, audience, subject, issuedAt, expiration이 함께 설정되는지 확인합니다."
    },
    {
      "id": "jwt-validate",
      "title": "한 번 파싱한 결과에서 검증된 subject를 꺼냅니다",
      "file": "src/main/kotlin/com/andi/rest_crud/security/JwtTokenProvider.kt",
      "language": "kotlin",
      "snippet": "// 검증과 subject 조회를 분리해 같은 token을 두 번 파싱하지 않습니다.\nval parsedToken = jwtParser.parseSignedClaims(token)\nif (parsedToken.header.algorithm != Jwts.SIG.HS256.id) {\n    return null\n}\n\nval claims = parsedToken.payload\nval subject = claims.subject\n\nsubject?.takeIf {\n    it.isNotBlank() && claims.issuedAt != null && claims.expiration != null\n}",
      "explanation": "parser가 서명·만료·issuer·audience를 확인하고, 코드는 알고리즘과 필수 claim까지 확인합니다. 파싱 실패는 null로 끝납니다.",
      "check": "유효성 Boolean을 받은 뒤 subject를 다시 읽는 두 번째 parsing이 없는지 확인합니다."
    },
    {
      "id": "jwt-filter",
      "title": "검증된 subject만 새 SecurityContext에 등록합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/security/JwtAuthenticationFilter.kt",
      "language": "kotlin",
      "snippet": "// 기존 Authentication은 보존하고 검증된 email이 있을 때만 새 context를 만듭니다.\nif (SecurityContextHolder.getContext().authentication == null) {\n    resolveToken(request)\n        ?.let(jwtTokenProvider::getValidatedSubject)\n        ?.let { email -> setAuthentication(request, email) }\n}\nfilterChain.doFilter(request, response)",
      "explanation": "token이 없거나 잘못되면 Authentication을 만들지 않습니다. 공개 API는 계속될 수 있고 보호 API는 authorization 경계에서 401이 됩니다.",
      "check": "빈 Bearer와 변조·만료 token은 Authentication을 만들지 않고, 보호 요청의 401에는 Bearer challenge가 있는지 확인합니다."
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
      "body": "잘못된 Authorization header가 공개 GET에 와도 현재 정책은 요청을 계속하고, 보호 API에서만 401로 거절합니다."
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
      "role": "사용자 조회, LOCAL 로그인 방식, 비밀번호 확인, 토큰 발급 요청을 조립합니다.",
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
