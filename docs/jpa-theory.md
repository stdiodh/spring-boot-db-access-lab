# Spring Data JPA로 DB 저장 흐름 이해하기

> 메모리에만 저장하던 데이터를 실제 DB에 연결하면 무엇이 달라지는지 직접 확인해보자.

---

## 이 주제를 왜 배우는가

메모리 저장 방식은 흐름을 이해하기에는 좋지만, 서버를 다시 켜면 데이터가 사라진다.
실제 서비스에서는 데이터를 계속 보관하고 다시 꺼내 써야 하므로 DB가 필요하다.
그래서 이번 실습에서는 Spring Data JPA를 이용해 애플리케이션 코드가 DB와 연결되는 흐름을 직접 확인해본다.
이 흐름을 이해하면 다음에는 구조 분리, 검증, 예외 처리 같은 주제로 자연스럽게 이어질 수 있다.

---

## 핵심 용어 정리

### JPA

- **정의**
  Java 진영에서 객체와 DB를 연결하는 표준 방식이다.
- **왜 중요한가**
  DB 저장을 코드에서 조금 더 자연스럽게 다룰 수 있게 해준다.
- **이번 코드에서는 어디에 보이는가**
  `build.gradle.kts`의 JPA 의존성, `@Entity`, `IdolRepository`에서 흐름이 보인다.

> 한 줄 감각
> JPA는 "DB를 객체처럼 다루게 도와주는 연결 규칙"에 가깝다.

---

### Entity

- **정의**
  DB 테이블과 연결되는 객체다.
- **왜 중요한가**
  어떤 데이터를 저장하고 조회할지 코드에서 명확하게 보여준다.
- **이번 코드에서는 어디에 보이는가**
  `Idol.kt`가 Entity 역할을 맡는다.

> 한 줄 감각
> Entity는 "DB에 들어갈 데이터의 설계도"라고 보면 된다.

---

### Repository

- **정의**
  DB 접근을 담당하는 인터페이스다.
- **왜 중요한가**
  Service가 SQL을 직접 다루지 않고도 저장과 조회를 할 수 있게 해준다.
- **이번 코드에서는 어디에 보이는가**
  `IdolRepository.kt`가 그 역할을 맡는다.

> 한 줄 감각
> Repository는 "DB랑 대화하는 창구"에 가깝다.

---

### ORM

- **정의**
  객체와 관계형 DB를 서로 연결해주는 방식이다.
- **왜 중요한가**
  객체지향 코드와 테이블 구조 사이의 차이를 줄여준다.
- **이번 코드에서는 어디에 보이는가**
  `Idol` 객체를 DB 테이블처럼 다루는 흐름에서 간접적으로 보인다.

> 한 줄 감각
> ORM은 객체와 테이블 사이를 이어주는 통역기 같은 역할을 한다.

---

## 핵심 개념 설명

### 1. 메모리 저장과 DB 저장은 다르다

메모리 저장은 애플리케이션이 켜져 있을 때만 유지된다.
반면 DB 저장은 애플리케이션을 껐다 켜도 데이터가 남는다.
이번 실습에서는 Service가 더 이상 리스트를 직접 관리하지 않고, Repository를 통해 DB를 바라보도록 바뀐다.

---

### 2. Service는 DB를 직접 다루지 않고 Repository를 사용한다

Service의 역할은 비즈니스 흐름을 관리하는 것이다.
DB 접근까지 Service 안에서 전부 직접 처리하면 역할이 섞이기 쉽다.
그래서 이번 실습에서는 저장과 조회는 Repository에 맡기고, Service는 흐름을 조합하는 역할에 집중한다.

---

### 3. JPA를 쓰면 CRUD 흐름이 더 DB 중심으로 바뀐다

이전에는 리스트에 데이터를 넣고 꺼냈다면, 이제는 `save`, `findById`, `findAll`, `delete` 같은 메서드를 통해 DB에 접근한다.
즉, 겉으로 보이는 API는 비슷해도 내부 구조는 확실히 달라진다.
이번 실습의 핵심은 "API는 유지되지만 저장 방식이 바뀐다"는 점을 체감하는 것이다.

---

## 먼저 보면 좋은 코드

- `src/main/kotlin/com/andi/rest_crud/model/Idol.kt`
  - JPA가 어떤 객체를 DB 테이블과 연결하는지 가장 먼저 보이는 파일이다.
  - `@Entity`, `@Id`, `@GeneratedValue`를 먼저 보면 좋다.

- `src/main/kotlin/com/andi/rest_crud/repository/IdolRepository.kt`
  - 이번 주차에서 새로 등장하는 가장 중요한 파일 중 하나다.
  - "DB랑 대화하는 창구"가 어떻게 생겼는지 한 번에 볼 수 있다.

