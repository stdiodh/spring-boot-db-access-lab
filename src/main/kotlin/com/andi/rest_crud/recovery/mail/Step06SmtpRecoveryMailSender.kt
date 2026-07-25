/*
 * 실습 순서 06 — SMTP 복구 메일 발송
 * 선행 단계: Step05의 token 저장 transaction이 끝난 뒤 mail command가 전달됩니다.
 * 이 단계의 판단: Gmail 인증 계정을 발신자로 사용하고, 실제 send()의 인증·일반 전송 실패를 구분합니다.
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
            check(smtpUsername.isNotBlank()) {
                "Gmail SMTP 설정 오류: SPRING_MAIL_USERNAME이 필요합니다."
            }
        }
    }

    override fun sendPasswordResetMail(recipientEmail: String, resetLink: String) {
        TODO("Step 06: SMTP 메시지 조립과 동기 발송을 구현하세요.")
    }

    private companion object {
        const val GMAIL_SMTP_HOST = "smtp.gmail.com"
    }
}
