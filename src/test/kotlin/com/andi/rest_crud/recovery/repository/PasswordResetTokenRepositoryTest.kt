package com.andi.rest_crud.recovery.repository

import com.andi.rest_crud.recovery.domain.PasswordResetToken
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@SpringBootTest
@Transactional
class PasswordResetTokenRepositoryTest @Autowired constructor(
    private val userRepository: UserRepository,
    private val tokenRepository: PasswordResetTokenRepository
) {

    @BeforeEach
    fun setUp() {
        // 여러 Spring test context가 같은 H2 이름을 사용할 수 있어 delete를 즉시 실행합니다.
        tokenRepository.deleteAllInBatch()
        userRepository.deleteAllInBatch()
    }

    @Test
    fun `hash와 user 잠금 조회는 같은 token row를 반환한다`() {
        val user = userRepository.saveAndFlush(localUser("student@example.com"))
        val token = tokenRepository.saveAndFlush(resetToken(user, "a".repeat(64)))

        assertEquals(token.id, tokenRepository.findByTokenHash(token.tokenHash).orElseThrow().id)
        assertEquals(token.id, tokenRepository.findByUserIdForUpdate(user.id).orElseThrow().id)
        assertEquals(
            token.id,
            tokenRepository.findActiveByTokenHashForUpdate(token.tokenHash, token.createdAt).orElseThrow().id
        )
        assertEquals(user.id, userRepository.findByIdForUpdate(user.id).orElseThrow().id)
    }

    @Test
    fun `한 사용자에는 password reset token row가 하나만 존재한다`() {
        val user = userRepository.saveAndFlush(localUser("student@example.com"))
        tokenRepository.saveAndFlush(resetToken(user, "a".repeat(64)))

        assertThrows(DataIntegrityViolationException::class.java) {
            tokenRepository.saveAndFlush(resetToken(user, "b".repeat(64)))
        }
    }

    @Test
    fun `정확히 만료됐거나 이미 사용한 token은 active lock 조회에서 제외한다`() {
        val now = Instant.parse("2026-07-20T00:15:00Z")
        val expiredUser = userRepository.saveAndFlush(localUser("expired@example.com"))
        val expiredToken = tokenRepository.saveAndFlush(
            resetToken(expiredUser, "c".repeat(64), expiresAt = now)
        )
        val usedUser = userRepository.saveAndFlush(localUser("used@example.com"))
        val usedToken = tokenRepository.saveAndFlush(
            resetToken(usedUser, "d".repeat(64), expiresAt = now.plusSeconds(1)).apply {
                markUsed(now.minusSeconds(1))
            }
        )

        assertTrue(tokenRepository.findActiveByTokenHashForUpdate(expiredToken.tokenHash, now).isEmpty)
        assertTrue(tokenRepository.findActiveByTokenHashForUpdate(usedToken.tokenHash, now).isEmpty)
    }

    @Test
    fun `발송 실패 정리는 id와 현재 hash가 같은 미사용 token만 삭제한다`() {
        val user = userRepository.saveAndFlush(localUser("student@example.com"))
        val token = tokenRepository.saveAndFlush(resetToken(user, "a".repeat(64)))

        assertEquals(
            0,
            tokenRepository.deleteUnusedByIdAndTokenHash(token.id, "b".repeat(64))
        )
        assertEquals(1, tokenRepository.count())
        assertEquals(
            1,
            tokenRepository.deleteUnusedByIdAndTokenHash(token.id, token.tokenHash)
        )
        assertEquals(0, tokenRepository.count())
    }

    @Test
    fun `더 최신 hash로 회전됐거나 이미 사용된 token은 이전 발송 실패가 삭제하지 않는다`() {
        val rotatedUser = userRepository.saveAndFlush(localUser("rotated@example.com"))
        val rotatedToken = tokenRepository.saveAndFlush(resetToken(rotatedUser, "a".repeat(64)))
        rotatedToken.rotate(
            "b".repeat(64),
            rotatedToken.createdAt.plusSeconds(60),
            rotatedToken.expiresAt.plusSeconds(60)
        )
        tokenRepository.saveAndFlush(rotatedToken)

        assertEquals(
            0,
            tokenRepository.deleteUnusedByIdAndTokenHash(rotatedToken.id, "a".repeat(64))
        )

        val usedUser = userRepository.saveAndFlush(localUser("used-cleanup@example.com"))
        val usedToken = tokenRepository.saveAndFlush(resetToken(usedUser, "c".repeat(64)).apply {
            markUsed(createdAt.plusSeconds(1))
        })

        assertEquals(
            0,
            tokenRepository.deleteUnusedByIdAndTokenHash(usedToken.id, usedToken.tokenHash)
        )
        assertEquals(2, tokenRepository.count())
    }

    private fun localUser(email: String): User {
        return User(email = email, password = "encoded-password")
    }

    private fun resetToken(
        user: User,
        tokenHash: String,
        expiresAt: Instant = Instant.parse("2026-07-20T00:15:00Z")
    ): PasswordResetToken {
        val issuedAt = Instant.parse("2026-07-20T00:00:00Z")
        return PasswordResetToken(
            user = user,
            tokenHash = tokenHash,
            createdAt = issuedAt,
            expiresAt = expiresAt
        )
    }
}
