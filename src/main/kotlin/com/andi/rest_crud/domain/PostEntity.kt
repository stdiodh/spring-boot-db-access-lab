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
    fun update(title: String, content: String) {
        this.title = title
        this.content = content
    }

    fun isWrittenBy(email: String): Boolean = author == email
}
