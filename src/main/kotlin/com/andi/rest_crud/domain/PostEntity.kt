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
    @Column(nullable = false, length = 100)
    var title: String,
    // WHY: DTO의 5000자 계약과 같은 길이를 DB에도 적용해 H2와 MySQL 저장 결과를 일치시킨다.
    @Column(nullable = false, length = 5000)
    var content: String,
    @Column(nullable = false, length = 254)
    var author: String
) {
    fun update(title: String, content: String) {
        this.title = title
        this.content = content
    }

    fun isWrittenBy(email: String): Boolean = author == email
}
