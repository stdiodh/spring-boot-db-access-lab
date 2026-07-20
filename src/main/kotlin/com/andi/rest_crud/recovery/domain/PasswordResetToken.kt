package com.andi.rest_crud.recovery.domain

import com.andi.rest_crud.user.domain.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.Instant

@Entity
@Table(
    name = "password_reset_tokens",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_password_reset_tokens_user", columnNames = ["user_id"]),
        UniqueConstraint(name = "uk_password_reset_tokens_hash", columnNames = ["token_hash"])
    ]
)
class PasswordResetToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(name = "token_hash", nullable = false, length = 64)
    var tokenHash: String,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant,

    @Column(name = "expires_at", nullable = false)
    var expiresAt: Instant,

    @Column(name = "used_at")
    var usedAt: Instant? = null
) {
    fun rotate(newTokenHash: String, issuedAt: Instant, expiresAt: Instant) {
        tokenHash = newTokenHash
        createdAt = issuedAt
        this.expiresAt = expiresAt
        usedAt = null
    }

    fun isRecentlyIssuedAndActive(now: Instant, cooldownEndsAt: Instant): Boolean {
        return usedAt == null && expiresAt.isAfter(now) && now.isBefore(cooldownEndsAt)
    }

    fun markUsed(usedAt: Instant) {
        this.usedAt = usedAt
    }
}
