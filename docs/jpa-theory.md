# Spring Data JPA로 DB 저장 흐름 이해하기

> 메모리에만 저장하던 데이터를 실제 DB에 연결하면 무엇이 달라지는지 코드로 직접 확인해보자.

---

## 이 주제를 왜 배우는가

메모리 저장 방식은 흐름을 익히기에는 좋지만, 서버를 다시 켜면 데이터가 사라진다.
실제 서비스에서는 데이터를 계속 보관하고 다시 꺼내 써야 하므로 DB가 필요하다.
그래서 이번 실습에서는 Spring Data JPA를 붙여서 "같은 CRUD API가 DB 저장/조회 흐름으로 어떻게 바뀌는지"를 직접 확인해본다.
이 흐름이 잡히면 다음에는 구조 분리, 검증, 예외 처리처럼 코드를 더 오래 버티게 만드는 주제로 자연스럽게 이어질 수 있다.

---

## 핵심 용어 정리

### JPA

- **정의**
  자바 진영에서 객체와 DB를 연결하는 표준 방식이다.
- **왜 중요한가**
  DB 저장과 조회를 코드에서 조금 더 자연스럽게 다룰 수 있게 해준다.
- **이번 코드에서는 어디에 보이는가**
  `@Entity`, `IdolRepository`, JPA 관련 설정에서 흐름이 보인다.

> 한 줄 감각
> JPA는 "DB를 객체처럼 다루게 도와주는 연결 규칙"에 가깝다.

### Entity

- **정의**
  DB 테이블과 연결되는 객체다.
- **왜 중요한가**
  어떤 데이터를 저장할지 코드에서 바로 보여주기 때문이다.
- **이번 코드에서는 어디에 보이는가**
  `Idol` 클래스가 Entity 역할을 맡는다.

> 한 줄 감각
> Entity는 "DB에 들어갈 데이터 설계도"라고 보면 된다.

### Repository

- **정의**
  DB 접근을 담당하는 인터페이스다.
- **왜 중요한가**
  Service가 SQL을 직접 다루지 않고도 저장과 조회를 할 수 있게 해준다.
- **이번 코드에서는 어디에 보이는가**
  `IdolRepository`가 그 역할을 맡는다.

> 한 줄 감각
> Repository는 "DB와 대화하는 창구"에 가깝다.

---

## 핵심 개념 설명

### 1. 메모리 저장과 DB 저장은 유지 방식이 다르다

메모리 저장은 애플리케이션이 켜져 있을 때만 유지된다.
반면 DB 저장은 애플리케이션을 다시 실행해도 데이터가 남는다.
이번 실습의 핵심은 API 모양은 비슷해도, 내부 저장 방식이 메모리 리스트에서 DB로 바뀐다는 점을 체감하는 것이다.

### 2. Service는 DB를 직접 다루지 않고 Repository를 사용한다

Service의 역할은 흐름을 조합하는 것이지, DB 접근 코드를 직접 다 쓰는 것이 아니다.
그래서 이번 실습에서는 저장과 조회는 Repository에 맡기고, Service는 요청에 맞는 처리 순서를 만드는 역할에 집중한다.
이 역할 분리가 뒤에서 테스트와 리팩토링을 더 쉽게 만들어준다.

### 3. JPA를 붙이면 CRUD가 "DB 중심 코드"로 바뀐다

이전에는 리스트에 넣고 찾았다면, 이제는 `save`, `findAll`, `findById`, `deleteById` 같은 메서드로 DB를 다루게 된다.
즉, 바깥에서 보는 API는 비슷하지만 안쪽 구조는 분명히 달라진다.
이번 실습에서는 그 차이가 어디서 나타나는지만 잡아도 충분하다.

---

## 중요한 코드 먼저 보기

### 1. Entity가 되면 이 객체는 DB 테이블과 연결된다

```kotlin
@Entity
@Table(name = "idols")
data class Idol(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var name: String,
    var group: String,
    var agency: String,
    var debutYear: Int
)
```

- `@Entity`는 "이 객체를 DB와 연결해서 다루겠다"는 선언이다.
- `@Id`, `@GeneratedValue`를 보면 이제 id를 직접 증가시키는 대신 DB가 만들어준다는 감각도 같이 잡을 수 있다.
- 파일: `src/main/kotlin/com/andi/rest_crud/model/Idol.kt`

### 2. Repository가 생기면 DB 접근 창구가 분리된다

```kotlin
interface IdolRepository : JpaRepository<Idol, Long>
```

- 이 한 줄이 이번 주제에서 꽤 중요하다.
- Service가 더 이상 리스트를 직접 관리하지 않고, 이 Repository를 통해 저장과 조회를 하게 된다는 뜻이기 때문이다.
- 파일: `src/main/kotlin/com/andi/rest_crud/repository/IdolRepository.kt`

### 3. 이번 starter에서는 Service를 DB 흐름으로 바꾸는 게 핵심 TODO다

```kotlin
fun getAll(): List<IdolResponse> {
    // 이제 메모리 리스트가 아니라 repository에서 데이터를 가져와야 한다.
    TODO("idolRepository.findAll() 결과를 IdolResponse 목록으로 변환해 반환하세요.")
}
```

