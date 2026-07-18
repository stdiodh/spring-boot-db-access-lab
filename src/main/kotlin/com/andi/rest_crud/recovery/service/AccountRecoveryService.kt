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
        val normalizedEmail = email.lowercase(Locale.ROOT)
        val user = userRepository.findByEmail(normalizedEmail).orElse(null) ?: return

        if (user.authProvider != LOCAL_PROVIDER) {
            return
        }

        try {
            recoveryMailSender.sendPasswordResetMail(user.email, createResetLink())
        } catch (_: RecoveryMailDeliveryException) {
            // 계정·token·link나 SMTP 예외를 로그에 넣지 않아 복구 요청 정보가 운영 로그에 남지 않게 합니다.
            log.warn("Password reset mail delivery failed.")
        }
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
