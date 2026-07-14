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
      "title": "검증된 외부 profile로 사용자를 식별합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/service/OAuthAccountService.kt",
      "language": "kotlin",
      "snippet": "fun handleOAuthLogin(profile: OAuthUserProfile): OAuthLoginResponse {\n    require(profile.emailVerified)\n    val linkResult = linkOrCreateUser(profile)\n    return createSuccessResponse(linkResult.user, linkResult.isNewUser)\n}\n\nprivate fun linkOrCreateUser(profile: OAuthUserProfile): OAuthLinkResult {\n    val existingOAuthUser = userRepository\n        .findByAuthProviderAndProviderId(profile.provider.uppercase(), profile.providerId)\n        .orElse(null)\n    val existingEmailUser = userRepository.findByEmail(profile.email).orElse(null)\n    if (existingOAuthUser == null && existingEmailUser != null) {\n        throw OAuthAccountLinkRequiredException()\n    }\n    // 기존 OAuth 사용자 갱신 또는 신규 사용자 생성\n}",
      "explanation": "이 파일은 `05-implementation` 브랜치 기준 경로입니다. providerId로 외부 사용자를 식별하고 verified email 충돌은 명시적 연결 절차로 보냅니다.",
      "check": "같은 email의 로컬 계정을 자동 연결하지 않고 link_required로 처리하는지 확인합니다."
    },
    {
      "id": "smtp-reset",
      "title": "계정 복구는 메일 발송 책임을 분리합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/service/AccountRecoveryService.kt",
      "language": "kotlin",
      "snippet": "fun requestPasswordReset(email: String) {\n    val user = userRepository.findByEmail(email).orElse(null) ?: return\n    val resetLink = createResetLink(user.email)\n    recoveryMailSender.sendPasswordResetMail(user.email, resetLink)\n}\n\nfun createResetLink(email: String): String {\n    val resetToken = UUID.randomUUID().toString()\n    return UriComponentsBuilder.fromUriString(passwordResetUrl)\n        .queryParam(\"recovery\", \"password-reset\")\n        .queryParam(\"email\", email)\n        .queryParam(\"token\", resetToken)\n        .build()\n        .toUriString()\n}",
      "explanation": "이 파일은 `05-implementation` 브랜치 기준 경로입니다. 사용자 조회, reset link 생성, SMTP 발송을 한 덩어리로 노출하지 않습니다.",
      "check": "계정 존재 여부나 reset token이 로그/화면에 과하게 드러나지 않는지 봅니다."
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
