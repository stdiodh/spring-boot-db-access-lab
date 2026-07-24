package com.andi.rest_crud.recovery.service

import com.andi.rest_crud.recovery.domain.PasswordResetToken
import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.exception.InvalidPasswordResetTokenException
import com.andi.rest_crud.recovery.exception.RecoveryMailCooldownException
import com.andi.rest_crud.recovery.exception.RecoveryMailNotSentException
import com.andi.rest_crud.recovery.repository.PasswordResetTokenRepository
import com.andi.rest_crud.recovery.security.PasswordResetTokenCodec
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.`when`
import org.mockito.Mockito.any
import org.mockito.Mockito.inOrder
import org.mockito.Mockito.mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.ZoneOffset
import java.util.Locale
import java.util.Optional

class AccountRecoveryServiceTest {
    private val userRepository = mock(UserRepository::class.java)
    private val tokenRepository = mock(PasswordResetTokenRepository::class.java)
    private val passwordEncoder = mock(PasswordEncoder::class.java)
    private val tokenCodec = PasswordResetTokenCodec()
    private val service = AccountRecoveryService(
        userRepository = userRepository,
        passwordResetTokenRepository = tokenRepository,
        passwordEncoder = passwordEncoder,
        tokenCodec = tokenCodec,
        clock = Clock.fixed(NOW, ZoneOffset.UTC),
        passwordResetUrl = "https://frontend.example/reset-password",
        tokenTtl = Duration.ofMinutes(15),
        resendCooldown = Duration.ofMinutes(1)
    )

