package com.andi.rest_crud.recovery.service

import com.andi.rest_crud.recovery.mail.RecoveryMailDeliveryException
import com.andi.rest_crud.recovery.mail.RecoveryMailSender
import com.andi.rest_crud.user.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.util.UriComponentsBuilder
import java.util.Locale
import java.util.UUID

@Service
@Transactional(readOnly = true)
class AccountRecoveryService(
    private val userRepository: UserRepository,
    private val recoveryMailSender: RecoveryMailSender,
    @Value("\${app.password-reset-url}") private val passwordResetUrl: String
) {

    fun requestPasswordReset(email: String) {
        // TODO: Locale.ROOT 조회, LOCAL 전용 발송과 민감 정보 없는 delivery 실패 처리를 구현하세요.
        TODO("비밀번호 재설정 요청 처리를 완성하세요.")
    }

    private fun createResetLink(): String {
        // 이 token은 흐름 확인용 불투명 데모 값이며 저장·검증되지 않아 실제 비밀번호를 변경할 수 없습니다.
        return UriComponentsBuilder.fromUriString(passwordResetUrl)
            .queryParam("token", UUID.randomUUID().toString())
            .build()
            .encode()
            .toUriString()
    }

    private companion object {
        const val LOCAL_PROVIDER = "LOCAL"
        val log = LoggerFactory.getLogger(AccountRecoveryService::class.java)
    }
}
