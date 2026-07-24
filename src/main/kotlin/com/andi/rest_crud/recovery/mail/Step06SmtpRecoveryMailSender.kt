/*
 * 실습 순서 06 — SMTP 복구 메일 발송
 * 선행 단계: Step05의 token 저장 transaction이 끝난 뒤 mail command가 전달됩니다.
 * 이 단계의 판단: Gmail 발신자와 인증 계정을 정렬하고, 실제 send()의 인증·일반 전송 실패를 구분합니다.
 * 완료 상태: 성공은 SMTP 서버의 요청 수락을 뜻하며 받은 편지함 도착까지 보장하지는 않습니다.
 */
package com.andi.rest_crud.recovery.mail

import com.andi.rest_crud.recovery.exception.RecoveryMailAuthenticationException
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.MailAuthenticationException
import org.springframework.mail.MailException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Component

@Component
class SmtpRecoveryMailSender(
    private val javaMailSender: JavaMailSender,
    @Value("\${app.recovery-mail-from}") private val recoveryMailFrom: String,
    @Value("\${spring.mail.host}") private val smtpHost: String,
    @Value("\${spring.mail.username}") private val smtpUsername: String
) : RecoveryMailSender {

    init {
        if (smtpHost.equals(GMAIL_SMTP_HOST, ignoreCase = true)) {
            check(smtpUsername.isNotBlank() && recoveryMailFrom == smtpUsername) {
                "Gmail SMTP 설정 오류: APP_RECOVERY_MAIL_FROM과 " +
                    "SPRING_MAIL_USERNAME은 정확히 일치해야 합니다."
            }
        }
    }

    override fun sendPasswordResetMail(recipientEmail: String, resetLink: String) {
        val message = SimpleMailMessage().apply {
            from = recoveryMailFrom
            setTo(recipientEmail)
            subject = "[A&I] 비밀번호 재설정 안내"
            text = """
                비밀번호 재설정 요청을 받았습니다.

                $resetLink

                이 링크는 제한된 시간 동안 한 번만 사용할 수 있습니다.
                요청하지 않았다면 이 메일을 무시하세요.
            """.trimIndent()
        }

        try {
            // 이 호출이 정상 반환된 시점까지만 HTTP 200의 근거로 사용합니다.
            javaMailSender.send(message)
        } catch (exception: MailAuthenticationException) {
            throw RecoveryMailAuthenticationException(exception)
        } catch (exception: MailException) {
            throw RecoveryMailDeliveryException(exception)
        }
    }

    private companion object {
        const val GMAIL_SMTP_HOST = "smtp.gmail.com"
    }
}
