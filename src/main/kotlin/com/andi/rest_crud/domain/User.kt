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

    // DTO가 허용한 email을 DB가 그대로 저장하고, 최종 중복 방지는 unique 제약이 맡도록 계약을 맞춥니다.
    @Column(nullable = false, unique = true, length = 254)
    var email: String,

    // BCrypt 문자열은 원문보다 길어지므로 해시가 잘리면 정상 비밀번호도 다시 검증할 수 없습니다.
    @Column(nullable = false, length = 100)
    var password: String
)
