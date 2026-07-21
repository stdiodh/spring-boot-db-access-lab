window.visualLabData = {
  "kind": "sequence",
  "sequence": "05",
  "title": "OAuth2 + SMTP",
  "subtitle": "External authentication and secure account recovery",
  "goal": "외부 identity를 내부 계정으로 받아들이는 기준과 hash 기반 reset token의 발급·메일·확정 수명 주기를 구분합니다.",
  "problem": "Provider 인증 성공, 메일 발송 요청, 비밀번호 변경은 서로 다른 증거입니다. 우리 서비스는 verified profile, 저장된 token hash, 잠긴 사용자 상태를 각각 다시 확인해야 합니다.",
  "repo": {
    "name": "spring-boot-db-access-lab",
    "path": "spring-boot-db-access-lab"
  },
  "defaultSequence": "05",
  "workbench": {
    "kind": "trust",
    "title": "외부 identity와 복구 token의 신뢰 경계",
    "instruction": "입력 조건을 선택하고 외부 값이 내부 계정, token row, 비밀번호 변경으로 이어지기 전에 어떤 검증을 거치는지 예측하세요.",
    "visual": {
      "src": "../../assets/diagrams/05-external-trust.svg",
      "alt": "OAuth Provider의 profile이 verified email과 내부 계정 충돌 검사를 거쳐 JWT 발급 또는 차단으로 이어지는 신뢰 경계",
      "caption": "외부 인증 성공과 내부 계정 연결은 같은 판단이 아닙니다."
    },
    "terms": [
      {
        "term": "verified email",
        "meaning": "Provider가 소유 확인을 완료했다고 표시한 email만 내부 계정 판단의 후보로 사용합니다."
      },
      {
        "term": "providerId",
        "meaning": "Provider 안에서 사용자를 고유하게 식별하는 값이며 email과 역할이 다릅니다."
      },
      {
        "term": "raw token / token hash",
        "meaning": "raw token은 사용자에게 한 번 전달하고, DB에는 SHA-256 hash만 저장해 원문 노출 범위를 줄입니다."
      },
      {
        "term": "TTL / cooldown",
        "meaning": "token은 기본 15분만 유효하고, LOCAL 사용자별 재요청은 기본 1분 동안 제한합니다."
      },
      {
        "term": "AFTER_COMMIT",
        "meaning": "token row가 commit된 뒤에만 비동기 메일 작업을 시작하는 transaction event 단계입니다."
      }
    ],
    "comparison": {
      "label": "외부 값과 내부 신뢰 근거",
      "left": {
        "title": "외부에서 받은 값",
        "body": "Provider profile과 raw reset token은 다음 판단의 입력일 뿐 내부 계정이나 비밀번호 변경을 스스로 증명하지 않습니다."
      },
      "right": {
        "title": "내부에서 확인한 상태",
        "body": "provider identity·계정 충돌과 DB hash·만료·usedAt을 확인한 뒤에만 JWT 또는 비밀번호 변경이 확정됩니다."
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
        "kind": "security boundary",
        "role": "OAuth authorization request, state와 callback을 조정합니다.",
        "systemLayer": "interface",
        "boundary": "OAuth client"
      },
      "googleOAuth": {
        "label": "Google OAuth",
        "icon": "external",
        "kind": "identity provider",
        "role": "사용자를 인증하고 sub, email, email_verified를 제공합니다.",
        "systemLayer": "integration",
        "boundary": "외부 Identity Provider"
      },
      "oauthProfileLoader": {
        "label": "Profile Loader",
        "icon": "handler",
        "kind": "profile gate",
        "role": "외부 profile의 필수 값과 verified 상태를 검사해 내부 식별 속성으로 정규화합니다.",
        "systemLayer": "interface",
        "boundary": "Profile trust",
        "codePointIds": ["oauth-profile-scaffold"]
      },
      "oauthSuccessHandler": {
        "label": "OAuth Success Handler",
        "icon": "response",
        "kind": "success handler",
        "role": "검증된 profile을 계정 처리로 넘기고 공개 redirect 결과를 만듭니다.",
        "systemLayer": "interface",
        "boundary": "OAuth redirect",
        "codePointIds": ["oauth-redirect-scaffold"]
      },
      "oauthAccountService": {
        "label": "OAuth Account Service",
        "icon": "service",
        "kind": "account policy",
        "role": "provider identity를 먼저 찾고 동일 email 계정 충돌을 자동 연결하지 않습니다.",
        "systemLayer": "application",
        "boundary": "계정 연결 정책",
        "codePointIds": ["oauth-account-target"]
      },
      "userRepository": {
        "label": "User Repo",
        "icon": "repository",
        "kind": "user storage",
        "role": "provider identity와 email을 조회하고 복구 대상 LOCAL 사용자를 잠급니다.",
        "systemLayer": "resource",
        "boundary": "사용자 영속성"
      },
      "jwtTokenProvider": {
        "label": "JWT Provider",
        "icon": "token",
        "kind": "token issuer",
        "role": "내부 사용자의 안정된 email로 우리 API용 JWT를 발급합니다.",
        "systemLayer": "application",
        "boundary": "내부 인증"
      },
      "recoveryClient": {
        "label": "Recovery Client",
        "icon": "client",
        "kind": "client",
        "role": "복구 메일을 요청하고 raw token으로 비밀번호 변경을 확정합니다.",
        "systemLayer": "outside",
        "boundary": "클라이언트"
      },
      "accountRecoveryController": {
        "label": "Recovery Controller",
        "icon": "api",
        "kind": "recovery API",
        "role": "복구 요청에는 중립 202, 유효한 확정에는 204를 반환합니다.",
        "systemLayer": "interface",
        "boundary": "HTTP API"
      },
      "accountRecoveryService": {
        "label": "Recovery Service",
        "icon": "service",
        "kind": "recovery policy",
        "role": "LOCAL 사용자, cooldown, token 회전과 confirm transaction을 조정합니다.",
        "systemLayer": "application",
        "boundary": "계정 복구 정책",
        "codePointIds": ["recovery-service-target"]
      },
      "passwordResetTokenCodec": {
        "label": "Token Codec",
        "icon": "token",
        "kind": "token codec",
        "role": "32-byte 난수 raw token을 만들고 SHA-256 hash로 변환합니다.",
        "systemLayer": "application",
        "boundary": "Token material",
        "codePointIds": ["reset-token-codec"]
      },
      "passwordResetTokenRepository": {
        "label": "Token Repository",
        "icon": "repository",
        "kind": "token storage",
        "role": "사용자당 token row 하나를 잠그고 hash, 만료와 사용 상태를 보관합니다.",
        "systemLayer": "resource",
        "boundary": "Reset token persistence",
        "codePointIds": ["reset-token-row-scaffold", "reset-token-used-scaffold"]
      },
      "springTransactionEvents": {
        "label": "Tx Events",
        "icon": "event",
        "kind": "transaction event",
        "role": "메일 event를 transaction commit 뒤 listener에 전달합니다.",
        "systemLayer": "application",
        "boundary": "Transaction commit"
      },
      "recoveryMailEventDispatcher": {
        "label": "Mail Dispatcher",
        "icon": "queue",
        "kind": "async dispatcher",
        "role": "AFTER_COMMIT event를 bounded executor의 별도 작업으로 보냅니다.",
        "systemLayer": "integration",
        "boundary": "비동기 작업 경계",
        "codePointIds": ["mail-dispatch-scaffold"]
      },
      "recoveryMailSender": {
        "label": "Mail Port",
        "icon": "mail",
        "kind": "mail port",
        "role": "계정 복구 정책과 SMTP 구현을 분리하는 발송 포트입니다.",
        "systemLayer": "integration",
        "boundary": "메일 포트"
      },
      "smtpAdapter": {
        "label": "SMTP Adapter",
        "icon": "external",
        "kind": "SMTP adapter",
        "role": "발신자, 수신자, 제목과 reset link를 SMTP message로 조립합니다.",
        "systemLayer": "integration",
        "boundary": "외부 메일 서버",
        "codePointIds": ["smtp-adapter-target"]
      },
      "passwordEncoder": {
        "label": "Password Encoder",
        "icon": "security",
        "kind": "password encoder",
        "role": "새 password 원문을 BCrypt hash로 변환합니다.",
        "systemLayer": "application",
        "boundary": "Password hashing"
      },
      "recoveryTransaction": {
        "label": "Recovery Tx",
        "icon": "database",
        "kind": "locked recovery state",
        "role": "사용자와 token을 잠그고 password hash와 usedAt을 같은 transaction에서 commit합니다.",
        "systemLayer": "resource",
        "boundary": "DB transaction",
        "codePointIds": ["reset-token-row-scaffold", "reset-token-used-scaffold"]
      }
    },
    "scenarios": [
      {
        "id": "verified-oauth",
        "label": "verified profile",
        "flowId": "oauth-login",
        "tone": "recovered",
        "prompt": "Provider가 sub, email, email_verified=true를 포함한 profile을 반환합니다.",
        "observationTitle": "외부 profile이 내부 JWT가 되는 조건",
        "theoryRef": "../../../theory.md#seq-05",
        "prediction": {
          "prompt": "Provider 인증 성공 직후 우리 API용 JWT를 발급해도 될까요?",
          "options": [
            {
              "id": "provider-only",
              "label": "외부 인증 성공만 확인하고 발급한다"
            },
            {
              "id": "internal-policy",
              "label": "profile 검증과 내부 계정 정책 뒤 발급한다"
            }
          ],
          "answer": "internal-policy",
          "explanation": "Provider는 외부 신원만 확인하며 내부 사용자 식별과 계정 충돌은 우리 서비스 책임입니다."
        },
        "reflection": {
          "prompt": "Provider profile에서 내부 JWT까지 추가로 확인한 두 가지를 적어 보세요.",
          "hint": "verified 상태와 provider identity·email 충돌을 나누어 봅니다."
        },
        "diagram": {
          "caption": "OAuth callback의 state와 verified profile을 확인하고 내부 계정 정책을 통과한 경우에만 JWT fragment redirect를 만듭니다.",
          "participants": [
            "browser",
            "springSecurity",
            "googleOAuth",
            "oauthProfileLoader",
            "oauthSuccessHandler",
            "oauthAccountService",
            "userRepository",
            "jwtTokenProvider"
          ],
          "lanes": [
            {
              "id": "provider-profile",
              "label": "Provider callback + profile",
              "description": "외부 인증 결과가 verified 내부 profile 후보가 되는 과정을 봅니다.",
              "participants": ["browser", "springSecurity", "googleOAuth", "oauthProfileLoader", "oauthSuccessHandler"],
              "nextLaneIds": ["internal-account"],
              "steps": [
                {
                  "from": "browser",
                  "to": "springSecurity",
                  "verb": "로그인 시작",
                  "payload": "GET /oauth2/authorization/google",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "OAuth 시작 요청",
                    "before": "Browser에 provider 로그인 흐름이 없음",
                    "after": "Spring Security가 authorization request와 state를 준비"
                  },
                  "evidenceScope": "runtime",
                  "codePointIds": ["oauth-profile-scaffold"]
                },
                {
                  "from": "springSecurity",
                  "to": "googleOAuth",
                  "verb": "외부 인증 위임",
                  "payload": "authorization request + state",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "OAuth state",
                    "before": "authorization request가 내부에 임시 저장됨",
                    "after": "Provider가 state와 사용자 동의를 포함한 인증 흐름을 소유"
                  },
                  "evidenceScope": "concept",
                  "codePointIds": ["oauth-profile-scaffold"]
                },
                {
                  "from": "googleOAuth",
                  "to": "springSecurity",
                  "verb": "callback 반환",
                  "payload": "authorization code + matching state",
                  "kind": "response",
                  "effect": {
                    "kind": "gate",
                    "subject": "OAuth callback",
                    "before": "callback이 시작 요청과 같은 흐름인지 미확정",
                    "after": "state가 일치해 provider user-info 조회 가능"
                  },
                  "evidenceScope": "runtime",
                  "codePointIds": ["oauth-profile-scaffold"]
                },
                {
                  "from": "springSecurity",
                  "to": "oauthProfileLoader",
                  "verb": "profile 정규화 위임",
                  "payload": "OAuth2UserRequest + provider attributes",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Provider attributes",
                    "before": "sub·email·email_verified가 외부 key로 존재",
                    "after": "CustomOAuthUserService가 필수 값과 길이를 판정"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["oauth-profile-scaffold"]
                },
                {
                  "from": "oauthProfileLoader",
                  "to": "oauthSuccessHandler",
                  "verb": "검증된 profile 전달",
                  "payload": "provider + providerId + email + emailVerified=true",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "외부 profile",
                    "before": "Provider가 반환한 속성 map",
                    "after": "정규화된 verified OAuthUserProfile"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-profile-scaffold"]
                }
              ]
            },
            {
              "id": "internal-account",
              "label": "내부 계정 + JWT",
              "description": "외부 identity를 내부 사용자와 연결하고 공개 redirect를 만드는 책임입니다.",
              "participants": ["oauthSuccessHandler", "oauthAccountService", "userRepository", "jwtTokenProvider", "browser"],
              "steps": [
                {
                  "from": "oauthSuccessHandler",
                  "to": "oauthAccountService",
                  "verb": "계정 처리 요청",
                  "payload": "OAuthUserProfile",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Verified profile",
                    "before": "외부 identity만 검증됨",
                    "after": "내부 계정 정책의 판단 입력이 됨"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "oauthAccountService",
                  "to": "userRepository",
                  "verb": "identity와 충돌 조회",
                  "payload": "provider + providerId, then email",
                  "kind": "call",
                  "effect": {
                    "kind": "gate",
                    "subject": "내부 사용자 후보",
                    "before": "profile과 연결할 User가 미확정",
                    "after": "기존 OAuth User 또는 충돌 없는 신규 후보로 분기"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "userRepository",
                  "to": "oauthAccountService",
                  "verb": "내부 사용자 반환",
                  "payload": "existing identity | saved OAuth User",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "User 상태",
                    "before": "내부 email과 authProvider 미확정",
                    "after": "안정된 내부 email을 가진 OAuth User 확정"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "oauthAccountService",
                  "to": "jwtTokenProvider",
                  "verb": "내부 JWT 발급",
                  "payload": "stored internal email",
                  "kind": "call",
                  "effect": {
                    "kind": "transform",
                    "subject": "내부 사용자",
                    "before": "OAuth User는 있으나 우리 API token은 없음",
                    "after": "저장된 email을 subject로 JWT 생성"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "jwtTokenProvider",
                  "to": "oauthSuccessHandler",
                  "verb": "로그인 결과 반환",
                  "payload": "OAuthLoginResponse + signed JWT",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "OAuth 로그인 결과",
                    "before": "Handler에 공개 redirect 상태가 없음",
                    "after": "provider·신규 여부·JWT를 가진 내부 결과 확보"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "oauthSuccessHandler",
                  "to": "browser",
                  "verb": "성공 redirect",
                  "payload": "oauth metadata + #access_token + no-store",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "Browser URL",
                    "before": "우리 API token이 없는 callback URL",
                    "after": "fragment token을 메모리로 소비한 뒤 URL을 지울 수 있는 redirect"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["oauth-redirect-scaffold"],
                  "check": "fragment는 데모 전달 방식이며 화면이 즉시 메모리로 옮기고 URL을 지우는지 별도로 확인합니다."
                }
              ]
            }
          ]
        },
        "route": [
          "Browser",
          "Spring Security",
          "Google OAuth",
          "CustomOAuthUserService",
          "OAuthAccountService",
          "UserRepository",
          "JwtTokenProvider",
          "Browser"
        ],
        "snapshot": [
          { "label": "Profile gate", "value": "email_verified=true" },
          { "label": "내부 식별", "value": "provider + providerId" },
          { "label": "결과", "value": "내부 JWT fragment", "tone": "recovered" }
        ],
        "evidence": "제공된 profile·redirect scaffold와 OAuth 단위 테스트는 내부 정책을 확인합니다. 실제 Google consent와 callback 성공은 credential을 넣은 수동 검증 범위입니다.",
        "outcome": "외부 인증 성공에 verified profile과 내부 계정 정책을 더 통과해야 우리 API용 JWT가 생깁니다."
      },
      {
        "id": "unverified-email",
        "label": "email_verified=false",
        "flowId": "oauth-login",
        "tone": "blocked",
        "prompt": "Provider profile에 email은 있지만 email_verified=false입니다.",
        "observationTitle": "검증되지 않은 email이 멈추는 위치",
        "theoryRef": "../../../theory.md#seq-05",
        "prediction": {
          "prompt": "email 문자열이 존재하면 내부 계정 조회로 넘겨도 될까요?",
          "options": [
            {
              "id": "use-email",
              "label": "문자열이 있으므로 내부 식별에 사용한다"
            },
            {
              "id": "reject-profile",
              "label": "소유 검증이 없어 profile gate에서 거부한다"
            }
          ],
          "answer": "reject-profile",
          "explanation": "email 값과 Provider가 소유 확인을 완료했다는 증거는 서로 다릅니다."
        },
        "reflection": {
          "prompt": "왜 email 문자열만으로 내부 계정을 찾지 않는지 한 문장으로 써 보세요.",
          "hint": "값의 존재와 소유 검증을 구분합니다."
        },
        "diagram": {
          "caption": "email_verified=false이면 profile 정규화 단계에서 거부되어 UserRepository와 JWT 발급에 도달하지 않습니다.",
          "lanes": [
            {
              "id": "unverified-profile-gate",
              "label": "Verified email gate",
              "description": "외부 email을 내부 식별 근거로 사용할 수 있는지 판정합니다.",
              "participants": ["browser", "springSecurity", "googleOAuth", "oauthProfileLoader"],
              "steps": [
                {
                  "from": "browser",
                  "to": "springSecurity",
                  "verb": "로그인 시작",
                  "payload": "GET /oauth2/authorization/google",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "OAuth 요청",
                    "before": "외부 인증을 시작하지 않음",
                    "after": "authorization request와 state 생성"
                  },
                  "evidenceScope": "runtime",
                  "codePointIds": ["oauth-profile-scaffold"]
                },
                {
                  "from": "springSecurity",
                  "to": "googleOAuth",
                  "verb": "외부 인증 위임",
                  "payload": "authorization request + state",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Provider 인증",
                    "before": "내부 OAuth client가 요청을 보유",
                    "after": "Google이 사용자 인증과 profile 생성을 수행"
                  },
                  "evidenceScope": "concept",
                  "codePointIds": ["oauth-profile-scaffold"]
                },
                {
                  "from": "googleOAuth",
                  "to": "oauthProfileLoader",
                  "verb": "profile 반환",
                  "payload": "sub + email + email_verified=false",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "Provider profile",
                    "before": "email 소유 검증 상태가 미확정",
                    "after": "email은 있으나 email_verified=false"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-profile-scaffold"]
                },
                {
                  "from": "oauthProfileLoader",
                  "to": "oauthProfileLoader",
                  "verb": "검증되지 않은 profile 거부",
                  "payload": "OAuth2AuthenticationException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "내부 로그인 경로",
                    "before": "email을 내부 계정 후보로 넘길 수 있음",
                    "after": "profile gate에서 중단 · User 조회와 JWT 없음"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-profile-scaffold"]
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "OAuthAccountService · UserRepository",
              "reason": "검증되지 않은 email을 내부 사용자 식별에 사용하지 않습니다."
            },
            {
              "label": "JwtTokenProvider",
              "reason": "내부 사용자가 확정되지 않아 우리 API token을 만들지 않습니다."
            }
          ]
        },
        "route": ["Browser", "Spring Security", "Google OAuth", "CustomOAuthUserService"],
        "snapshot": [
          { "label": "email_verified", "value": "false", "tone": "blocked" },
          { "label": "User 조회", "value": "도달하지 않음" },
          { "label": "JWT", "value": "발급하지 않음" }
        ],
        "evidence": "제공된 loadUser 연결 뒤 `normalizePrincipal`을 완성하는 실습과 profile 테스트가 이 gate를 확인합니다.",
        "outcome": "검증되지 않은 email은 내부 계정 생성·연결의 근거가 될 수 없습니다.",
        "stopAfter": 3
      },
      {
        "id": "local-email-collision",
        "label": "동일 email의 LOCAL 계정",
        "flowId": "oauth-login",
        "tone": "blocked",
        "prompt": "verified profile의 provider identity는 새 값이지만 같은 email의 LOCAL 계정이 이미 있습니다.",
        "observationTitle": "LOCAL email 충돌을 차단하는 위치",
        "theoryRef": "../../../theory.md#seq-05",
        "prediction": {
          "prompt": "verified email이 같으면 LOCAL 계정을 자동 연결해도 될까요?",
          "options": [
            {
              "id": "auto-link",
              "label": "email이 같으므로 자동 연결한다"
            },
            {
              "id": "link-required",
              "label": "별도 소유 확인 전에는 link_required로 끝낸다"
            }
          ],
          "answer": "link-required",
          "explanation": "외부 email 소유 확인은 기존 LOCAL password 자격 증명의 소유까지 증명하지 않습니다."
        },
        "reflection": {
          "prompt": "자동 연결 전에 추가로 필요한 소유 증거를 적어 보세요.",
          "hint": "Provider 인증과 기존 LOCAL 자격 증명을 분리합니다."
        },
        "diagram": {
          "caption": "provider identity가 없고 같은 email의 LOCAL User가 있으면 link_required로 끝내며 JWT를 발급하지 않습니다.",
          "lanes": [
            {
              "id": "local-collision-gate",
              "label": "내부 계정 충돌 gate",
              "description": "verified profile을 내부 identity와 email 순서로 조회합니다.",
              "participants": ["oauthProfileLoader", "oauthSuccessHandler", "oauthAccountService", "userRepository", "browser"],
              "steps": [
                {
                  "from": "oauthProfileLoader",
                  "to": "oauthSuccessHandler",
                  "verb": "verified profile 전달",
                  "payload": "new provider identity + existing LOCAL email",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "OAuth profile",
                    "before": "Provider attributes",
                    "after": "verified OAuthUserProfile"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-profile-scaffold"]
                },
                {
                  "from": "oauthSuccessHandler",
                  "to": "oauthAccountService",
                  "verb": "계정 처리 요청",
                  "payload": "OAuthUserProfile",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Profile",
                    "before": "외부 identity만 확인됨",
                    "after": "내부 계정 연결 정책의 입력이 됨"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "oauthAccountService",
                  "to": "userRepository",
                  "verb": "identity 뒤 email 조회",
                  "payload": "provider + providerId, then normalized email",
                  "kind": "call",
                  "effect": {
                    "kind": "gate",
                    "subject": "계정 후보",
                    "before": "내부 identity와 email 소유자가 미확정",
                    "after": "provider identity 0건 · 동일 email LOCAL User 1건"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "userRepository",
                  "to": "oauthAccountService",
                  "verb": "충돌 상태 반환",
                  "payload": "LOCAL User with same email",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "email 충돌",
                    "before": "신규 OAuth User 저장 가능 여부 미확정",
                    "after": "자동 연결과 신규 저장 모두 차단"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "oauthAccountService",
                  "to": "oauthSuccessHandler",
                  "verb": "연결 필요 상태",
                  "payload": "OAuthAccountLinkRequiredException",
                  "kind": "failure",
                  "effect": {
                    "kind": "gate",
                    "subject": "OAuth 로그인 결과",
                    "before": "내부 JWT 발급 후보",
                    "after": "link_required · token과 내부 오류 없음"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-account-target"]
                },
                {
                  "from": "oauthSuccessHandler",
                  "to": "browser",
                  "verb": "최소 공개 redirect",
                  "payload": "oauth=link_required + no-store",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "Browser redirect",
                    "before": "계정 충돌 결과를 모름",
                    "after": "email·token·내부 예외 없이 link_required만 확인"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["oauth-redirect-scaffold"]
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "JwtTokenProvider",
              "reason": "LOCAL 계정 소유 확인이 없어 내부 사용자를 확정하지 않습니다."
            }
          ]
        },
        "route": ["CustomOAuthUserService", "OAuthLoginSuccessHandler", "OAuthAccountService", "UserRepository", "Browser"],
        "snapshot": [
          { "label": "Provider identity", "value": "기존 User 없음" },
          { "label": "동일 email", "value": "LOCAL User 존재", "tone": "blocked" },
          { "label": "공개 결과", "value": "link_required · JWT 없음" }
        ],
        "evidence": "`handleOAuthLogin`은 실습 완료 목표이며 계정 정책 테스트가 provider identity 우선 조회, LOCAL 충돌과 JWT 미발급을 확인합니다.",
        "outcome": "verified email이 같아도 LOCAL 자격 증명의 소유를 확인하기 전에는 계정을 연결할 수 없습니다.",
        "stopAfter": 4
      },
      {
        "id": "recovery-lifecycle",
        "label": "LOCAL 계정 복구",
        "flowId": "account-recovery",
        "tone": "recovered",
        "prompt": "LOCAL 사용자가 복구를 요청하고 메일의 raw token으로 새 password를 확정합니다.",
        "observationTitle": "발급·메일·확정에서 달라지는 상태",
        "theoryRef": "../../../theory.md#seq-05",
        "visual": {
          "src": "../../assets/diagrams/05-password-reset-lifecycle.svg",
          "alt": "raw reset token 발급, SHA-256 hash 저장, commit 이후 비동기 SMTP, hash 재조회와 BCrypt password 변경의 세 단계",
          "caption": "raw token은 사용자에게만 전달하고 DB에는 hash를 남깁니다. 메일과 confirm은 token row commit을 기준으로 분리됩니다."
        },
        "prediction": {
          "prompt": "복구 메일에 넣은 raw token을 DB에도 그대로 저장해야 할까요?",
          "options": [
            {
              "id": "store-raw",
              "label": "confirm 때 비교하려고 raw token을 저장한다"
            },
            {
              "id": "store-hash",
              "label": "raw는 전달하고 DB에는 SHA-256 hash만 저장한다"
            }
          ],
          "answer": "store-hash",
          "explanation": "confirm 요청의 raw token을 다시 hash하면 원문을 DB에 남기지 않고도 같은 token인지 확인할 수 있습니다."
        },
        "reflection": {
          "prompt": "발급, mail, confirm 세 경계에서 각각 남는 상태를 한 줄씩 적어 보세요.",
          "hint": "DB hash row, commit 후 async task, BCrypt password와 usedAt을 봅니다."
        },
        "diagram": {
          "caption": "LOCAL 복구 요청은 raw/hash 분리와 token row commit 뒤 비동기 메일로 이어지고, confirm은 hash·lock·만료·usedAt을 확인해 password와 사용 상태를 한 transaction에서 바꿉니다.",
          "participants": [
            "recoveryClient",
            "accountRecoveryController",
            "accountRecoveryService",
            "userRepository",
            "passwordResetTokenCodec",
            "passwordResetTokenRepository",
            "springTransactionEvents",
            "recoveryMailEventDispatcher",
            "recoveryMailSender",
            "smtpAdapter",
            "passwordEncoder",
            "recoveryTransaction"
          ],
          "lanes": [
            {
              "id": "issue-reset-token",
              "label": "1. 요청 · token 발급",
              "description": "LOCAL 사용자와 cooldown을 확인한 뒤 raw token과 저장용 hash를 분리합니다.",
              "participants": ["recoveryClient", "accountRecoveryController", "accountRecoveryService", "userRepository", "passwordResetTokenRepository", "passwordResetTokenCodec"],
              "nextLaneIds": ["after-commit-mail"],
              "steps": [
                {
                  "from": "recoveryClient",
                  "to": "accountRecoveryController",
                  "verb": "복구 요청",
                  "payload": "POST /account-recovery/password-reset + email",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "복구 요청",
                    "before": "email이 client 입력에만 존재",
                    "after": "검증된 email DTO가 recovery API에 도착"
                  },
                  "evidenceScope": "runtime",
                  "codePointIds": ["recovery-service-target"]
                },
                {
                  "from": "accountRecoveryController",
                  "to": "accountRecoveryService",
                  "verb": "복구 정책 위임",
                  "payload": "requestPasswordReset(normalized email)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "정규화된 email",
                    "before": "계정 존재와 provider 종류 미확정",
                    "after": "계정 복구 정책의 조회 입력이 됨"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["recovery-service-target"]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "userRepository",
                  "verb": "LOCAL 사용자 잠금 조회",
                  "payload": "normalized email",
                  "kind": "call",
                  "effect": {
                    "kind": "gate",
                    "subject": "복구 대상",
                    "before": "계정 존재와 authProvider 미확정",
                    "after": "LOCAL User를 write lock으로 확보"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["recovery-service-target"]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "passwordResetTokenRepository",
                  "verb": "사용자별 row 잠금",
                  "payload": "userId + current time",
                  "kind": "call",
                  "effect": {
                    "kind": "gate",
                    "subject": "재요청 가능 시각",
                    "before": "기존 token과 cooldown 상태 미확정",
                    "after": "1분 미만이면 중단 · 정확히 1분이면 새 발급 허용"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["reset-token-row-scaffold"]
                },
                {
                  "from": "passwordResetTokenRepository",
                  "to": "accountRecoveryService",
                  "verb": "발급 가능 상태 반환",
                  "payload": "locked per-user token row",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "Token row",
                    "before": "이전 hash와 발급 시각을 확인 중",
                    "after": "cooldown이 끝나 새 token을 회전할 수 있음"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["reset-token-row-scaffold"]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "passwordResetTokenCodec",
                  "verb": "raw 생성 · hash 분리",
                  "payload": "32-byte random → Base64URL raw + SHA-256 hash",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "Reset token material",
                    "before": "token 값이 없음",
                    "after": "메일용 raw token과 DB용 64자리 hash가 따로 존재"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["reset-token-codec"]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "passwordResetTokenRepository",
                  "verb": "row 회전 · 저장",
                  "payload": "tokenHash + issuedAt + expiresAt(+15m)",
                  "kind": "persist",
                  "effect": {
                    "kind": "persist",
                    "subject": "사용자별 reset token row",
                    "before": "이전 hash가 있거나 row가 없음",
                    "after": "새 hash·15분 만료·usedAt=null · 이전 raw token 무효"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["reset-token-row-scaffold", "reset-token-used-scaffold"],
                  "check": "DB에는 raw token이 없고 사용자당 한 row가 새 hash로 회전하는지 확인합니다."
                }
              ]
            },
            {
              "id": "after-commit-mail",
              "label": "2. commit 후 비동기 mail",
              "description": "token row commit과 HTTP 202를 SMTP 완료 여부에서 분리합니다.",
              "participants": ["accountRecoveryService", "passwordResetTokenRepository", "springTransactionEvents", "recoveryMailEventDispatcher", "accountRecoveryController", "recoveryClient", "recoveryMailSender", "smtpAdapter"],
              "nextLaneIds": ["confirm-reset"],
              "steps": [
                {
                  "from": "accountRecoveryService",
                  "to": "springTransactionEvents",
                  "verb": "메일 event 등록",
                  "payload": "PasswordResetMailRequestedEvent([REDACTED])",
                  "kind": "event",
                  "effect": {
                    "kind": "fanout",
                    "subject": "복구 메일 event",
                    "before": "transaction 안에 token row 변경만 존재",
                    "after": "commit 성공 때만 전달할 event가 등록됨"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["recovery-service-target"]
                },
                {
                  "from": "passwordResetTokenRepository",
                  "to": "springTransactionEvents",
                  "verb": "transaction commit",
                  "payload": "hashed token row",
                  "kind": "persist",
                  "effect": {
                    "kind": "persist",
                    "subject": "Reset token row",
                    "before": "hash row가 transaction 안에서만 변경됨",
                    "after": "hash row가 commit되어 mail event 전달 가능"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["reset-token-row-scaffold", "mail-dispatch-scaffold"]
                },
                {
                  "from": "springTransactionEvents",
                  "to": "recoveryMailEventDispatcher",
                  "verb": "AFTER_COMMIT 전달",
                  "payload": "redacted recipient + reset link",
                  "kind": "event",
                  "effect": {
                    "kind": "fanout",
                    "subject": "Mail dispatch 조건",
                    "before": "commit 전에는 dispatcher가 실행되지 않음",
                    "after": "commit 성공 뒤 dispatcher 호출 가능"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["mail-dispatch-scaffold"]
                },
                {
                  "from": "recoveryMailEventDispatcher",
                  "to": "recoveryMailEventDispatcher",
                  "verb": "bounded executor 제출",
                  "payload": "core 1 · max 2 · queue 100",
                  "kind": "event",
                  "effect": {
                    "kind": "transfer",
                    "subject": "SMTP 작업",
                    "before": "HTTP 요청 thread에서 SMTP를 실행하지 않음",
                    "after": "recovery-mail executor의 별도 작업으로 분리"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["mail-dispatch-scaffold"]
                },
                {
                  "from": "accountRecoveryController",
                  "to": "recoveryClient",
                  "verb": "중립 응답",
                  "payload": "202 Accepted + Cache-Control: no-store",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "HTTP 결과",
                    "before": "계정 존재와 SMTP 결과를 client가 추측할 수 있음",
                    "after": "계정 없음·OAuth 계정·SMTP 실패도 같은 공개 202"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["mail-dispatch-scaffold"],
                  "check": "202는 mail delivery 성공을 뜻하지 않습니다."
                },
                {
                  "from": "recoveryMailEventDispatcher",
                  "to": "recoveryMailSender",
                  "verb": "비동기 발송 위임",
                  "payload": "recipient + #reset_token link",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Mail command",
                    "before": "bounded executor task에 redacted event가 있음",
                    "after": "메일 포트가 recipient와 reset link를 받음"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["mail-dispatch-scaffold"]
                },
                {
                  "from": "recoveryMailSender",
                  "to": "smtpAdapter",
                  "verb": "SMTP message 발송",
                  "payload": "from + recipient + subject + reset link",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "SMTP 요청",
                    "before": "메일 포트 입력만 존재",
                    "after": "JavaMailSender 호출 · 실제 수신함 도착은 아직 미확인"
                  },
                  "evidenceScope": "manual",
                  "codePointIds": ["smtp-adapter-target"],
                  "check": "자동 테스트는 message 조립과 호출·실패 비노출까지만 확인하고 실제 delivery는 수동 E2E로 확인합니다."
                }
              ]
            },
            {
              "id": "confirm-reset",
              "label": "3. token 확인 · 비밀번호 변경",
              "description": "raw token을 다시 hash하고 잠긴 DB 상태에서 만료·단일 사용을 확인합니다.",
              "participants": ["recoveryClient", "accountRecoveryController", "accountRecoveryService", "recoveryTransaction", "passwordEncoder"],
              "steps": [
                {
                  "from": "recoveryClient",
                  "to": "accountRecoveryController",
                  "verb": "재설정 확정",
                  "payload": "POST /account-recovery/password-reset/confirm + token + newPassword",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Confirm 요청",
                    "before": "raw token과 새 password가 browser 메모리에 있음",
                    "after": "검증된 confirm DTO가 recovery API에 도착"
                  },
                  "evidenceScope": "runtime",
                  "codePointIds": ["recovery-service-target"]
                },
                {
                  "from": "accountRecoveryController",
                  "to": "accountRecoveryService",
                  "verb": "확정 정책 위임",
                  "payload": "confirmPasswordReset(request)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "Confirm DTO",
                    "before": "token 유효성과 사용자 상태 미확정",
                    "after": "복구 transaction의 검증 입력이 됨"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["recovery-service-target"]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "accountRecoveryService",
                  "verb": "raw token hash 계산",
                  "payload": "raw token → SHA-256 hash",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "Confirm token",
                    "before": "DB 조회에 사용할 수 없는 raw token",
                    "after": "저장된 tokenHash와 비교할 64자리 hash"
                  },
                  "evidenceScope": "code",
                  "codePointIds": ["reset-token-codec"]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "recoveryTransaction",
                  "verb": "hash 조회 · 사용자와 token 잠금",
                  "payload": "tokenHash + userId",
                  "kind": "call",
                  "effect": {
                    "kind": "gate",
                    "subject": "DB 복구 상태",
                    "before": "hash에 대응하는 사용자와 token row 미확정",
                    "after": "같은 transaction의 locked User와 PasswordResetToken 확보"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["recovery-service-target", "reset-token-row-scaffold"]
                },
                {
                  "from": "recoveryTransaction",
                  "to": "accountRecoveryService",
                  "verb": "수명 주기 판정",
                  "payload": "LOCAL + same user + usedAt=null + expiresAt>now",
                  "kind": "response",
                  "effect": {
                    "kind": "gate",
                    "subject": "Reset token 상태",
                    "before": "만료·재사용·회전 여부 미확정",
                    "after": "모든 조건 통과 또는 generic INVALID_PASSWORD_RESET_TOKEN"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["recovery-service-target", "reset-token-row-scaffold", "reset-token-used-scaffold"],
                  "check": "미존재·만료·재사용·회전 token은 같은 400으로 끝나며 password를 바꾸지 않습니다."
                },
                {
                  "from": "accountRecoveryService",
                  "to": "passwordEncoder",
                  "verb": "새 password encode",
                  "payload": "newPassword → BCrypt hash",
                  "kind": "transform",
                  "effect": {
                    "kind": "transform",
                    "subject": "User password",
                    "before": "검증된 새 password 원문",
                    "after": "저장 가능한 BCrypt password hash"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["recovery-service-target"]
                },
                {
                  "from": "accountRecoveryService",
                  "to": "recoveryTransaction",
                  "verb": "비밀번호와 사용 상태 commit",
                  "payload": "User.password=BCrypt + token.usedAt=now",
                  "kind": "persist",
                  "effect": {
                    "kind": "persist",
                    "subject": "복구 transaction",
                    "before": "이전 password hash · usedAt=null",
                    "after": "새 BCrypt hash · usedAt 기록 · 같은 token 재사용 불가"
                  },
                  "evidenceScope": "test",
                  "codePointIds": ["reset-token-row-scaffold", "reset-token-used-scaffold"],
                  "check": "같은 transaction이 commit되면 Controller는 no-store와 204를 반환합니다."
                }
              ]
            }
          ]
        },
        "route": [
          "Recovery Client",
          "AccountRecoveryController",
          "AccountRecoveryService",
          "PasswordResetTokenCodec",
          "PasswordResetTokenRepository",
          "RecoveryMailEventDispatcher",
          "RecoveryMailSender",
          "SmtpRecoveryMailSender",
          "User + reset token transaction"
        ],
        "snapshot": [
          { "label": "DB 저장", "value": "SHA-256 hash만 저장" },
          { "label": "정책", "value": "TTL 15분 · cooldown 1분 · 단일 사용" },
          { "label": "메일", "value": "AFTER_COMMIT · bounded async" },
          { "label": "확정", "value": "204 또는 generic 400", "tone": "recovered" }
        ],
        "evidence": "제공된 token codec·row·AFTER_COMMIT dispatcher scaffold와 실습 완료 후 recovery 테스트가 hash·회전·만료·단일 사용·BCrypt·비동기 경계를 확인합니다. 실제 Gmail 수신은 별도 수동 증거입니다.",
        "outcome": "202는 복구 요청 접수, SMTP 반환은 외부 호출, 204는 password와 usedAt transaction commit을 각각 뜻합니다."
      }
    ]
  },
  "actors": [
    { "id": "browser", "label": "Browser", "kind": "client" },
    { "id": "oauth", "label": "Google OAuth", "kind": "external" },
    { "id": "account", "label": "OAuthAccountService", "kind": "service" },
    { "id": "recovery", "label": "AccountRecoveryService", "kind": "service" },
    { "id": "token-store", "label": "PasswordResetTokenRepository", "kind": "repository" },
    { "id": "mail", "label": "RecoveryMailEventDispatcher", "kind": "event" }
  ],
  "flows": [
    {
      "id": "oauth-login",
      "title": "OAuth profile과 내부 계정 판단",
      "summary": "verified profile을 내부 identity와 email 충돌 정책에 연결한 뒤 JWT 또는 차단으로 끝냅니다.",
      "steps": [
        {
          "id": "oauth-profile",
          "from": "Browser",
          "to": "CustomOAuthUserService",
          "problem": "Provider profile을 내부 계정 근거로 바로 사용할 수 없습니다.",
          "concept": "Verified profile gate",
          "action": "sub, email, email_verified를 providerId와 verified profile로 정규화합니다.",
          "check": "필수 값과 email_verified=false가 profile 단계에서 거부되는지 확인합니다.",
          "codePointIds": ["oauth-profile-scaffold"]
        },
        {
          "id": "oauth-account",
          "from": "CustomOAuthUserService",
          "to": "OAuthAccountService",
          "problem": "외부 identity와 내부 계정은 같은 저장 단위가 아닙니다.",
          "concept": "Provider identity first",
          "action": "provider + providerId를 먼저 찾고 email 충돌은 자동 연결하지 않습니다.",
          "check": "LOCAL email 충돌이 link_required로 끝나는지 확인합니다.",
          "codePointIds": ["oauth-account-target"]
        },
        {
          "id": "oauth-jwt",
          "from": "OAuthAccountService",
          "to": "JwtTokenProvider",
          "problem": "Provider token은 우리 API 인증 계약이 아닙니다.",
          "concept": "Internal JWT",
          "action": "내부 User의 저장된 email로 자체 JWT를 발급합니다.",
          "check": "기존 OAuth User의 provider email 변경이 내부 email을 덮지 않는지 확인합니다."
        },
        {
          "id": "oauth-redirect",
          "from": "OAuthLoginSuccessHandler",
          "to": "Browser",
          "problem": "JWT가 query에 있으면 로그와 referrer 노출 범위가 커집니다.",
          "concept": "Fragment demo boundary",
          "action": "JWT를 fragment에 넣고 no-store redirect를 만듭니다.",
          "check": "화면이 token을 메모리로 옮긴 직후 URL을 지우는지 확인합니다.",
          "codePointIds": ["oauth-redirect-scaffold"]
        }
      ]
    },
    {
      "id": "account-recovery",
      "title": "Reset token 발급·메일·확정",
      "summary": "raw/hash 분리, commit 후 비동기 SMTP, hash와 lock 기반 단일 사용 confirm을 연결합니다.",
      "steps": [
        {
          "id": "recovery-request",
          "from": "AccountRecoveryController",
          "to": "AccountRecoveryService",
          "problem": "계정 존재와 provider 종류를 공개 응답으로 드러내면 안 됩니다.",
          "concept": "LOCAL-only neutral response",
          "action": "LOCAL 사용자와 1분 cooldown을 확인하되 유효한 요청은 같은 202를 유지합니다.",
          "check": "계정 없음·OAuth 계정·SMTP 실패도 no-store 202인지 확인합니다.",
          "codePointIds": ["recovery-service-target"]
        },
        {
          "id": "recovery-token",
          "from": "PasswordResetTokenCodec",
          "to": "PasswordResetTokenRepository",
          "problem": "raw token 원문을 DB에 남기면 저장소 노출 위험이 커집니다.",
          "concept": "Hashed single-use token",
          "action": "32-byte raw token과 SHA-256 hash를 분리하고 사용자당 row를 15분 값으로 회전합니다.",
          "check": "이전 raw token과 정확히 만료 시각인 token이 무효인지 확인합니다.",
          "codePointIds": ["reset-token-codec", "reset-token-row-scaffold"]
        },
        {
          "id": "recovery-mail",
          "from": "Spring Transaction Events",
          "to": "RecoveryMailEventDispatcher",
          "problem": "commit 전 mail이나 요청 thread의 SMTP 대기는 token 상태와 HTTP 결과를 결합합니다.",
          "concept": "AFTER_COMMIT bounded async",
          "action": "commit 뒤 event를 bounded executor에서 mail port로 전달합니다.",
          "check": "HTTP 202가 SMTP completion을 기다리지 않고 실패 세부를 노출하지 않는지 확인합니다.",
          "codePointIds": ["mail-dispatch-scaffold"]
        },
        {
          "id": "recovery-confirm",
          "from": "AccountRecoveryService",
          "to": "User + reset token transaction",
          "problem": "raw token 문자열만 같다고 password를 바꿀 수 없습니다.",
          "concept": "Hash lookup, locks and lifecycle gate",
          "action": "hash lookup 뒤 사용자와 token을 잠그고 만료·usedAt·사용자 일치를 확인합니다.",
          "check": "미존재·만료·재사용·회전 token이 같은 400인지 확인합니다.",
          "codePointIds": ["recovery-service-target"]
        },
        {
          "id": "recovery-commit",
          "from": "PasswordEncoder",
          "to": "User + reset token transaction",
          "problem": "password 변경과 token 사용 처리가 따로 commit되면 재사용 창이 생깁니다.",
          "concept": "Atomic password reset",
          "action": "BCrypt password hash와 usedAt을 같은 transaction에서 commit합니다.",
          "check": "성공 204 뒤 같은 token 재사용이 generic 400인지 확인합니다.",
          "codePointIds": ["reset-token-row-scaffold", "reset-token-used-scaffold"]
        }
      ]
    }
  ],
  "codePoints": [
    {
      "id": "oauth-profile-scaffold",
      "title": "제공된 profile 연결에서 실습 목표로 진입",
      "file": "src/main/kotlin/com/andi/rest_crud/oauth/security/CustomOAuthUserService.kt",
      "language": "kotlin",
      "snippet": "override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {\n    return normalizePrincipal(\n        userRequest.clientRegistration.registrationId,\n        delegate.loadUser(userRequest)\n    )\n}",
      "explanation": "외부 user-info 호출은 제공되어 있고, `normalizePrincipal`에서 필수 값과 verified 상태를 검사하는 부분이 실습 완료 목표입니다.",
      "check": "Provider attributes가 검증된 내부 식별 속성으로 바뀌는지 profile 테스트로 확인합니다."
    },
    {
      "id": "oauth-account-target",
      "title": "내부 계정 판단은 실습 완료 목표",
      "file": "src/main/kotlin/com/andi/rest_crud/oauth/service/OAuthAccountService.kt",
      "language": "kotlin",
      "snippet": "@Transactional\nfun handleOAuthLogin(profile: OAuthUserProfile): OAuthLoginResponse {\n    // TODO: 검증된 profile로 기존 identity 조회, LOCAL 충돌 거부, 신규 계정 저장과 JWT 발급을 구현하세요.\n    TODO(\"OAuth 계정 처리를 완성하세요.\")\n}",
      "explanation": "provider identity 조회, LOCAL 충돌 차단, 신규 저장과 자체 JWT 발급을 이 메서드에 연결합니다.",
      "check": "계정 정책 테스트의 existing, collision, new user 분기가 모두 통과하는지 확인합니다."
    },
    {
      "id": "oauth-redirect-scaffold",
      "title": "제공된 helper는 token을 fragment에만 둡니다",
      "file": "src/main/kotlin/com/andi/rest_crud/oauth/security/OAuthLoginHandlers.kt",
      "language": "kotlin",
      "snippet": "return UriComponentsBuilder.fromUriString(frontendUrl)\n    .queryParam(\"oauth\", \"success\")\n    .queryParam(\"provider\", result.provider)\n    .queryParam(\"isNewUser\", result.isNewUser)\n    .fragment(\"access_token=${result.accessToken}\")\n    .build()\n    .encode()\n    .toUriString()",
      "explanation": "redirect helper는 제공되어 있으며 success handler에서 검증된 profile과 내부 로그인 결과를 이 helper에 연결하는 것이 실습 목표입니다.",
      "check": "query에는 공개 metadata만, JWT는 fragment에만 있는지 확인합니다."
    },
    {
      "id": "reset-token-codec",
      "title": "제공된 codec은 raw token과 저장 hash를 분리합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/recovery/security/PasswordResetTokenCodec.kt",
      "language": "kotlin",
      "snippet": "fun generateRawToken(): String {\n    val bytes = ByteArray(TOKEN_BYTES)\n    secureRandom.nextBytes(bytes)\n    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)\n}\n\nfun hash(rawToken: String): String {\n    val digest = MessageDigest.getInstance(\"SHA-256\")\n        .digest(rawToken.toByteArray(StandardCharsets.UTF_8))\n    return HexFormat.of().formatHex(digest)\n}",
      "explanation": "32-byte raw token은 link로 전달하고 같은 값을 SHA-256 hash로 바꿔 persistence key로 사용합니다.",
      "check": "raw 형식·길이·매번 새 값과 64자리 hash를 codec 테스트로 확인합니다."
    },
    {
      "id": "reset-token-row-scaffold",
      "title": "제공된 row는 rotation과 단일 사용 상태를 보관합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/recovery/domain/PasswordResetToken.kt",
      "language": "kotlin",
      "snippet": "fun rotate(newTokenHash: String, issuedAt: Instant, expiresAt: Instant) {\n    tokenHash = newTokenHash\n    createdAt = issuedAt\n    this.expiresAt = expiresAt\n    usedAt = null\n}",
      "explanation": "사용자당 한 row를 새 hash와 만료 시각으로 회전하면 이전 raw token은 더 이상 저장 hash와 매칭되지 않습니다.",
      "check": "새 발급이 이전 hash와 usedAt 상태를 교체하는지 확인합니다."
    },
    {
      "id": "reset-token-used-scaffold",
      "title": "제공된 row는 성공한 token의 사용 시각을 기록합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/recovery/domain/PasswordResetToken.kt",
      "language": "kotlin",
      "snippet": "fun markUsed(usedAt: Instant) {\n    this.usedAt = usedAt\n}",
      "explanation": "confirm transaction에서 usedAt을 기록하면 같은 token은 다음 수명 주기 검사에서 거부됩니다.",
      "check": "성공 뒤 같은 raw token의 두 번째 요청이 generic 400인지 확인합니다."
    },
    {
      "id": "recovery-service-target",
      "title": "발급과 확정 orchestration은 실습 완료 목표",
      "file": "src/main/kotlin/com/andi/rest_crud/recovery/service/AccountRecoveryService.kt",
      "language": "kotlin",
      "snippet": "@Transactional\nfun requestPasswordReset(email: String) {\n    // TODO: LOCAL 사용자 lock, cooldown, hash 저장과 AFTER_COMMIT mail event 발행을 구현하세요.\n    TODO(\"비밀번호 재설정 token 발급을 완성하세요.\")\n}\n\n@Transactional\nfun confirmPasswordReset(request: PasswordResetConfirmRequest) {\n    // TODO: token hash와 사용자 lock으로 만료·단일 사용을 확인하고 password 변경을 같은 transaction에 묶으세요.\n    TODO(\"비밀번호 재설정 확정을 완성하세요.\")\n}",
      "explanation": "제공된 codec, row, repository와 event 계약을 사용해 발급·cooldown과 hash/lock 기반 확정을 두 메서드에 연결합니다.",
      "check": "recovery service·controller·concurrency 테스트를 함께 실행해 transaction 경계를 확인합니다."
    },
    {
      "id": "mail-dispatch-scaffold",
      "title": "제공된 dispatcher는 commit 뒤 별도 executor에서 동작합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/recovery/mail/RecoveryMailDispatch.kt",
      "language": "kotlin",
      "snippet": "@Async(RECOVERY_MAIL_EXECUTOR)\n@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)\nfun dispatch(event: PasswordResetMailRequestedEvent) {\n    try {\n        recoveryMailSender.sendPasswordResetMail(event.recipientEmail, event.resetLink)\n    } catch (_: RuntimeException) {\n        log.warn(\"Password reset mail delivery failed.\")\n    }\n}",
      "explanation": "실제 구현은 발송 예외를 비식별 warning으로 처리하며 executor의 core, max와 queue 크기도 제한합니다.",
      "check": "rollback에서는 발송하지 않고 commit 이후 요청 thread와 다른 thread에서 sender가 호출되는지 확인합니다."
    },
    {
      "id": "smtp-adapter-target",
      "title": "SMTP message 조립은 adapter의 실습 완료 목표",
      "file": "src/main/kotlin/com/andi/rest_crud/recovery/mail/SmtpRecoveryMailSender.kt",
      "language": "kotlin",
      "snippet": "override fun sendPasswordResetMail(recipientEmail: String, resetLink: String) {\n    // TODO: 발신자·수신자·일회용 link를 담은 message를 만들고 MailException을 도메인 예외로 변환하세요.\n    TODO(\"SMTP 복구 메일 발송을 완성하세요.\")\n}",
      "explanation": "발신자·수신자·제목·본문을 구성하고 MailException을 복구 도메인 실패로 변환합니다.",
      "check": "mock JavaMailSender로 message와 예외 변환을 확인하며 실제 SMTP delivery와 구분합니다."
    }
  ],
  "concepts": [
    {
      "title": "외부 identity는 내부 계정 후보입니다",
      "body": "verified profile도 provider identity와 내부 email 충돌 정책을 통과해야 합니다."
    },
    {
      "title": "raw token과 DB hash의 수명은 다릅니다",
      "body": "raw는 사용자에게 전달되고 hash·만료·usedAt이 서버의 검증 상태가 됩니다."
    },
    {
      "title": "메일과 비밀번호 변경은 별도 증거입니다",
      "body": "202와 SMTP 호출은 password 변경을 뜻하지 않으며 confirm transaction의 204가 별도 완료 신호입니다."
    }
  ],
  "responsibilities": [
    {
      "name": "OAuth profile · account policy",
      "role": "verified profile과 provider identity를 내부 사용자에 연결합니다.",
      "caution": "동일 email의 LOCAL 계정을 자동 연결하지 않습니다."
    },
    {
      "name": "AccountRecoveryService",
      "role": "LOCAL-only 발급, cooldown, hash row rotation과 confirm transaction을 조정합니다.",
      "caution": "raw token을 DB나 로그에 남기지 않습니다."
    },
    {
      "name": "RecoveryMailEventDispatcher",
      "role": "commit 이후 bounded executor에서 mail port를 호출합니다.",
      "caution": "비동기 호출 반환을 실제 수신함 delivery로 표현하지 않습니다."
    }
  ],
  "glossary": [
    {
      "term": "token rotation",
      "meaning": "사용자당 한 row의 hash와 시간을 새 발급값으로 교체하는 정책입니다.",
      "caution": "새 발급 직후 이전 raw token은 매칭되지 않습니다."
    },
    {
      "term": "single-use",
      "meaning": "성공한 confirm에서 usedAt을 기록해 같은 token의 다음 사용을 거부합니다.",
      "caution": "password 변경과 usedAt 기록은 같은 transaction이어야 합니다."
    },
    {
      "term": "generic reset failure",
      "meaning": "미존재·만료·재사용·회전 token을 같은 400 code로 반환하는 정책입니다.",
      "caution": "어떤 token 상태였는지 공개 응답으로 구분하지 않습니다."
    }
  ],
  "practice": [
    "Provider 인증 성공과 내부 계정 연결 성공의 차이를 설명할 수 있나요?",
    "raw token과 DB hash가 각각 어디에 존재하는지 설명할 수 있나요?",
    "202, SMTP 호출, confirm 204가 증명하는 범위를 구분할 수 있나요?",
    "만료·회전·재사용 token이 왜 같은 400으로 끝나는지 설명할 수 있나요?"
  ],
  "checks": [
    "verified email과 providerId의 역할을 구분할 수 있나요?",
    "LOCAL email 충돌에서 JWT가 발급되지 않는 이유를 설명할 수 있나요?",
    "32-byte raw token, SHA-256 hash, 15분 TTL, 1분 cooldown을 연결할 수 있나요?",
    "AFTER_COMMIT bounded async와 실제 SMTP delivery 증거를 구분할 수 있나요?",
    "BCrypt password와 usedAt이 같은 transaction에서 바뀌는 이유를 설명할 수 있나요?"
  ],
  "relatedDocs": [
    { "label": "이론 정리", "href": "../../../theory.md" },
    { "label": "구현 안내", "href": "../../../implementation.md" },
    { "label": "체크리스트", "href": "../../../checklist.md" }
  ],
  "sourceDocs": [
    { "label": "이론 정리", "href": "../../../theory.md" },
    { "label": "구현 안내", "href": "../../../implementation.md" },
    { "label": "체크리스트", "href": "../../../checklist.md" }
  ],
  "topic": "External authentication and secure account recovery",
  "question": "외부 identity와 reset token을 우리 서비스는 어느 경계에서 다시 검증할까?",
  "next": {
    "id": "06",
    "title": "Testing",
    "reason": "외부 identity와 복구 수명 주기를 연결했다면 다음에는 각 보안 조건이 어떤 테스트 증거로 고정되는지 확인합니다."
  }
};
