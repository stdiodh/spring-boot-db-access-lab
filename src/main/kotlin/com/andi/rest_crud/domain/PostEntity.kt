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
