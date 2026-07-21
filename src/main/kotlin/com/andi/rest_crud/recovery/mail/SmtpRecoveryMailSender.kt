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
        // TODO: 발신자·수신자·일회용 link를 담은 message를 만들고 MailException을 도메인 예외로 변환하세요.
        TODO("SMTP 복구 메일 발송을 완성하세요.")
    }
}
