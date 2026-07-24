/*
 * 복구 메일은 token 저장 transaction이 끝난 뒤 Controller에서 동기적으로 전달합니다.
 * dispatch가 정상 반환해야만 HTTP 200을 만들고, 예외는 삼키지 않고 공개 오류 계약으로 전달합니다.
 */
package com.andi.rest_crud.recovery.mail

import org.springframework.stereotype.Component

data class PasswordResetMailCommand(
    val tokenId: Long,
    val tokenHash: String,
    val recipientEmail: String,
    val resetLink: String
) {
    override fun toString(): String {
        return "PasswordResetMailCommand(" +
            "tokenId=[REDACTED], tokenHash=[REDACTED], " +
            "recipientEmail=[REDACTED], resetLink=[REDACTED])"
    }
}

@Component
class RecoveryMailDispatcher(
    private val recoveryMailSender: RecoveryMailSender
) {
    fun dispatch(command: PasswordResetMailCommand) {
        recoveryMailSender.sendPasswordResetMail(command.recipientEmail, command.resetLink)
    }
}