- 이 TODO가 바로 "메모리 기반 CRUD에서 DB 기반 CRUD로 바꾸는 지점"이다.
- 학생 입장에서는 여기서 `findAll()`과 DTO 변환 흐름을 연결해서 보면 된다.
- 파일: `src/main/kotlin/com/andi/rest_crud/service/IdolService.kt`

### 4. 설정 파일을 보면 진짜로 DB를 바라보고 있다는 게 보인다

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/idol_db
    username: root
    password: 1234
  jpa:
    hibernate:
      ddl-auto: update
```

- 이 설정은 애플리케이션이 실행될 때 어떤 DB를 바라볼지 정하는 부분이다.
- 코드만 보면 감이 안 올 수 있는데, 이 설정을 같이 보면 "아, 이제 진짜 DB에 붙는구나"가 더 잘 느껴진다.
- 파일: `src/main/resources/application.yaml`

---

## 코드 구조와 연결해서 보기

### Controller는 무엇을 할까?
- 요청을 받고 응답을 돌려주는 역할을 한다.
- 이번 실습에서는 Controller 자체보다, 내부에서 호출하는 Service 흐름이 어떻게 바뀌는지가 더 중요하다.
- `IdolController`는 그대로 두고, 안쪽 저장 방식만 바뀐다는 점을 보면 된다.

### Service는 무엇을 할까?
- 요청에 맞는 흐름을 조합하고, 필요한 저장/조회 작업을 Repository에 위임한다.
- 이번 starter에서는 이 Service가 아직 TODO 상태이기 때문에, 학생이 직접 DB 흐름으로 완성하게 된다.
- 즉, 이번 실습의 중심은 `IdolService`다.

### 핵심 인프라 요소는 무엇을 할까?
- DB 접근과 매핑을 담당한다.
- `IdolRepository`, `Idol` Entity, `application.yaml`이 이 주차 핵심 인프라 요소다.
- 이 셋이 연결되면서 "객체 ↔ DB" 흐름이 만들어진다.

### DTO는 왜 필요할까?
- 요청 형식과 응답 형식을 분리해 코드가 더 읽기 쉬워지게 한다.
- Entity를 그대로 외부에 노출하지 않고, 필요한 형태만 응답으로 바꿔 보여줄 수 있다.
- `IdolRequest`, `IdolResponse`가 그 역할을 맡는다.

---

## 이번 실습 흐름을 한 번에 보기

1. 클라이언트가 요청을 보낸다.
2. Controller가 요청을 받는다.
3. Service가 필요한 처리를 한다.
4. Repository가 DB에 저장하거나 조회한다.
5. 결과를 응답으로 돌려준다.

짧게 말하면, 이번 실습은  
**요청 → 처리 → DB 저장/조회 → 응답** 흐름을 익히는 과정이다.

---

## 실습에서 꼭 보면 좋은 포인트

- 메모리 리스트를 직접 다루던 코드가 어디서 사라지는지
- `IdolRepository`가 DB 접근 창구로 들어오는 지점
- `IdolService` TODO가 어떤 Repository 메서드로 채워질지
- Entity와 DTO가 각각 어떤 역할을 맡는지

---

## 자주 헷갈리는 부분

### Q. JPA를 쓰면 SQL을 아예 몰라도 되나요?
A. 완전히 그렇지는 않다. 다만 입문 단계에서는 DB 저장/조회 흐름을 더 자연스럽게 이해하게 도와준다.

### Q. Repository가 있으면 Service는 필요 없나요?
A. 아니다. Repository는 DB 접근 창구이고, Service는 비즈니스 흐름을 조합하는 역할이라 둘의 역할이 다르다.

### Q. Entity랑 DTO를 왜 나누나요?
A. DB에 저장할 구조와 외부로 주고받을 구조를 분리하면 코드가 더 읽기 쉽고 바꾸기도 쉬워진다.

### Q. starter 코드에 TODO가 있는 게 이상한가요?
A. 오히려 이번 실습의 핵심이다. 이미 만들어진 구조 안에서 저장 방식을 DB 중심으로 바꾸는 감각을 익히게 해준다.

---

## 한 줄 예시로 감 잡기

> JPA는 "DB에 직접 SQL로 일일이 말 거는 방식" 대신, "객체를 통해 더 자연스럽게 다루도록 도와주는 통역기"에 가깝다.

---

## 오늘 실습에서 꼭 기억할 것

1. JPA는 객체와 DB를 연결해주는 방식이다.
2. 이번 코드에서는 `Idol`, `IdolRepository`, `IdolService`가 그 흐름을 가장 잘 보여준다.
3. 다음 단계로 넘어가기 전에 메모리 저장과 DB 저장의 차이, 그리고 `findAll/save/findById/delete` 흐름을 설명할 수 있어야 한다.

---

## 참고 자료

- [Spring Data JPA 공식 문서](https://spring.io/projects/spring-data-jpa)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/reference/)
- [한눈에 보는 ORM 정리 - hanamon.kr](https://hanamon.kr/orm%ec%9d%b4%eb%9e%80-nodejs-lib-sequelize-%ec%86%8c%ea%b0%9c/)
