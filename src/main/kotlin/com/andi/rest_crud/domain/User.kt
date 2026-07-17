package com.andi.rest_crud.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
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

    // WHY: request DTO의 최대 길이와 DB 제약을 맞추고 DB unique를 최종 중복 방어선으로 유지한다.
    @Column(nullable = false, unique = true, length = 254)
    var email: String,

    // WHY: 원문이 아니라 BCrypt hash를 저장하므로 hash가 잘리지 않을 길이를 확보한다.
    @Column(nullable = false, length = 100)
    var password: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'LOCAL'")
    var authProvider: AuthProvider = AuthProvider.LOCAL,

    @Column
    var providerId: String? = null
)
