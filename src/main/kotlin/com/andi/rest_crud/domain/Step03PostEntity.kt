/*
 * 실습 순서 03 — 게시글 저장 계약
 * 선행 단계: Step01의 title/content Validation과 Step02의 email 길이를 확인합니다.
 * 이 단계의 판단: 요청 최대 길이와 작성자 식별값을 H2/MySQL 양쪽에서 같은 범위로 저장합니다.
 * 다음 연결: Step08이 인증된 email을 author로 기록하고 수정·삭제 전에 소유권을 비교합니다.
 */
package com.andi.rest_crud.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "posts")
class PostEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    // 요청 검증과 같은 길이를 DB에도 적용해 통과한 제목이 저장 중 잘리지 않게 합니다.
    @Column(nullable = false, length = 100)
    var title: String,

    // JPA 표준 length 매핑을 사용해 H2와 MySQL 모두 5000자 계약을 같은 방식으로 생성합니다.
    @Column(nullable = false, length = 5000)
    var content: String,

    // 작성자에는 인증된 User.email을 저장하므로 email과 같은 최대 길이를 보장합니다.
    @Column(nullable = false, length = 254)
    var author: String
) {
    // 쓰기 transaction 안에서 값을 바꾸면 JPA dirty checking이 반영하므로 Service에서 save를 반복하지 않습니다.
    fun update(title: String, content: String) {
        this.title = title
        this.content = content
    }

    // 인증 여부와 별개로 저장된 작성자와 현재 principal이 같은지 판단하는 소유권 규칙입니다.
    fun isWrittenBy(email: String): Boolean = author == email
}
