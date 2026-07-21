package com.andi.rest_crud.post.domain

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

    // Validation을 통과한 제목이 저장 단계에서 잘리지 않도록 DTO와 같은 길이를 사용합니다.
    @Column(nullable = false, length = 100)
    var title: String,

    // H2와 MySQL에서 같은 본문 저장 범위를 보장합니다.
    @Column(nullable = false, length = 5000)
    var content: String,

    // 소유권 비교에 쓰는 author는 사용자 email과 같은 저장 길이를 사용합니다.
    @Column(nullable = false, length = 254)
    var author: String
) {
    // 쓰기 transaction 안에서 값을 바꾸면 JPA dirty checking이 반영하므로 Service에서 save를 반복하지 않습니다.
    fun update(title: String, content: String) {
        this.title = title
        this.content = content
    }

    // 인증 성공은 신원만 증명하므로 게시글 소유권은 저장된 작성자와 별도로 비교합니다.
    fun isWrittenBy(email: String): Boolean = author == email
}
