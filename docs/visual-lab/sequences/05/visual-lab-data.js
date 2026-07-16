window.visualLabData = {
  "kind": "sequence",
  "sequence": "05",
  "title": "OAuth2 + SMTP",
  "subtitle": "External authentication and account recovery",
  "goal": "검증된 OAuth2 사용자 식별, 계정 충돌 처리, 자체 JWT 발급, SMTP 계정 복구 책임을 나눕니다.",
  "problem": "Google 인증이 성공해도 우리 서비스는 verified email과 providerId로 사용자를 식별하고 기존 계정 충돌을 안전하게 처리해야 합니다.",
  "repo": {
    "name": "spring-boot-db-access-lab",
    "path": "spring-boot-db-access-lab"
  },
  "defaultSequence": "05",
  "workbench": {
    "kind": "trust",
    "title": "외부 계정을 신뢰하는 경계",
    "instruction": "OAuth profile과 계정 복구 상태를 선택해 외부 제공자의 결과를 어디까지 신뢰하고, 우리 서비스가 무엇을 다시 판단하는지 확인하세요.",
    "visual": {
      "src": "../../assets/diagrams/05-external-trust.svg",
      "alt": "OAuth Provider의 profile이 검증된 email과 계정 충돌 확인을 거쳐 내부 JWT 또는 차단으로 이어지는 신뢰 경계",
      "caption": "외부 인증 성공과 우리 서비스의 내부 계정 신뢰 결정을 분리합니다."
    },
    "terms": [
      {
        "term": "OAuth2",
        "meaning": "외부 Provider의 인증 결과를 위임받아 사용자 정보를 확인하는 프로토콜입니다."
      },
      {
        "term": "검증된 email",
        "meaning": "Provider가 소유 확인을 완료했다고 명시한 email만 내부 식별 후보로 사용합니다."
      },
      {
        "term": "Trust boundary",
        "meaning": "외부에서 받은 정보를 내부 계정 근거로 받아들일지 다시 판단하는 경계입니다."
      },
      {
        "term": "SMTP",
        "meaning": "애플리케이션이 메일 발송을 메일 서버에 위임할 때 사용하는 전송 규약입니다."
      }
    ],
    "comparison": {
      "label": "외부 성공과 내부 신뢰 결정",
      "left": {
        "title": "Provider 인증 성공",
        "body": "외부 사용자가 Provider에서 인증됐다는 사실까지만 보장합니다."
      },
      "right": {
        "title": "내부 계정 연결",
        "body": "verified email, providerId, LOCAL 충돌을 확인한 뒤에만 내부 JWT로 이어집니다."
      }
    },
    "nodes": {
      "browser": {
        "label": "Browser",
        "icon": "client",
        "kind": "client",
        "role": "OAuth 시작 요청과 redirect 결과를 주고받습니다.",
        "systemLayer": "outside",
        "boundary": "클라이언트"
      },
      "springSecurity": {
        "label": "Spring Security",
        "icon": "security",
        "kind": "security",
        "role": "OAuth authorization, callback, 인증 객체 생성을 조정합니다.",
        "systemLayer": "interface",
        "boundary": "애플리케이션 보안"
      },
      "googleOAuth": {
        "label": "Google OAuth",
        "icon": "external",
        "kind": "external",
        "role": "사용자를 인증하고 provider profile을 제공합니다.",
        "systemLayer": "integration",
        "boundary": "외부 Identity Provider"
      },
      "oauthProfileLoader": {
        "label": "CustomOAuthUserService",
        "icon": "handler",
        "kind": "handler",
        "role": "외부 profile에서 providerId, email, email_verified를 읽고 신뢰 조건을 검사합니다.",
        "systemLayer": "interface",
        "boundary": "애플리케이션 보안"
      },
      "oauthSuccessHandler": {
        "label": "OAuthLoginSuccessHandler",
        "icon": "response",
        "kind": "handler",
        "role": "검증된 profile을 내부 계정 판단으로 넘기고 redirect 결과를 만듭니다.",
        "systemLayer": "interface",
        "boundary": "애플리케이션 보안"
      },
      "oauthAccountService": {
        "label": "OAuthAccountService",
        "icon": "service",
        "kind": "service",
        "role": "providerId로 사용자를 식별하고 동일 email 계정 충돌을 차단합니다.",
        "systemLayer": "application",
        "boundary": "계정 정책",
        "codePointIds": [
          "oauth-link"
        ]
      },
      "userRepository": {
        "label": "UserRepository",
        "icon": "repository",
        "kind": "repository",
        "role": "외부 식별자와 email로 내부 사용자 상태를 조회합니다.",
        "systemLayer": "resource",
        "boundary": "영속성"
      },
      "jwtTokenProvider": {
        "label": "JwtTokenProvider",
        "icon": "token",
        "kind": "token",
        "role": "내부 사용자 식별 결과로 우리 API용 JWT를 만듭니다.",
        "systemLayer": "application",
        "boundary": "내부 인증"
      },
      "recoveryClient": {
        "label": "Recovery Client",
        "icon": "client",
        "kind": "client",
        "role": "비밀번호 재설정 메일을 요청하고 중립 응답을 받습니다.",
        "systemLayer": "outside",
        "boundary": "클라이언트"
      },
      "accountRecoveryController": {
        "label": "AccountRecoveryController",
        "icon": "api",
        "kind": "api",
        "role": "복구 요청을 받고 계정 존재 여부를 드러내지 않는 응답 경계를 담당합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP API"
      },
      "accountRecoveryService": {
        "label": "AccountRecoveryService",
        "icon": "service",
        "kind": "service",
        "role": "사용자를 조회하고 reset link 생성과 발송 위임을 조립합니다.",
        "systemLayer": "application",
        "boundary": "계정 복구",
        "codePointIds": [
          "smtp-reset"
        ]
      },
      "recoveryMailSender": {
        "label": "RecoveryMailSender",
        "icon": "mail",
        "kind": "service",
        "role": "계정 복구 Service가 의존하는 메일 발송 포트입니다.",
        "systemLayer": "integration",
        "boundary": "메일 포트"
      },
      "smtpAdapter": {
        "label": "SmtpRecoveryMailSender",
        "icon": "external",
        "kind": "external",
        "role": "수신자, 제목, reset link를 SMTP 발송 요청으로 변환합니다.",
        "systemLayer": "integration",
        "boundary": "인프라 어댑터"
      }
    },
    "scenarios": [
      {
        "id": "verified-oauth",
        "label": "검증된 OAuth 사용자",
        "flowId": "oauth-login",
        "tone": "recovered",
        "prompt": "Provider가 providerId, email, email_verified=true인 profile을 돌려줍니다.",
        "observationTitle": "외부 profile을 내부 로그인으로 받는 경계",
        "reflection": {
          "prompt": "Provider 응답과 내부 로그인 사이의 판단을 자기 말로 순서대로 적어 보세요.",
          "hint": "`email_verified`, 내부 계정 조회, provider 사용자 저장, token 전달을 순서대로 연결하세요."
        },
        "theoryRef": "../../../theory.md#seq-05",
        "prediction": {
          "prompt": "Provider 인증 성공 직후 우리 서비스 JWT를 바로 발급해도 될까요?",
          "options": [
            {
              "id": "direct-token",
              "label": "외부 성공만으로 즉시 내부 JWT를 발급한다"
            },
            {
              "id": "internal-checks",
              "label": "providerId·verified email·계정 충돌을 확인한 뒤 발급한다"
            }
          ],
          "answer": "internal-checks",
          "explanation": "Provider 인증과 내부 계정 식별은 서로 다른 주체가 책임지는 판단입니다."
        },
        "diagram": {
          "caption": "Browser ↔ Provider callback 뒤 profile loader → 내부 계정 판단 → JWT fragment redirect로 이어지는 완성 목표입니다.",
          "lanes": [
            {
              "id": "authorization-redirect",
              "label": "Browser redirect + callback",
              "description": "Browser·Provider·Spring Security 사이의 동의와 callback 왕복을 맡습니다.",
              "steps": [
                {
                  "from": "browser",
                  "to": "springSecurity",
                  "verb": "로그인 시작",
                  "payload": "GET /oauth2/authorization/google",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "GET /oauth2/authorization/google",
                    "before": "Browser: GET /oauth2/authorization/google 전송 준비",
                    "after": "Spring Security: GET /oauth2/authorization/google 수신"
                  },
                  "evidenceScope": "concept",
                  "concept": "OAuth2 authorization"
                },
                {
                  "from": "springSecurity",
                  "to": "browser",
                  "verb": "authorization URL 반환",
                  "payload": "302 authorization URL",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "302 authorization URL",
                    "before": "Browser: HTTP status와 body 미확정",
                    "after": "Browser: 302 authorization URL"
                  },
                  "evidenceScope": "concept",
                  "concept": "Redirect"
                },
                {
                  "from": "browser",
                  "to": "googleOAuth",
                  "verb": "외부 인증 요청",
                  "payload": "authorization request",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "authorization request",
                    "before": "Browser: authorization request 전송 준비",
                    "after": "Google OAuth: authorization request 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "googleOAuth",
                  "to": "browser",
                  "verb": "callback URL 반환",
                  "payload": "302 /login/oauth2/code/google + code + state",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "302 /login/oauth2/code/google + code + state",
                    "before": "Browser: HTTP status와 body 미확정",
                    "after": "Browser: 302 /login/oauth2/code/google + code + state"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "browser",
                  "to": "springSecurity",
                  "verb": "인증 결과 callback",
                  "payload": "authorization code + state",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "authorization code + state",
                    "before": "Browser: authorization code + state 전송 준비",
                    "after": "Spring Security: authorization code + state 수신"
                  },
                  "evidenceScope": "concept"
                }
              ]
            },
            {
              "id": "provider-profile",
              "label": "Provider profile",
              "description": "provider user-info에서 식별 값과 verified 상태를 추출합니다.",
              "steps": [
                {
                  "from": "springSecurity",
                  "to": "oauthProfileLoader",
                  "verb": "profile 로딩 위임",
                  "payload": "OAuth2UserRequest",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "OAuth2UserRequest",
                    "before": "Spring Security: OAuth2UserRequest에 필요한 OAuth 값 구성",
                    "after": "CustomOAuthUserService: OAuth2UserRequest 목표 단계 진입"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "oauthProfileLoader",
                  "to": "googleOAuth",
                  "verb": "user-info 요청",
                  "payload": "provider access token",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "provider access token",
                    "before": "CustomOAuthUserService: provider access token 전송 준비",
                    "after": "Google OAuth: provider access token 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "googleOAuth",
                  "to": "oauthProfileLoader",
                  "verb": "검증할 profile 반환",
                  "payload": "sub + email + email_verified",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "sub + email + email_verified",
                    "before": "CustomOAuthUserService: provider profile field가 아직 비어 있음",
                    "after": "CustomOAuthUserService 목표: sub·email·email_verified attributes 확보"
                  },
                  "evidenceScope": "concept",
                  "concept": "Verified email",
                  "check": "email_verified=true인지 확인하고 외부 인증과 내부 로그인을 구분합니다."
                }
              ]
            },
            {
              "id": "internal-account",
              "label": "내부 계정 판단",
              "description": "providerId 식별과 동일 email 충돌을 우리 서비스 정책으로 판정합니다.",
              "steps": [
                {
                  "from": "oauthProfileLoader",
                  "to": "oauthSuccessHandler",
                  "verb": "검증된 인증 전달",
                  "payload": "Authentication + verified attributes",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "Authentication + verified attributes",
                    "before": "OAuth callback: provider attributes만 존재",
                    "after": "Spring Security: verified attributes를 가진 Authentication 구성"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "oauthSuccessHandler",
                  "to": "oauthAccountService",
                  "verb": "내부 로그인 요청",
                  "payload": "OAuthUserProfile",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "OAuthUserProfile",
                    "before": "OAuthLoginSuccessHandler: OAuthUserProfile에 필요한 OAuth 값 구성",
                    "after": "OAuthAccountService: OAuthUserProfile 목표 단계 진입"
                  },
                  "evidenceScope": "concept",
                  "codePointIds": [
                    "oauth-link"
                  ]
                },
                {
                  "from": "oauthAccountService",
                  "to": "userRepository",
                  "verb": "계정 식별과 충돌 조회",
                  "payload": "provider + providerId, then email",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "provider + providerId, then email",
                    "before": "OAuthAccountService: provider + providerId, then email에 필요한 OAuth 값 구성",
                    "after": "UserRepository: provider + providerId, then email 목표 단계 진입"
                  },
                  "evidenceScope": "concept",
                  "concept": "Account linking policy",
                  "codePointIds": [
                    "oauth-link"
                  ]
                },
                {
                  "from": "userRepository",
                  "to": "oauthAccountService",
                  "verb": "계정 상태 반환",
                  "payload": "existing OAuth user | new user candidate",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "existing OAuth user | new user candidate",
                    "before": "OAuthAccountService helper: providerId와 email 조회 결과 미확정",
                    "after": "OAuthAccountService helper: 기존 OAuth User 또는 신규 생성 후보로 분기"
                  },
                  "evidenceScope": "concept"
                }
              ]
            },
            {
              "id": "internal-token-result",
              "label": "내부 token + redirect",
              "description": "받아들인 내부 사용자에게만 JWT와 데모 fragment를 만듭니다.",
              "steps": [
                {
                  "from": "oauthAccountService",
                  "to": "jwtTokenProvider",
                  "verb": "내부 token 발급",
                  "payload": "identified user email",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "identified user email",
                    "before": "OAuthAccountService helper: 내부 User email은 식별됐지만 token 없음",
                    "after": "JwtTokenProvider 목표: 식별된 email을 subject로 token 생성"
                  },
                  "evidenceScope": "concept",
                  "concept": "Internal JWT"
                },
                {
                  "from": "jwtTokenProvider",
                  "to": "oauthAccountService",
                  "verb": "서명된 token 반환",
                  "payload": "signed JWT",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "signed JWT",
                    "before": "OAuthAccountService: access token 없음",
                    "after": "OAuthAccountService: email subject와 만료를 가진 signed JWT 확보"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "oauthAccountService",
                  "to": "oauthSuccessHandler",
                  "verb": "로그인 결과 반환",
                  "payload": "OAuthLoginResponse",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "OAuthLoginResponse",
                    "before": "OAuthLoginSuccessHandler 목표: 내부 사용자와 JWT가 따로 존재",
                    "after": "OAuthLoginSuccessHandler 목표: email·token·provider·isNewUser 응답 확보"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "oauthSuccessHandler",
                  "to": "browser",
                  "verb": "데모 결과 redirect",
                  "payload": "oauth metadata + #access_token",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "oauth metadata + #access_token",
                    "before": "Browser: callback 완료 뒤 우리 서비스 token 없음",
                    "after": "Browser 목표: OAuth metadata와 fragment access_token이 있는 redirect URL"
                  },
                  "evidenceScope": "concept",
                  "check": "fragment 전달은 데모 방식이며 운영 권장 방식이 아닙니다."
                }
              ]
            }
          ]
        },
        "route": [
          "Browser",
          "Spring Security",
          "Google OAuth",
          "OAuth profile loader",
          "OAuthAccountService",
          "JwtTokenProvider",
          "Browser"
        ],
        "snapshot": [
          { "label": "email_verified", "value": "true", "tone": "recovered" },
          { "label": "사용자 식별", "value": "provider + providerId" },
          { "label": "결과 전달", "value": "URL fragment의 JWT" }
        ],
        "evidence": "starter의 public OAuth 메서드는 TODO입니다. `linkOrCreateUser`·`createSuccessResponse`만 코드 근거이며 Google 왕복과 redirect는 완성 후 확인합니다.",
        "outcome": "Provider 인증 성공만으로는 부족하며 내부 계정 정책까지 통과한 경우에만 우리 서비스 JWT가 생깁니다."
      },
      {
        "id": "unverified-email",
        "label": "검증되지 않은 email",
        "flowId": "oauth-login",
        "tone": "blocked",
        "prompt": "Provider profile에 email은 있지만 email_verified=false입니다.",
        "observationTitle": "검증되지 않은 email이 멈추는 지점",
        "reflection": {
          "prompt": "같은 email에서 verified 값만 달라질 때 두 경로가 어디서 갈리는지 적어 보세요.",
          "hint": "provider가 소유를 검증하지 않은 email은 내부 계정 식별 근거가 될 수 없습니다."
        },
        "theoryRef": "../../../theory.md#seq-05",
        "prediction": {
          "prompt": "Provider profile의 email_verified가 false라면 내부 식별에 사용할 수 있을까요?",
          "options": [
            {
              "id": "use-email",
              "label": "email 문자열이 있으므로 계정을 만든다"
            },
            {
              "id": "stop-trust",
              "label": "내부 계정 연결과 token 발급 전에 멈춘다"
            }
          ],
          "answer": "stop-trust",
          "explanation": "email 문자열과 Provider가 확인한 소유 상태는 서로 다른 증거입니다."
        },
        "diagram": {
          "caption": "profile loader가 email_verified=false를 확인하면 내부 계정 조회와 JWT 발급 전에 경로를 중단합니다.",
          "lanes": [
            {
              "id": "verified-email-gate",
              "label": "Verified email gate",
              "description": "email 문자열을 내부 식별에 넘길 수 있는 신뢰 상태인지 판정합니다.",
              "steps": [
                {
                  "from": "browser",
                  "to": "springSecurity",
                  "verb": "로그인 시작",
                  "payload": "OAuth2 authorization request",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "OAuth2 authorization request",
                    "before": "Browser: OAuth2 authorization request 전송 준비",
                    "after": "Spring Security: OAuth2 authorization request 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "springSecurity",
                  "to": "browser",
                  "verb": "authorization URL 반환",
                  "payload": "302 authorization URL",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "302 authorization URL",
                    "before": "Browser: HTTP status와 body 미확정",
                    "after": "Browser: 302 authorization URL"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "browser",
                  "to": "googleOAuth",
                  "verb": "외부 인증 요청",
                  "payload": "authorization request",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "authorization request",
                    "before": "Browser: authorization request 전송 준비",
                    "after": "Google OAuth: authorization request 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "googleOAuth",
                  "to": "browser",
                  "verb": "callback URL 반환",
                  "payload": "302 callback + code + state",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "302 callback + code + state",
                    "before": "Browser: HTTP status와 body 미확정",
                    "after": "Browser: 302 callback + code + state"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "browser",
                  "to": "springSecurity",
                  "verb": "인증 결과 callback",
                  "payload": "authorization code + state",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "authorization code + state",
                    "before": "Browser: authorization code + state 전송 준비",
                    "after": "Spring Security: authorization code + state 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "springSecurity",
                  "to": "oauthProfileLoader",
                  "verb": "profile 검증 위임",
                  "payload": "email + email_verified=false",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "email + email_verified=false",
                    "before": "Spring Security callback: email은 있으나 email_verified=false",
                    "after": "CustomOAuthUserService 목표: 검증되지 않은 email profile을 거절 대상으로 평가"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "oauthProfileLoader",
                  "to": "springSecurity",
                  "verb": "검증되지 않은 email 거부",
                  "payload": "OAuth2AuthenticationException: unverified_email",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "OAuth2AuthenticationException: unverified_email",
                    "before": "OAuth profile: email은 있으나 소유 검증되지 않음",
                    "after": "unverified_email 예외; 내부 계정 조회·생성·JWT 발급 차단"
                  },
                  "evidenceScope": "concept",
                  "concept": "Verified email",
                  "check": "내부 사용자 식별 전에 중단되는지 확인합니다."
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "OAuthLoginSuccessHandler",
              "reason": "검증된 Authentication이 만들어지지 않았습니다."
            },
            {
              "label": "OAuthAccountService · UserRepository",
              "reason": "검증되지 않은 email을 내부 계정 식별에 사용하지 않습니다."
            },
            {
              "label": "JwtTokenProvider",
              "reason": "내부 로그인이 완성되지 않아 JWT를 발급하지 않습니다."
            }
          ]
        },
        "route": [
          "Browser",
          "Spring Security",
          "Google OAuth",
          "OAuth profile loader",
          "OAuthAccountService",
          "JwtTokenProvider"
        ],
        "snapshot": [
          { "label": "email_verified", "value": "false", "tone": "blocked" },
          { "label": "계정 연결", "value": "실행하지 않음" },
          { "label": "JWT", "value": "발급하지 않음" }
        ],
        "evidence": "starter의 `CustomOAuthUserService.loadUser`는 TODO이므로 `email_verified=false` 거절은 현재 실행 결과가 아닌 구현 목표로 확인합니다.",
        "outcome": "email_verified가 false이면 email 문자열은 내부 계정 생성·연결의 근거가 될 수 없습니다.",
        "stopAfter": 3
      },
      {
        "id": "local-email-collision",
        "label": "LOCAL 계정 email 충돌",
        "flowId": "oauth-login",
        "tone": "blocked",
        "prompt": "verified profile의 email이 기존 LOCAL User와 같고 providerId는 일치하지 않습니다.",
        "observationTitle": "LOCAL email 충돌을 멈추는 지점",
        "reflection": {
          "prompt": "두 계정을 연결하려면 email 일치 외에 어떤 확인이 필요한지 적어 보세요.",
          "hint": "외부 provider 인증과 기존 LOCAL 자격 증명은 서로 다른 소유 증거입니다."
        },
        "theoryRef": "../../../theory.md#seq-05",
        "prediction": {
          "prompt": "같은 email의 LOCAL 계정이 이미 있다면 자동 연결해야 할까요?",
          "options": [
            {
              "id": "auto-link",
              "label": "email이 같으므로 자동 연결한다"
            },
            {
              "id": "manual-proof",
              "label": "명시적인 소유 확인 전까지 연결을 멈춘다"
            }
          ],
          "answer": "manual-proof",
          "explanation": "verified email은 외부 계정 소유를 말할 뿐 기존 LOCAL 자격 증명 소유까지 증명하지 않습니다."
        },
        "diagram": {
          "caption": "providerId 조회 결과가 없고 email 조회에서 LOCAL User를 찾으면 link_required 예외로 끝내고 JWT를 만들지 않습니다.",
          "lanes": [
            {
              "id": "verified-provider-profile",
              "label": "검증된 외부 profile",
              "description": "외부 인증과 email 검증을 통과한 profile을 내부 판단으로 넘깁니다.",
              "steps": [
                {
                  "from": "browser",
                  "to": "springSecurity",
                  "verb": "로그인 시작",
                  "payload": "OAuth2 authorization request",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "OAuth2 authorization request",
                    "before": "Browser: OAuth2 authorization request 전송 준비",
                    "after": "Spring Security: OAuth2 authorization request 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "springSecurity",
                  "to": "browser",
                  "verb": "authorization URL 반환",
                  "payload": "302 authorization URL",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "302 authorization URL",
                    "before": "Browser: HTTP status와 body 미확정",
                    "after": "Browser: 302 authorization URL"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "browser",
                  "to": "googleOAuth",
                  "verb": "외부 인증 요청",
                  "payload": "authorization request",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "authorization request",
                    "before": "Browser: authorization request 전송 준비",
                    "after": "Google OAuth: authorization request 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "googleOAuth",
                  "to": "browser",
                  "verb": "callback URL 반환",
                  "payload": "302 callback + code + state",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "302 callback + code + state",
                    "before": "Browser: HTTP status와 body 미확정",
                    "after": "Browser: 302 callback + code + state"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "browser",
                  "to": "springSecurity",
                  "verb": "인증 결과 callback",
                  "payload": "authorization code + state",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "authorization code + state",
                    "before": "Browser: authorization code + state 전송 준비",
                    "after": "Spring Security: authorization code + state 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "springSecurity",
                  "to": "oauthProfileLoader",
                  "verb": "검증된 profile 로딩",
                  "payload": "providerId + email + email_verified=true",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "providerId + email + email_verified=true",
                    "before": "Spring Security: providerId + email + email_verified=true에 필요한 OAuth 값 구성",
                    "after": "CustomOAuthUserService: providerId + email + email_verified=true 목표 단계 진입"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "oauthProfileLoader",
                  "to": "oauthSuccessHandler",
                  "verb": "검증된 인증 전달",
                  "payload": "Authentication",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "Authentication",
                    "before": "OAuth callback: provider attributes만 존재",
                    "after": "Spring Security: verified attributes를 가진 Authentication 구성"
                  },
                  "evidenceScope": "concept"
                }
              ]
            },
            {
              "id": "local-account-collision",
              "label": "LOCAL 계정 충돌",
              "description": "providerId가 다르고 email이 같은 LOCAL 계정을 자동 연결하지 않습니다.",
              "steps": [
                {
                  "from": "oauthSuccessHandler",
                  "to": "oauthAccountService",
                  "verb": "내부 로그인 요청",
                  "payload": "OAuthUserProfile",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "OAuthUserProfile",
                    "before": "OAuthLoginSuccessHandler: OAuthUserProfile에 필요한 OAuth 값 구성",
                    "after": "OAuthAccountService: OAuthUserProfile 목표 단계 진입"
                  },
                  "evidenceScope": "concept",
                  "codePointIds": [
                    "oauth-link"
                  ]
                },
                {
                  "from": "oauthAccountService",
                  "to": "userRepository",
                  "verb": "provider와 email 조회",
                  "payload": "provider + providerId, then email",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "provider + providerId, then email",
                    "before": "OAuthAccountService: provider + providerId, then email에 필요한 OAuth 값 구성",
                    "after": "UserRepository: provider + providerId, then email 목표 단계 진입"
                  },
                  "evidenceScope": "code",
                  "concept": "Account ownership"
                },
                {
                  "from": "userRepository",
                  "to": "oauthAccountService",
                  "verb": "충돌 상태 반환",
                  "payload": "OAuth user 없음 + 동일 email LOCAL user 존재",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "OAuth user 없음 + 동일 email LOCAL user 존재",
                    "before": "OAuthAccountService helper: providerId와 email 조회가 끝나지 않음",
                    "after": "OAuthAccountService helper: OAuth User 0건·동일 email LOCAL User 1건"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "oauthAccountService",
                  "to": "oauthSuccessHandler",
                  "verb": "자동 연결 중단",
                  "payload": "OAuthAccountLinkRequiredException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "OAuthAccountLinkRequiredException",
                    "before": "동일 email LOCAL 계정: 자동 병합 후보",
                    "after": "link-required 예외; 소유 검증이 끝날 때까지 계정 병합 차단"
                  },
                  "evidenceScope": "code",
                  "check": "link_required는 연결 완료가 아니라 안전한 중단 결과입니다."
                },
                {
                  "from": "oauthSuccessHandler",
                  "to": "browser",
                  "verb": "연결 필요 redirect",
                  "payload": "?oauth=link_required",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "?oauth=link_required",
                    "before": "Browser: 자동 계정 연결이 중단됐지만 안내 query 없음",
                    "after": "Browser 목표: oauth=link_required query가 있는 redirect"
                  },
                  "evidenceScope": "concept"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "JwtTokenProvider",
              "reason": "계정 소유 확인이 끝나지 않아 내부 JWT를 발급하지 않습니다."
            }
          ]
        },
        "route": [
          "Browser",
          "Spring Security",
          "Google OAuth",
          "OAuth profile loader",
          "OAuthAccountService",
          "JwtTokenProvider"
        ],
        "snapshot": [
          { "label": "OAuth email", "value": "기존 LOCAL email과 동일" },
          { "label": "연결 결과", "value": "link_required", "tone": "blocked" },
          { "label": "JWT", "value": "발급하지 않음" }
        ],
        "evidence": "`linkOrCreateUser` 구현에서 providerId 조회 뒤 같은 email User가 있으면 `OAuthAccountLinkRequiredException`을 던지는지 확인합니다.",
        "outcome": "verified email이 같아도 LOCAL 계정 소유는 별도 확인 전까지 연결할 수 없습니다.",
        "stopAfter": 4
      },
      {
        "id": "recovery-mail",
        "label": "복구 메일 위임",
        "flowId": "smtp-recovery",
        "tone": "warning",
        "prompt": "복구 email 요청이 들어오며 starter에는 Controller와 reset link helper만 구현되어 있습니다.",
        "observationTitle": "복구 요청에서 현재 증명할 수 있는 범위",
        "reflection": {
          "prompt": "이 흐름이 증명한 것과 아직 남은 보안 단계를 두 목록으로 적어 보세요.",
          "hint": "adapter의 정상 반환은 호출 수락 근거이며 실제 수신함 배달이나 token 검증 근거는 아닙니다."
        },
        "theoryRef": "../../../theory.md#seq-05",
        "prediction": {
          "prompt": "현재 복구 흐름에서 메일 발송 위임이 성공하면 무엇까지 완료된 것일까요?",
          "options": [
            {
              "id": "password-reset",
              "label": "사용자 비밀번호 재설정까지 완료됐다"
            },
            {
              "id": "mail-delegated",
              "label": "복구 요청을 받아 메일 발송을 위임한 단계까지다"
            }
          ],
          "answer": "mail-delegated",
          "explanation": "현재 범위는 reset link 생성과 sender 위임이며 실제 재설정 완료를 보장하지 않습니다."
        },
        "diagram": {
          "caption": "Controller → 사용자 조회 뒤 존재하면 reset link와 sender로, 없으면 발송 없이 나뉘고 두 경로 모두 202를 반환하는 완성 목표입니다.",
          "lanes": [
            {
              "id": "recovery-lookup",
              "label": "복구 요청과 사용자 조회",
              "description": "요청 email을 내부 조회 조건으로만 사용하고 외부에 존재 여부를 숨깁니다.",
              "steps": [
                {
                  "from": "recoveryClient",
                  "to": "accountRecoveryController",
                  "verb": "복구 메일 요청",
                  "payload": "POST /account-recovery/password-reset + email",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "POST /account-recovery/password-reset + email",
                    "before": "Recovery Client: POST /account-recovery/password-reset + email 전송 준비",
                    "after": "AccountRecoveryController: POST /account-recovery/password-reset + email 수신"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "accountRecoveryController",
                  "to": "accountRecoveryService",
                  "verb": "복구 흐름 위임",
                  "payload": "requestPasswordReset(email)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "requestPasswordReset(email)",
                    "before": "AccountRecoveryController: 요청 email을 추출했지만 복구 처리는 시작 전",
                    "after": "AccountRecoveryService TODO 목표: email 조회와 reset link 흐름 시작"
                  },
                  "evidenceScope": "concept",
                  "codePointIds": [
                    "smtp-reset"
                  ]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "userRepository",
                  "verb": "사용자 조회",
                  "payload": "findByEmail(email)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "findByEmail(email)",
                    "before": "AccountRecoveryService: findByEmail(email)에 사용할 id 또는 email 보유",
                    "after": "UserRepository: findByEmail(email) 조회 실행"
                  },
                  "evidenceScope": "concept",
                  "concept": "Account enumeration resistance"
                }
              ]
            },
            {
              "id": "existing-user-target",
              "label": "User 존재 · reset link 목표",
              "description": "존재하는 User의 reset link를 만들고 sender에 넘기는 구현 목표입니다.",
              "steps": [
                {
                  "from": "userRepository",
                  "to": "accountRecoveryService",
                  "verb": "사용자 반환",
                  "payload": "User",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "User",
                    "before": "AccountRecoveryService: email 조회 결과 미확정",
                    "after": "AccountRecoveryService: 해당 email의 User 존재"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "accountRecoveryService",
                  "to": "accountRecoveryService",
                  "verb": "reset link 생성",
                  "payload": "createResetLink(user.email)",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "createResetLink(user.email)",
                    "before": "사용자 email은 있지만 reset URL과 UUID token은 없음",
                    "after": "recovery·email·token query를 가진 reset URL 생성"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["smtp-reset"]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "recoveryMailSender",
                  "verb": "복구 메일 발송 요청",
                  "payload": "recipient + reset link(UUID token)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "recipient + reset link(UUID token)",
                    "before": "AccountRecoveryService 목표: recipient와 UUID reset URL 준비",
                    "after": "RecoveryMailSender TODO 목표: recipient와 reset URL을 발송 입력으로 사용"
                  },
                  "evidenceScope": "concept",
                  "concept": "Port abstraction",
                  "codePointIds": [
                    "smtp-reset"
                  ]
                }
              ]
            },
            {
              "id": "mail-adapter-result",
              "label": "SMTP adapter 목표와 중립 응답",
              "description": "SMTP adapter 호출 수락과 실제 수신함 delivery를 구분합니다.",
              "steps": [
                {
                  "from": "recoveryMailSender",
                  "to": "smtpAdapter",
                  "verb": "SMTP 요청으로 변환",
                  "payload": "recipient + subject + body + reset link",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "recipient + subject + body + reset link",
                    "before": "복구 대상 email과 reset link만 존재",
                    "after": "SMTP adapter 입력: recipient·subject·body·reset link"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "smtpAdapter",
                  "to": "recoveryMailSender",
                  "verb": "발송 호출 정상 반환",
                  "payload": "호출 완료 · 실제 delivery 미확인",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "호출 완료 · 실제 delivery 미확인",
                    "before": "RecoveryMailSender: SMTP adapter 호출 결과 없음",
                    "after": "RecoveryMailSender: 호출은 정상 종료했으나 실제 delivery 증거 없음"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "recoveryMailSender",
                  "to": "accountRecoveryService",
                  "verb": "위임 완료",
                  "payload": "normal return",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "normal return",
                    "before": "AccountRecoveryService: sender 위임 완료 전",
                    "after": "AccountRecoveryService: sender 호출이 예외 없이 종료"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "accountRecoveryService",
                  "to": "accountRecoveryController",
                  "verb": "정상 처리 종료",
                  "payload": "mail delegation complete",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "mail delegation complete",
                    "before": "AccountRecoveryController: 복구 Service 종료 전",
                    "after": "AccountRecoveryController: mail sender 위임 목표 완료"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "accountRecoveryController",
                  "to": "recoveryClient",
                  "verb": "중립 응답",
                  "payload": "202 Accepted + empty body",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "202 Accepted + empty body",
                    "before": "Recovery Client: HTTP status와 body 미확정",
                    "after": "Recovery Client: 202 Accepted + empty body"
                  },
                  "evidenceScope": "concept",
                  "check": "발송 호출 정상 반환과 실제 SMTP delivery 증거를 구분합니다."
                }
              ]
            },
            {
              "id": "missing-user-neutral-response",
              "label": "User 없음 · 발송 없이 같은 202",
              "description": "User가 없으면 발송을 건너뛰되 외부에는 같은 202를 돌려줍니다.",
              "steps": [
                {
                  "from": "userRepository",
                  "to": "accountRecoveryService",
                  "verb": "사용자 없음 반환",
                  "payload": "Optional.empty",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "Optional.empty",
                    "before": "AccountRecoveryService: 대상 존재 여부 미확정",
                    "after": "AccountRecoveryService: Optional.empty로 대상 없음 확정"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "accountRecoveryService",
                  "to": "accountRecoveryController",
                  "verb": "조용히 종료",
                  "payload": "sender 호출 없음",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "sender 호출 없음",
                    "before": "AccountRecoveryController: 계정 존재 여부를 응답에 반영할 수 있는 상태",
                    "after": "AccountRecoveryController: sender 없이도 동일한 202 계약 유지"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "accountRecoveryController",
                  "to": "recoveryClient",
                  "verb": "동일한 중립 응답",
                  "payload": "202 Accepted + empty body",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "202 Accepted + empty body",
                    "before": "Recovery Client: HTTP status와 body 미확정",
                    "after": "Recovery Client: 202 Accepted + empty body"
                  },
                  "evidenceScope": "concept",
                  "check": "계정 존재 여부에 따라 status나 body를 다르게 만들지 않습니다."
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "Password reset completion",
              "reason": "token 저장, 만료, 재사용 차단, password 변경은 현재 범위 밖입니다."
            },
            {
              "label": "External SMTP delivery evidence",
              "reason": "발송 포트 위임만으로 실제 메일 수신까지 자동 검증되지는 않습니다."
            }
          ]
        },
        "route": [
          "Client",
          "AccountRecoveryController",
          "AccountRecoveryService",
          "RecoveryMailSender",
          "SMTP adapter"
        ],
        "snapshot": [
          { "label": "API 응답", "value": "계정 존재 여부 비공개" },
          { "label": "발송 책임", "value": "RecoveryMailSender 위임" },
          { "label": "후속 범위", "value": "토큰 저장 · 만료 · 재사용 차단", "tone": "warning" }
        ],
        "evidence": "`createResetLink`와 Controller의 202만 현재 코드 근거입니다. `requestPasswordReset`과 SMTP 위임은 TODO입니다.",
        "outcome": "202는 계정 존재를 숨기고 sender 반환은 위임만 뜻하며 delivery나 password 재설정을 보장하지 않습니다."
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
      "id": "browser",
      "label": "Browser",
      "kind": "client"
    },
    {
      "id": "google",
      "label": "Google OAuth",
      "kind": "external-auth"
    },
    {
      "id": "handler",
      "label": "OAuth Handler",
      "kind": "server"
    },
    {
      "id": "account",
      "label": "OAuthAccountService",
      "kind": "logic"
    },
    {
      "id": "smtp",
      "label": "SMTP Mail",
      "kind": "mail"
    }
  ],
  "flows": [
    {
      "id": "oauth-login",
      "title": "Google OAuth2 로그인 흐름",
      "summary": "검증된 외부 인증 결과로 사용자를 식별하고, 동일 email 충돌은 자동 연결하지 않으며, 성공한 경우에만 자체 JWT를 발급합니다.",
      "mermaid": "sequenceDiagram\n  actor Browser\n  participant Provider as Google OAuth2\n  participant Security as Spring Security\n  participant Profile as OAuth profile loader\n  participant Account as OAuthAccountService\n  participant Repo as UserRepository\n  participant Jwt as JwtTokenProvider\n  Browser->>Security: OAuth2 authorization request\n  Security->>Provider: external authentication\n  Provider-->>Security: authorization result\n  Security->>Profile: load user info\n  Profile-->>Account: provider, providerId, email, emailVerified\n  Account->>Repo: find by provider and providerId\n  alt same email local account exists\n    Account-->>Browser: oauth=link_required\n  else existing OAuth or new user\n    Account->>Jwt: issue service token\n    Jwt-->>Browser: access_token in URL fragment\n  end",
      "steps": [
        {
          "order": 1,
          "actor": "Browser",
          "input": "OAuth2 시작 요청",
          "owner": "Spring Security",
          "action": "외부 제공자 인증 흐름으로 이동합니다.",
          "output": "Provider authorization",
          "note": "외부 제공자는 사용자 인증을 맡습니다.",
          "id": "oauth-login-step-1",
          "from": "Browser",
          "to": "Spring Security",
          "message": "외부 제공자 인증 흐름으로 이동합니다.",
          "messageKind": "request",
          "problem": "OAuth2 시작 요청",
          "concept": "Spring Security",
          "check": "Provider authorization",
          "codePointIds": [
            "oauth-link",
            "smtp-reset"
          ]
        },
        {
          "order": 2,
          "actor": "Provider",
          "input": "Authorization result",
          "owner": "OAuth profile loader",
          "action": "provider, providerId, email, emailVerified를 우리 서비스가 읽을 형태로 정리합니다.",
          "output": "OAuthUserProfile",
          "note": "검증되지 않은 email은 내부 사용자 식별에 사용하지 않습니다.",
          "id": "oauth-login-step-2",
          "from": "Provider",
          "to": "OAuth profile loader",
          "message": "provider, providerId, email, emailVerified를 우리 서비스가 읽을 형태로 정리합니다.",
          "messageKind": "request",
          "problem": "Authorization result",
          "concept": "OAuth profile loader",
          "check": "OAuthUserProfile",
          "codePointIds": [
            "smtp-reset",
            "oauth-link"
          ]
        },
        {
          "order": 3,
          "actor": "OAuth profile loader",
          "input": "OAuthUserProfile",
          "owner": "OAuthAccountService",
          "action": "providerId로 사용자를 식별하고 동일 email 계정 충돌은 자동 연결하지 않습니다.",
          "output": "User or link_required",
          "note": "같은 email만으로 기존 로컬 계정을 연결하면 안 됩니다.",
          "id": "oauth-login-step-3",
          "from": "OAuth profile loader",
          "to": "OAuthAccountService",
          "message": "providerId로 식별하고 동일 email 계정 충돌을 확인합니다.",
          "messageKind": "request",
          "problem": "OAuthUserProfile",
          "concept": "OAuthAccountService",
          "check": "User or link_required",
          "codePointIds": [
            "oauth-link",
            "smtp-reset"
          ]
        },
        {
          "order": 4,
          "actor": "OAuthAccountService",
          "input": "Identified user",
          "owner": "JwtTokenProvider",
          "action": "우리 서비스 API 호출에 사용할 자체 token을 발급합니다.",
          "output": "OAuth login result",
          "note": "link_required 분기에는 token을 발급하지 않고, 성공 token은 URL fragment로 전달합니다.",
          "id": "oauth-login-step-4",
          "from": "OAuthAccountService",
          "to": "JwtTokenProvider",
          "message": "우리 서비스 API 호출에 사용할 자체 token을 발급합니다.",
          "messageKind": "response",
          "problem": "Identified user",
          "concept": "JwtTokenProvider",
          "check": "OAuth login result",
          "codePointIds": [
            "smtp-reset",
            "oauth-link"
          ]
        }
      ],
      "bandKind": "scenario"
    },
    {
      "id": "smtp-recovery",
      "title": "비밀번호 재설정 메일 요청 흐름",
      "summary": "계정 복구 요청은 사용자 조회, reset link 생성, 메일 발송 책임을 분리해서 봅니다.",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "Password reset email request",
          "owner": "AccountRecoveryController",
          "action": "email 요청을 Service로 전달합니다.",
          "output": "email",
          "note": "응답 문구가 계정 존재 여부를 과하게 드러내지 않게 봅니다.",
          "id": "smtp-recovery-step-1",
          "from": "Client",
          "to": "AccountRecoveryController",
          "message": "email 요청을 Service로 전달합니다.",
          "messageKind": "request",
          "problem": "Password reset email request",
          "concept": "AccountRecoveryController",
          "check": "email",
          "codePointIds": [
            "oauth-link",
            "smtp-reset"
          ]
        },
        {
          "order": 2,
          "actor": "AccountRecoveryController",
          "input": "email",
          "owner": "AccountRecoveryService",
          "action": "사용자를 조회하고 reset link 생성 여부를 판단합니다.",
          "output": "reset link or neutral result",
          "note": "계정 복구는 단순 메일 발송이 아니라 보안 흐름입니다.",
          "id": "smtp-recovery-step-2",
          "from": "AccountRecoveryController",
          "to": "AccountRecoveryService",
          "message": "사용자를 조회하고 reset link 생성 여부를 판단합니다.",
          "messageKind": "request",
          "problem": "email",
          "concept": "AccountRecoveryService",
          "check": "reset link or neutral result",
          "codePointIds": [
            "smtp-reset",
            "oauth-link"
          ]
        },
        {
          "order": 3,
          "actor": "AccountRecoveryService",
          "input": "reset link",
          "owner": "RecoveryMailSender",
          "action": "메일 발송 책임을 sender 인터페이스에 위임합니다.",
          "output": "mail command",
          "note": "Service가 SMTP 구현 세부사항에 묶이지 않게 합니다.",
          "id": "smtp-recovery-step-3",
          "from": "AccountRecoveryService",
          "to": "RecoveryMailSender",
          "message": "메일 발송 책임을 sender 인터페이스에 위임합니다.",
          "messageKind": "request",
          "problem": "reset link",
          "concept": "RecoveryMailSender",
          "check": "mail command",
          "codePointIds": [
            "oauth-link",
            "smtp-reset"
          ]
        },
        {
          "order": 4,
          "actor": "RecoveryMailSender",
          "input": "mail command",
          "owner": "SMTP adapter",
          "action": "SMTP 설정을 사용해 메일을 발송합니다.",
          "output": "request accepted",
          "note": "secret과 token은 코드, 문서, 로그에 남기지 않습니다.",
          "id": "smtp-recovery-step-4",
          "from": "RecoveryMailSender",
          "to": "SMTP adapter",
          "message": "SMTP 설정을 사용해 메일을 발송합니다.",
          "messageKind": "response",
          "problem": "mail command",
          "concept": "SMTP adapter",
          "check": "request accepted",
          "codePointIds": [
            "smtp-reset",
            "oauth-link"
          ]
        }
      ],
      "bandKind": "scenario"
    }
  ],
  "flow": [
    {
      "id": "oauth-login-step-1",
      "label": "Spring Security",
      "problem": "OAuth2 시작 요청",
      "concept": "Spring Security",
      "action": "외부 제공자 인증 흐름으로 이동합니다.",
      "check": "Provider authorization",
      "codePointIds": [
        "oauth-link",
        "smtp-reset"
      ]
    },
    {
      "id": "oauth-login-step-2",
      "label": "OAuth profile loader",
      "problem": "Authorization result",
      "concept": "OAuth profile loader",
      "action": "provider, providerId, email, emailVerified를 우리 서비스가 읽을 형태로 정리합니다.",
      "check": "OAuthUserProfile",
      "codePointIds": [
        "smtp-reset",
        "oauth-link"
      ]
    },
    {
      "id": "oauth-login-step-3",
      "label": "OAuthAccountService",
      "problem": "OAuthUserProfile",
      "concept": "OAuthAccountService",
      "action": "providerId로 사용자를 식별하고 동일 email 계정 충돌은 자동 연결하지 않습니다.",
      "check": "User or link_required",
      "codePointIds": [
        "oauth-link",
        "smtp-reset"
      ]
    },
    {
      "id": "oauth-login-step-4",
      "label": "JwtTokenProvider",
      "problem": "Identified user",
      "concept": "JwtTokenProvider",
      "action": "우리 서비스 API 호출에 사용할 자체 token을 발급합니다.",
      "check": "OAuth login result",
      "codePointIds": [
        "smtp-reset",
        "oauth-link"
      ]
    }
  ],
  "codePoints": [
    {
      "id": "oauth-link",
      "title": "starter에 구현된 linkOrCreateUser 충돌 분기",
      "file": "src/main/kotlin/com/andi/rest_crud/service/OAuthAccountService.kt",
      "language": "kotlin",
      "snippet": "// 같은 email의 기존 계정은 소유 확인 없이 OAuth 계정과 합치지 않습니다.\nval existingEmailUser = userRepository.findByEmail(profile.email)\n    .orElse(null)\nif (existingEmailUser != null) {\n    throw OAuthAccountLinkRequiredException()\n}",
      "explanation": "`linkOrCreateUser` helper는 starter에도 구현되어 있으며 같은 email의 내부 계정을 자동 병합하지 않습니다.",
      "check": "public `handleOAuthLogin`은 아직 TODO이고 이 helper 분기만 코드 근거임을 구분합니다."
    },
    {
      "id": "smtp-reset",
      "title": "starter에 구현된 reset link helper",
      "file": "src/main/kotlin/com/andi/rest_crud/service/AccountRecoveryService.kt",
      "language": "kotlin",
      "snippet": "// starter helper는 UUID token과 email을 reset URL query로 조립합니다.\nfun createResetLink(email: String): String {\n    val resetToken = UUID.randomUUID().toString()\n    return UriComponentsBuilder.fromUriString(passwordResetUrl)\n        .queryParam(\"recovery\", \"password-reset\")\n        .queryParam(\"email\", email)\n        .queryParam(\"token\", resetToken)\n        .build().toUriString()\n}",
      "explanation": "`createResetLink`는 starter에 구현됐지만 `requestPasswordReset`과 SMTP sender 호출은 TODO입니다.",
      "check": "URL 조립 코드 근거와 아직 실행되지 않는 mail 전송 목표를 분리합니다."
    }
  ],
  "concepts": [
    {
      "title": "OAuth2는 외부 인증입니다",
      "body": "외부 제공자가 사용자 인증을 처리하고 우리 서비스는 그 결과를 받아옵니다."
    },
    {
      "title": "자체 JWT는 우리 API 인증입니다",
      "body": "OAuth2 성공 이후에도 우리 API 요청을 구분할 token이 필요합니다."
    },
    {
      "title": "providerId로 식별하고 verified email로 충돌을 봅니다",
      "body": "같은 email의 로컬 계정은 소유 확인 없이 자동 연결하지 않습니다."
    },
    {
      "title": "메일 발송은 포트로 분리합니다",
      "body": "계정 복구 Service가 SMTP 구현에 직접 묶이지 않게 합니다."
    }
  ],
  "practice": [
    "Google 로그인 성공과 우리 서비스 로그인 성공의 차이를 설명할 수 있나요?",
    "providerId 식별과 verified email 충돌 확인을 구분할 수 있나요?",
    "OAuth2 이후 자체 JWT가 필요한 이유를 설명할 수 있나요?",
    "계정 복구 요청에서 email 존재 여부와 reset link를 왜 조심해야 하나요?"
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
  "topic": "External authentication and account recovery",
  "question": "외부 인증 성공과 우리 서비스 로그인 성공은 왜 같은 사건이 아닐까?",
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
    "problem": "Google 인증이 성공해도 우리 서비스는 verified email과 providerId로 사용자를 식별하고 기존 계정 충돌을 안전하게 처리해야 합니다.",
    "limits": [
      "외부 로그인 성공 후 내부 사용자를 찾지 못하면 우리 서비스의 로그인 상태가 완성되지 않습니다.",
      "email만 보고 외부 사용자를 식별하면 provider 안의 고유 식별자를 놓칠 수 있습니다.",
      "같은 email만으로 로컬 계정을 자동 연결하면 계정 탈취 위험이 생깁니다.",
      "비밀번호 재설정 요청은 계정 존재 여부와 reset token을 민감하게 다뤄야 합니다."
    ],
    "choice": "OAuth2는 외부 인증 결과 수신으로, SMTP는 계정 복구 메시지 발송으로 나누고 내부 Service가 정책을 조립합니다."
  },
  "overview": [
    "OAuth Redirect",
    "Provider Profile",
    "OAuthAccountService",
    "UserRepository",
    "JwtTokenProvider",
    "RecoveryMailSender",
    "SMTP"
  ],
  "responsibilities": [
    {
      "name": "OAuth profile loader",
      "role": "외부 사용자 정보를 provider, providerId, email, emailVerified로 정리합니다.",
      "caution": "검증되지 않은 email을 내부 사용자 식별에 사용하지 않습니다."
    },
    {
      "name": "OAuthAccountService",
      "role": "외부 사용자를 식별하고 계정 충돌을 거부한 뒤 자체 token 발급 흐름을 조립합니다.",
      "caution": "같은 email의 로컬 계정을 자동 연결하지 않습니다."
    },
    {
      "name": "AccountRecoveryService",
      "role": "사용자 조회, reset link 생성, 발송 요청을 조합합니다.",
      "caution": "계정 존재 여부와 token을 민감하게 다룹니다."
    },
    {
      "name": "RecoveryMailSender",
      "role": "메일 발송 책임을 추상화합니다.",
      "caution": "테스트와 운영 구현을 바꿔도 Service 흐름은 유지되어야 합니다."
    }
  ],
  "glossary": [
    {
      "term": "OAuth2",
      "meaning": "외부 제공자가 사용자 인증을 처리하고 우리 서비스가 결과를 받는 흐름입니다.",
      "caution": "우리 서비스 API 인증을 위한 JWT와 같은 역할이 아닙니다."
    },
    {
      "term": "providerId",
      "meaning": "외부 제공자 안에서 사용자를 구분하는 값입니다.",
      "caution": "email만으로 외부 사용자를 식별하면 정책이 흔들릴 수 있습니다."
    },
    {
      "term": "SMTP",
      "meaning": "메일을 보내기 위한 전송 프로토콜입니다.",
      "caution": "메일 발송 성공만이 계정 복구 보안의 전부는 아닙니다."
    },
    {
      "term": "reset link",
      "meaning": "비밀번호 재설정 화면으로 이동시키는 링크입니다.",
      "caution": "링크 안의 token은 민감하게 다뤄야 합니다."
    },
    {
      "term": "RecoveryMailSender",
      "meaning": "계정 복구 메일 발송 책임을 표현하는 인터페이스입니다.",
      "caution": "Service가 SMTP 구현에 직접 묶이지 않게 합니다."
    }
  ],
  "practical": [
    {
      "title": "외부 인증 성공은 내부 로그인 완성이 아닙니다",
      "body": "사용자 식별과 계정 충돌 판단 뒤 성공한 경우에만 자체 token을 발급해야 합니다."
    },
    {
      "title": "계정 복구는 정보 노출 문제입니다",
      "body": "존재하지 않는 email 요청에 과하게 다른 응답을 주면 가입 여부를 추측하게 만들 수 있습니다."
    },
    {
      "title": "secret은 학습 화면에 남기지 않습니다",
      "body": "Google client secret, SMTP password, JWT secret은 환경변수 자리와 정책만 다룹니다."
    }
  ],
  "checks": [
    "Google 로그인 성공과 우리 서비스 로그인 성공의 차이를 설명할 수 있나요?",
    "providerId 식별과 verified email 충돌 확인을 구분할 수 있나요?",
    "OAuth2 이후 자체 JWT가 필요한 이유를 설명할 수 있나요?",
    "계정 복구 요청에서 email 존재 여부와 reset link를 왜 조심해야 하나요?"
  ],
  "next": {
    "id": "06",
    "title": "Testing",
    "reason": "외부 인증과 메일 흐름까지 붙었다면, 다음에는 정상/실패 케이스를 테스트로 고정해 변경 후에도 흐름을 믿을 수 있게 만듭니다."
  }
};
