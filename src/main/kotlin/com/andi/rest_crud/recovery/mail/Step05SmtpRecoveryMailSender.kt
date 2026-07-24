/*
 * 실습 순서 05 — SMTP 복구 메일 발송
 * 선행 단계: Step04가 token 저장 transaction을 commit하고 mail event를 발행합니다.
 * 이 단계의 판단: 발신자·수신자·reset link를 조립하고 SMTP 실패를 도메인 오류로 변환합니다.
 * 완료 상태: 외부 로그인과 LOCAL 계정 복구 흐름이 각각 검증 가능한 경계로 닫힙니다.
 */
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

                이 링크는 제한된 시간 동안 한 번만 사용할 수 있습니다.
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