    @Test
    fun `LOCAL 요청은 사용자와 token 순서로 잠그고 hash만 저장한 fragment link command를 반환한다`() {
        val originalLocale = Locale.getDefault()
        Locale.setDefault(Locale.forLanguageTag("tr-TR"))
        try {
            val user = localUser("iuser@example.com")
            `when`(userRepository.findByEmailForUpdate("iuser@example.com")).thenReturn(Optional.of(user))
            `when`(tokenRepository.findByUserIdForUpdate(user.id)).thenReturn(Optional.empty())
            `when`(tokenRepository.saveAndFlush(any(PasswordResetToken::class.java)))
                .thenAnswer { it.getArgument<PasswordResetToken>(0) }

            val command = service.requestPasswordReset("IUSER@EXAMPLE.COM")

            val order = inOrder(userRepository, tokenRepository)
            order.verify(userRepository).findByEmailForUpdate("iuser@example.com")
            order.verify(tokenRepository).findByUserIdForUpdate(user.id)

            val tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken::class.java)
            verify(tokenRepository).saveAndFlush(tokenCaptor.capture())

            val rawToken = command.resetLink.substringAfter("#reset_token=")
            assertEquals("iuser@example.com", command.recipientEmail)
            assertEquals(43, rawToken.length)
            assertTrue(command.resetLink.endsWith("#reset_token=$rawToken"))
            assertFalse(command.resetLink.contains("?"))
            assertFalse(command.resetLink.contains("iuser@example.com"))
            assertEquals(tokenCodec.hash(rawToken), tokenCaptor.value.tokenHash)
            assertEquals(tokenCaptor.value.id, command.tokenId)
            assertEquals(tokenCaptor.value.tokenHash, command.tokenHash)
            assertFalse(tokenCaptor.value.tokenHash.contains(rawToken))
            assertEquals(NOW, tokenCaptor.value.createdAt)
            assertEquals(NOW.plus(Duration.ofMinutes(15)), tokenCaptor.value.expiresAt)
            assertNull(tokenCaptor.value.usedAt)
        } finally {
            Locale.setDefault(originalLocale)
        }
    }

    @Test
    fun `최근 active token은 cooldown 동안 429 판단을 반환하고 회전하지 않는다`() {
        val user = localUser("student@example.com")
        val token = resetToken(user, createdAt = NOW.minusSeconds(30), expiresAt = NOW.plusSeconds(600))
        `when`(userRepository.findByEmailForUpdate(user.email)).thenReturn(Optional.of(user))
        `when`(tokenRepository.findByUserIdForUpdate(user.id)).thenReturn(Optional.of(token))

        val exception = assertThrows(RecoveryMailCooldownException::class.java) {
            service.requestPasswordReset(user.email)
        }

        assertEquals(30, exception.retryAfterSeconds)
        verify(tokenRepository, never()).saveAndFlush(any(PasswordResetToken::class.java))
        assertEquals("a".repeat(64), token.tokenHash)
    }

    @Test
    fun `cooldown 경계에서는 기존 token을 회전하고 사용 상태를 초기화한다`() {
        val user = localUser("student@example.com")
        val token = resetToken(
            user,
            createdAt = NOW.minusSeconds(60),
            expiresAt = NOW.plusSeconds(600)
        )
        `when`(userRepository.findByEmailForUpdate(user.email)).thenReturn(Optional.of(user))
        `when`(tokenRepository.findByUserIdForUpdate(user.id)).thenReturn(Optional.of(token))
        `when`(tokenRepository.saveAndFlush(any(PasswordResetToken::class.java)))
            .thenAnswer { it.getArgument<PasswordResetToken>(0) }

        val command = service.requestPasswordReset(user.email)

        verify(tokenRepository).saveAndFlush(token)
        assertEquals(token.tokenHash, command.tokenHash)
        assertFalse(token.tokenHash == "a".repeat(64))
        assertEquals(NOW, token.createdAt)
        assertEquals(NOW.plusSeconds(900), token.expiresAt)
        assertNull(token.usedAt)
    }

    @Test
    fun `이미 사용한 token은 cooldown을 막지 않고 새 active token으로 회전한다`() {
        val user = localUser("student@example.com")
        val token = resetToken(
            user,
            createdAt = NOW.minusSeconds(30),
            expiresAt = NOW.plusSeconds(600),
            usedAt = NOW.minusSeconds(10)
        )
        `when`(userRepository.findByEmailForUpdate(user.email)).thenReturn(Optional.of(user))
        `when`(tokenRepository.findByUserIdForUpdate(user.id)).thenReturn(Optional.of(token))
        `when`(tokenRepository.saveAndFlush(any(PasswordResetToken::class.java)))
            .thenAnswer { it.getArgument<PasswordResetToken>(0) }

        val command = service.requestPasswordReset(user.email)

        verify(tokenRepository).saveAndFlush(token)
        assertEquals(token.tokenHash, command.tokenHash)
        assertNull(token.usedAt)
        assertEquals(NOW, token.createdAt)
    }

    @Test
    fun `없는 계정과 OAuth 계정은 같은 미발송 오류로 끝나고 token을 만들지 않는다`() {
        `when`(userRepository.findByEmailForUpdate("missing@example.com")).thenReturn(Optional.empty())
        val oauthUser = User(
            id = 2L,
            email = "oauth@example.com",
            password = "encoded-random-password",
            authProvider = "GOOGLE",
            providerId = "google-subject"
        )
        `when`(userRepository.findByEmailForUpdate(oauthUser.email)).thenReturn(Optional.of(oauthUser))

        val missing = assertThrows(RecoveryMailNotSentException::class.java) {
            service.requestPasswordReset("MISSING@EXAMPLE.COM")
        }
        val oauth = assertThrows(RecoveryMailNotSentException::class.java) {
            service.requestPasswordReset(oauthUser.email)
        }

        assertEquals(missing.message, oauth.message)
        verifyNoInteractions(tokenRepository, passwordEncoder)
    }

    @Test
    fun `발송 실패 정리는 id와 hash가 모두 맞는 미사용 token만 repository에 위임한다`() {
        `when`(tokenRepository.deleteUnusedByIdAndTokenHash(7L, "a".repeat(64))).thenReturn(1)

        val deleted = service.discardUndeliveredToken(7L, "a".repeat(64))

        assertTrue(deleted)
        verify(tokenRepository).deleteUnusedByIdAndTokenHash(7L, "a".repeat(64))
    }

    @Test
    fun `유효한 token은 사용자와 token 순서로 잠근 뒤 password 원문을 encode하고 사용 처리한다`() {
        val rawPassword = "  new-password123  "
        val rawToken = tokenCodec.generateRawToken()
        val hash = tokenCodec.hash(rawToken)
        val user = localUser("student@example.com")
        val token = resetToken(user, tokenHash = hash, expiresAt = NOW.plusSeconds(1))
        `when`(tokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(token))
        `when`(userRepository.findByIdForUpdate(user.id)).thenReturn(Optional.of(user))
        `when`(tokenRepository.findActiveByTokenHashForUpdate(hash, NOW)).thenReturn(Optional.of(token))
        `when`(passwordEncoder.encode(rawPassword)).thenReturn("encoded-new-password")
        `when`(tokenRepository.save(token)).thenReturn(token)
        `when`(userRepository.saveAndFlush(user)).thenReturn(user)

        service.confirmPasswordReset(PasswordResetConfirmRequest(rawToken, rawPassword))

        val order = inOrder(userRepository, tokenRepository)
        order.verify(userRepository).findByIdForUpdate(user.id)
        order.verify(tokenRepository).findActiveByTokenHashForUpdate(hash, NOW)
        verify(passwordEncoder).encode(rawPassword)
        assertEquals("encoded-new-password", user.password)
        assertEquals(NOW, token.usedAt)
        verify(tokenRepository).save(token)
        verify(userRepository).saveAndFlush(user)
    }

    @Test
    fun `만료 시각과 같은 token과 이미 사용한 token은 같은 오류로 거부한다`() {
        val expiredRawToken = tokenCodec.generateRawToken()
        val usedRawToken = tokenCodec.generateRawToken()
        listOf(
            expiredRawToken to resetToken(
                localUser("expired@example.com"),
                tokenHash = tokenCodec.hash(expiredRawToken),
                expiresAt = NOW
            ),
            usedRawToken to resetToken(
                localUser("used@example.com", id = 2L),
                tokenHash = tokenCodec.hash(usedRawToken),
                expiresAt = NOW.plusSeconds(60),
                usedAt = NOW.minusSeconds(1)
            )
        ).forEach { (rawToken, token) ->
            `when`(tokenRepository.findByTokenHash(token.tokenHash)).thenReturn(Optional.of(token))
            `when`(userRepository.findByIdForUpdate(token.user.id)).thenReturn(Optional.of(token.user))
            `when`(tokenRepository.findActiveByTokenHashForUpdate(token.tokenHash, NOW))
                .thenReturn(Optional.of(token))

            val exception = assertThrows(InvalidPasswordResetTokenException::class.java) {
                service.confirmPasswordReset(PasswordResetConfirmRequest(rawToken, "new-password123"))
            }

            assertEquals("비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.", exception.message)
        }
        verifyNoInteractions(passwordEncoder)
    }

    @Test
    fun `회전되었거나 알 수 없는 token은 같은 오류로 거부한다`() {
        val rawToken = tokenCodec.generateRawToken()
        val hash = tokenCodec.hash(rawToken)
        val user = localUser("student@example.com")
        val staleToken = resetToken(user, tokenHash = hash, expiresAt = NOW.plusSeconds(60))
        `when`(tokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(staleToken))
        `when`(userRepository.findByIdForUpdate(user.id)).thenReturn(Optional.of(user))
        `when`(tokenRepository.findActiveByTokenHashForUpdate(hash, NOW)).thenReturn(Optional.empty())

        val rotated = assertThrows(InvalidPasswordResetTokenException::class.java) {
            service.confirmPasswordReset(PasswordResetConfirmRequest(rawToken, "new-password123"))
        }
        val unknown = assertThrows(InvalidPasswordResetTokenException::class.java) {
            service.confirmPasswordReset(PasswordResetConfirmRequest("unknown-token", "new-password123"))
        }

        assertEquals(rotated.message, unknown.message)
        verifyNoInteractions(passwordEncoder)
    }

    private fun localUser(email: String, id: Long = 1L): User {
        return User(
            id = id,
            email = email,
            password = "encoded-password",
            authProvider = "LOCAL"
        )
    }

    private fun resetToken(
        user: User,
        tokenHash: String = "a".repeat(64),
        createdAt: Instant = NOW,
        expiresAt: Instant,
        usedAt: Instant? = null
    ): PasswordResetToken {
        return PasswordResetToken(
            id = 1L,
            user = user,
            tokenHash = tokenHash,
            createdAt = createdAt,
            expiresAt = expiresAt,
            usedAt = usedAt
        )
    }

    private companion object {
        val NOW: Instant = Instant.parse("2026-07-20T00:00:00Z")
    }
}
