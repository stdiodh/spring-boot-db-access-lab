package com.andi.rest_crud.recovery.mail

import org.springframework.mail.MailException

interface RecoveryMailSender {
    fun sendPasswordResetMail(recipientEmail: String, resetLink: String)
}

class RecoveryMailDeliveryException(cause: MailException) :
    RuntimeException("비밀번호 재설정 메일을 전송하지 못했습니다.", cause)
