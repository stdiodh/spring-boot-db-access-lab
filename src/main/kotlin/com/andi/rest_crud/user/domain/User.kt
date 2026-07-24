package com.andi.rest_crud.user.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

@Entity
@Table(
    name = "users",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_users_email", columnNames = ["email"]),
        UniqueConstraint(
            name = "uk_users_auth_provider_provider_id",
            columnNames = ["auth_provider", "provider_id"]
        )
    ]
)
class User(
    // IDENTITY 전략은 식별자 생성을 DB에 맡기므로 새 객체의 0L은 저장 뒤 DB가 만든 id로 바뀝니다.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    // 요청을 통과한 email이 잘리지 않도록 DTO와 같은 길이를 사용하고, 중복 가입 경쟁은 unique로 막습니다.
    @Column(nullable = false, length = 254)
    var email: String,

    // 원문 입력 길이와 별개로 BCrypt 결과가 잘리지 않는 저장 길이를 사용합니다.
    @Column(nullable = false, length = 100)
    var password: String,

    // provider는 대문자, providerId는 앞뒤 공백을 제거한 외부 식별자로 저장합니다.
    @Column(name = "auth_provider", nullable = false, length = 32)
    var authProvider: String = "LOCAL",

    @Column(name = "provider_id", length = 255)
    var providerId: String? = null,

    // 외부 provider identity와 사용자가 직접 설정한 LOCAL 비밀번호 사용 가능 여부는 별도 상태입니다.
    @Column(name = "local_password_enabled", nullable = false)
    var localPasswordEnabled: Boolean = authProvider == "LOCAL"
)
