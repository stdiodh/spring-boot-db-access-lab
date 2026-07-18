package com.andi.rest_crud.recovery.service

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.read.ListAppender
import com.andi.rest_crud.recovery.mail.RecoveryMailDeliveryException
import com.andi.rest_crud.recovery.mail.RecoveryMailSender
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.slf4j.LoggerFactory
import org.springframework.mail.MailSendException
import org.springframework.web.util.UriComponentsBuilder
import java.util.Locale
import java.util.Optional
import java.util.UUID

class AccountRecoveryServiceTest {
    private val userRepository = mock(UserRepository::class.java)
    private val recoveryMailSender = RecordingRecoveryMailSender()
    private val service = AccountRecoveryService(
        userRepository,
        recoveryMailSender,
        "https://frontend.example/reset-password"
    )

    @Test
    fun `LOCAL 계정은 Locale ROOT email로 조회하고 token 전용 link를 발송한다`() {
        val originalLocale = Locale.getDefault()
        Locale.setDefault(Locale.forLanguageTag("tr-TR"))
        try {
            val user = localUser("iuser@example.com")
            `when`(userRepository.findByEmail("iuser@example.com")).thenReturn(Optional.of(user))

            service.requestPasswordReset("IUSER@EXAMPLE.COM")

            verify(userRepository).findByEmail("iuser@example.com")
            val delivery = recoveryMailSender.deliveries.single()
            assertEquals("iuser@example.com", delivery.recipientEmail)

            val resetLink = delivery.resetLink
            val queryParams = UriComponentsBuilder.fromUriString(resetLink).build().queryParams
            val token = queryParams.getFirst("token")
            assertNotNull(token)
            UUID.fromString(token)
            assertEquals(setOf("token"), queryParams.keys)
            assertFalse(queryParams.containsKey("email"))
            assertFalse(resetLink.contains("iuser@example.com"))
        } finally {
            Locale.setDefault(originalLocale)
        }
    }

    @Test
    fun `존재하지 않는 계정은 sender를 호출하지 않는다`() {
        `when`(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty())

        service.requestPasswordReset("MISSING@EXAMPLE.COM")

        verify(userRepository).findByEmail("missing@example.com")
        assertTrue(recoveryMailSender.deliveries.isEmpty())
    }

    @Test
    fun `OAuth 계정은 비밀번호 복구 mail을 보내지 않는다`() {
        val oauthUser = User(
            id = 1L,
            email = "oauth@example.com",
            password = "encoded-random-password",
            authProvider = "GOOGLE",
            providerId = "google-subject"
        )
        `when`(userRepository.findByEmail("oauth@example.com")).thenReturn(Optional.of(oauthUser))

        service.requestPasswordReset("OAUTH@EXAMPLE.COM")

        assertTrue(recoveryMailSender.deliveries.isEmpty())
    }

    @Test
    fun `delivery 실패는 삼키고 민감 정보 없는 고정 경고만 기록한다`() {
        val user = localUser("student@example.com")
        `when`(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(user))
        val sensitiveCause = MailSendException(
            "student@example.com sensitive-reset-token smtp.internal.example"
        )
        recoveryMailSender.failure = RecoveryMailDeliveryException(sensitiveCause)

        val logger = LoggerFactory.getLogger(AccountRecoveryService::class.java) as Logger
        val appender = ListAppender<ILoggingEvent>().apply { start() }
        logger.addAppender(appender)
        try {
            assertDoesNotThrow {
                service.requestPasswordReset("student@example.com")
            }
        } finally {
            logger.detachAppender(appender)
            appender.stop()
        }

        val warning = appender.list.single()
        assertEquals(Level.WARN, warning.level)
        assertEquals("Password reset mail delivery failed.", warning.formattedMessage)
        assertFalse(warning.formattedMessage.contains("student@example.com"))
        assertFalse(warning.formattedMessage.contains("sensitive-reset-token"))
        assertFalse(warning.formattedMessage.contains("smtp.internal.example"))
        assertTrue(warning.throwableProxy == null)
    }

    @Test
    fun `delivery 도메인 실패가 아닌 예외는 숨기지 않는다`() {
        val user = localUser("student@example.com")
        `when`(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(user))
        recoveryMailSender.failure = IllegalStateException("unexpected")

        assertThrows(IllegalStateException::class.java) {
            service.requestPasswordReset("student@example.com")
        }
    }

    private fun localUser(email: String): User {
        return User(
            id = 1L,
            email = email,
            password = "encoded-password",
            authProvider = "LOCAL"
        )
    }

    private class RecordingRecoveryMailSender : RecoveryMailSender {
        val deliveries = mutableListOf<Delivery>()
        var failure: RuntimeException? = null

        override fun sendPasswordResetMail(recipientEmail: String, resetLink: String) {
            failure?.let { throw it }
            deliveries += Delivery(recipientEmail, resetLink)
        }
    }

    private data class Delivery(
        val recipientEmail: String,
        val resetLink: String
    )
}
