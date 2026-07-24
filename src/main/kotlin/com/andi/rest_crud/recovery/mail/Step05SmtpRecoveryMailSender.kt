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
        // TODO: 발신자·수신자·일회용 link를 담은 message를 만들고 MailException을 도메인 예외로 변환하세요.
        TODO("SMTP 복구 메일 발송을 완성하세요.")
    }
}
