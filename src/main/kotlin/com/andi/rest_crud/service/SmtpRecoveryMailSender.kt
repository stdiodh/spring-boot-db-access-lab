package com.andi.rest_crud.service

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.stereotype.Component

@Component
class SmtpRecoveryMailSender(
    private val mailSender: JavaMailSender
) : RecoveryMailSender {

    // TODO 1. JavaMailSender로 메일 메시지를 만드세요.
    // TODO 2. 제목과 본문에 resetLink를 넣으세요.
    // TODO 3. send(...)를 호출해 SMTP 발송 흐름을 완성하세요.
    override fun sendPasswordResetMail(email: String, resetLink: String) {
        TODO("SMTP 메일 발송 흐름을 완성하세요.")
    }
}
