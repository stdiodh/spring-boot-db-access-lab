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
      "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as PostController\n  participant Service as PostService\n  participant Repository as PostRepository\n  participant DB as MySQL\n  Client->>Controller: POST /posts + PostCreateRequest\n  Controller->>Service: create(request, authorEmail)\n  Service->>Repository: save(PostEntity)\n  Repository->>DB: insert row\n  DB-->>Repository: saved entity\n  Repository-->>Service: PostEntity\n  Service-->>Controller: PostResponse\n  Controller-->>Client: JSON response",
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
          "concept": "Verification",
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
      "snippet": "@Entity\n@Table(name = \"posts\")\nclass PostEntity(\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    val id: Long = 0L,\n    var title: String,\n    var content: String,\n    var author: String\n)",
      "explanation": "외부 요청 DTO가 아니라 DB row로 저장되는 내부 데이터 구조입니다.",
      "check": "Entity와 Request DTO를 같은 책임으로 보지 않습니다."
    },
    {
      "id": "repository-save",
      "title": "Service는 Repository에 DB 저장을 요청합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/service/PostService.kt",
      "language": "kotlin",
      "snippet": "fun create(request: PostCreateRequest, authorEmail: String): PostResponse {\n    val savedPost = postRepository.save(\n        PostEntity(\n            title = request.title,\n            content = request.content,\n            author = authorEmail\n        )\n    )\n\n    return PostResponse.from(savedPost)\n}",
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
  "topic": "Persistence and layered architecture",
  "question": "메모리 CRUD는 왜 DB 기반 CRUD로 이동해야 할까?",
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
