package com.andi.rest_crud.service

import com.andi.rest_crud.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import java.util.UUID

@Service
class AccountRecoveryService(
    private val userRepository: UserRepository,
    private val recoveryMailSender: RecoveryMailSender,
    @Value("\${app.password-reset-url}") private val passwordResetUrl: String
) {

    // TODO 1. email 기준으로 사용자를 찾으세요.
    // TODO 2. 비밀번호 재설정 링크에 사용할 임시 token을 만드세요.
    // TODO 3. reset 링크를 만들고 SMTP 발송 Service에 넘기세요.
    // TODO 4. 현재 시퀀스에서는 실제 비밀번호 변경까지 확장하지 않습니다.
    fun requestPasswordReset(email: String) {
        TODO("비밀번호 재설정 메일 요청 흐름을 완성하세요.")
    }

    fun createResetLink(email: String): String {
        val resetToken = UUID.randomUUID().toString()

        return UriComponentsBuilder.fromUriString(passwordResetUrl)
            .queryParam("recovery", "password-reset")
            .queryParam("email", email)
            .queryParam("token", resetToken)
            .build()
            .toUriString()
    }
}
