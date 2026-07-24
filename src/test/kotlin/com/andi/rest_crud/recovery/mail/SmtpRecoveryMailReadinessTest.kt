package com.andi.rest_crud.recovery.mail

import com.andi.rest_crud.recovery.exception.RecoveryMailAuthenticationException
import com.andi.rest_crud.recovery.exception.RecoveryMailUnavailableException
import jakarta.mail.AuthenticationFailedException
import jakarta.mail.MessagingException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.mail.javamail.JavaMailSenderImpl
import java.util.Properties

class SmtpRecoveryMailReadinessTest {

    @Test
    fun `SMTP 인증이 필요한데 계정이나 비밀번호가 없으면 연결하지 않고 인증 오류를 반환한다`() {
        val mailSender = TestMailSender(authenticationRequired = true, username = "student@gmail.com")
        val readiness = SmtpRecoveryMailReadiness(mailSender)

        val exception = assertThrows(RecoveryMailAuthenticationException::class.java) {
            readiness.ensureReady()
        }

        assertEquals(0, mailSender.connectionAttempts)
        assertEquals("Gmail 앱 비밀번호가 올바르지 않거나 사용할 수 없습니다.", exception.message)
    }

    @Test
    fun `SMTP 인증 실패 원문은 공개 예외 message에 포함하지 않는다`() {
        val mailSender = TestMailSender(
            authenticationRequired = true,
            username = "student@gmail.com",
            password = "sensitive-app-password",
            failure = AuthenticationFailedException("535 sensitive provider response")
        )
        val readiness = SmtpRecoveryMailReadiness(mailSender)

        val exception = assertThrows(RecoveryMailAuthenticationException::class.java) {
            readiness.ensureReady()
        }

        assertEquals(1, mailSender.connectionAttempts)
        assertFalse(exception.message.orEmpty().contains("535"))
        assertFalse(exception.message.orEmpty().contains("sensitive"))
    }

    @Test
    fun `SMTP 연결 실패 원문은 안전한 unavailable 오류로 바꾼다`() {
        val mailSender = TestMailSender(
            authenticationRequired = false,
            failure = MessagingException("smtp.internal.example:2525 refused")
        )
        val readiness = SmtpRecoveryMailReadiness(mailSender)

        val exception = assertThrows(RecoveryMailUnavailableException::class.java) {
            readiness.ensureReady()
        }

        assertEquals(1, mailSender.connectionAttempts)
        assertEquals("메일 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.", exception.message)
        assertFalse(exception.message.orEmpty().contains("smtp.internal.example"))
    }

    @Test
    fun `인증 설정과 연결이 정상이면 복구 요청을 계속 진행한다`() {
        val mailSender = TestMailSender(
            authenticationRequired = true,
            username = "student@gmail.com",
            password = "valid-app-password"
        )
        val readiness = SmtpRecoveryMailReadiness(mailSender)

        readiness.ensureReady()

        assertEquals(1, mailSender.connectionAttempts)
    }

    private class TestMailSender(
        authenticationRequired: Boolean,
        username: String? = null,
        password: String? = null,
        private val failure: MessagingException? = null
    ) : JavaMailSenderImpl() {
        var connectionAttempts: Int = 0
            private set

        init {
            javaMailProperties = Properties().apply {
                setProperty("mail.smtp.auth", authenticationRequired.toString())
            }
            this.username = username
            this.password = password
        }

        override fun testConnection() {
            connectionAttempts += 1
            failure?.let { throw it }
        }
    }
}
