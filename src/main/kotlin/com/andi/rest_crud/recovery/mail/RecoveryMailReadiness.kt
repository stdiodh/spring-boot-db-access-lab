package com.andi.rest_crud.recovery.mail

import com.andi.rest_crud.recovery.exception.RecoveryMailAuthenticationException
import com.andi.rest_crud.recovery.exception.RecoveryMailUnavailableException
import jakarta.mail.AuthenticationFailedException
import jakarta.mail.MessagingException
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.stereotype.Component

interface RecoveryMailReadiness {
    fun ensureReady()
}

@Component
class SmtpRecoveryMailReadiness(
    private val mailSender: JavaMailSenderImpl
) : RecoveryMailReadiness {

    override fun ensureReady() {
        if (authenticationRequired() && (mailSender.username.isNullOrBlank() || mailSender.password.isNullOrBlank())) {
            throw RecoveryMailAuthenticationException()
        }

        try {
            // 계정 조회 전에 연결·인증만 확인하며 recipient나 reset token은 SMTP에 보내지 않습니다.
            mailSender.testConnection()
        } catch (_: AuthenticationFailedException) {
            throw RecoveryMailAuthenticationException()
        } catch (_: MessagingException) {
            throw RecoveryMailUnavailableException()
        }
    }

    private fun authenticationRequired(): Boolean {
        return mailSender.javaMailProperties["mail.smtp.auth"]
            ?.toString()
            ?.toBooleanStrictOrNull()
            ?: false
    }
}