- `src/main/kotlin/com/andi/rest_crud/service/IdolService.kt`
  - 메모리 리스트 기반 코드가 DB 기반 코드로 바뀌는 핵심 지점이다.
  - `getAll()`, `create()`, `update()`에서 `idolRepository`를 어떻게 쓰는지 보는 게 포인트다.

---

## 코드 구조와 연결해서 보기

### Controller는 무엇을 할까?
- 요청을 받고 응답을 돌려주는 역할을 한다.
- 이번 실습에서는 Controller 자체보다, 내부에서 호출하는 Service 흐름이 어떻게 바뀌는지가 핵심이다.
- `IdolController`가 그 역할을 맡는다.

### Service는 무엇을 할까?
- 요청에 맞는 흐름을 조합하고, 필요한 저장/조회 작업을 Repository에 위임한다.
- 메모리 리스트를 직접 다루던 방식에서, DB 중심 흐름으로 바뀌는 지점을 가장 잘 보여준다.
- `IdolService`가 그 역할을 맡는다.
- 예를 들어 `create()` 안의 `idolRepository.save(idol)`를 보면 "아, 이제 진짜 DB에 저장하는구나"가 바로 보인다.

### 핵심 인프라 요소는 무엇을 할까?
- DB 접근과 매핑을 담당한다.
- `IdolRepository`, `application.yaml`, JPA 설정이 그 역할을 맡는다.
- `IdolRepository : JpaRepository<Idol, Long>` 이 선언이 이번 주차 핵심 중 하나다.

### DTO는 왜 필요할까?
- 요청 형식과 응답 형식을 분리해 코드가 더 읽기 쉬워지게 한다.
- Entity를 그대로 외부에 노출하지 않고, 필요한 형태로만 주고받을 수 있다.
- `IdolRequest`, `IdolResponse`가 그 역할을 맡는다.

---

## 이번 실습 흐름을 한 번에 보기

1. 클라이언트가 요청을 보낸다.
2. Controller가 요청을 받는다.
3. Service가 필요한 처리를 한다.
4. Repository가 DB에 저장하거나 조회한다.
5. 결과를 응답으로 돌려준다.

짧게 말하면, 이번 실습은
**[요청] → [처리] → [DB 저장/조회] → [응답]** 흐름을 익히는 과정이다.

---

## 실습에서 꼭 보면 좋은 포인트

- 메모리 리스트를 다루던 코드가 어디서 사라지는지
- Repository가 어떤 메서드로 DB와 연결되는지
- Entity와 DTO가 각각 어떤 역할을 맡는지
- `IdolService.getAll()`이 `idolRepository.findAll()`로 바뀌는 지점
- `IdolService.create()`에서 `save(...)` 결과를 `IdolResponse`로 바꾸는 지점

---

## 자주 헷갈리는 부분

### Q. JPA를 쓰면 SQL을 아예 몰라도 되나요?
A. 완전히 그렇지는 않다. 다만 입문 단계에서는 DB 저장/조회 흐름을 더 자연스럽게 이해하게 도와준다.

### Q. Repository가 있으면 Service는 필요 없나요?
A. 아니다. Repository는 DB 접근 창구이고, Service는 비즈니스 흐름을 조합하는 역할이라 둘의 역할이 다르다.

### Q. Entity랑 DTO를 왜 나누나요?
A. DB에 저장할 구조와 외부로 주고받을 구조를 분리하면 코드가 더 읽기 쉽고 바꾸기도 쉬워진다.

### Q. Repository만 있으면 CRUD가 다 끝난 건가요?
A. 아니다. Repository는 DB 접근 창구이고, 실제 흐름을 조합하는 건 여전히 Service가 맡는다.

---

## 한 줄 예시로 감 잡기

> JPA는 "DB에 직접 SQL로 일일이 말 거는 방식" 대신,
> "객체를 통해 더 자연스럽게 다루도록 도와주는 통역기"에 가깝다.

---

## 오늘 실습에서 꼭 기억할 것

1. JPA는 객체와 DB를 연결해주는 방식이다.
2. 이번 코드에서는 `Idol`, `IdolRepository`, `IdolService`가 그 흐름을 가장 잘 보여준다.
3. 다음 단계로 넘어가기 전에 메모리 저장과 DB 저장의 차이, 그리고 `save/findAll/findById/delete` 흐름을 설명할 수 있어야 한다.

---

## 참고 자료

- [Spring Data JPA 공식 문서](https://spring.io/projects/spring-data-jpa)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/reference/)
- [한눈에 보는 ORM 정리 - hanamon.kr](https://hanamon.kr/orm%ec%9d%b4%eb%9e%80-nodejs-lib-sequelize-%ec%86%8c%ea%b0%9c/)
