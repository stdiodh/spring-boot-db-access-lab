package com.andi.rest_crud.recovery.mail

import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.MailException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Component

@Component
class SmtpRecoveryMailSender(
    private val javaMailSender: JavaMailSender,
    @Value("\${app.recovery-mail-from}") private val recoveryMailFrom: String
) : RecoveryMailSender {

    override fun sendPasswordResetMail(recipientEmail: String, resetLink: String) {
        val message = SimpleMailMessage().apply {
            from = recoveryMailFrom
            setTo(recipientEmail)
            subject = "[A&I] 비밀번호 재설정 안내"
            text = """
                비밀번호 재설정 요청을 받았습니다.

                $resetLink

                이 링크는 학습용 데모이며 실제 비밀번호 변경 기능과 연결되지 않습니다.
                요청하지 않았다면 이 메일을 무시하세요.
            """.trimIndent()
        }

        try {
            javaMailSender.send(message)
        } catch (exception: MailException) {
            throw RecoveryMailDeliveryException(exception)
        }
    }
}
