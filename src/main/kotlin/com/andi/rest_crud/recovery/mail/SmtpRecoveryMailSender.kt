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
        // TODO: 설정한 발신자와 데모 안내를 구성하고 MailException을 delivery 예외로 변환하세요.
        TODO("비밀번호 재설정 SMTP 발송을 완성하세요.")
    }
}
