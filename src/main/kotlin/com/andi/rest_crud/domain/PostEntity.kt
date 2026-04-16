package com.andi.rest_crud.domain

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

// TODO(A&I) 1. 이 클래스가 DB 테이블과 연결된다는 점을 먼저 확인하세요.
// TODO(A&I) 2. @Entity, @Table(name = "posts")를 연결하세요.
// TODO(A&I) 3. id에는 @Id와 @GeneratedValue(strategy = GenerationType.IDENTITY)를 붙이세요.
// TODO(A&I) 4. 이번 시퀀스에서는 title, content, author 핵심 필드만 유지하세요.
@Entity
@Table(name = "posts")
class PostEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,
    var title: String,
    var content: String,
    var author: String
)
