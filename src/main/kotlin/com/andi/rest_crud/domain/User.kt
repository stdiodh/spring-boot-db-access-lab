package com.andi.rest_crud.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    // TODO(Validation) email 최대 길이를 요청 DTO 계약과 맞추고 unique 제약은 유지하세요.
    @Column(nullable = false, unique = true)
    var email: String,

    // TODO(Validation) BCrypt 해시를 잘리지 않고 저장할 수 있는 컬럼 길이를 정하세요.
    @Column(nullable = false)
    var password: String
)
