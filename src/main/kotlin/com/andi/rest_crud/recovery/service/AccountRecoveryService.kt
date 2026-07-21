package com.andi.rest_crud.recovery.service

import com.andi.rest_crud.recovery.domain.PasswordResetToken
import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.exception.InvalidPasswordResetTokenException
import com.andi.rest_crud.recovery.mail.PasswordResetMailRequestedEvent
import com.andi.rest_crud.recovery.repository.PasswordResetTokenRepository
import com.andi.rest_crud.recovery.security.PasswordResetTokenCodec
import com.andi.rest_crud.user.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.util.UriComponentsBuilder
import java.time.Clock
import java.time.Duration
import java.util.Locale

@Service
@Transactional(readOnly = true)
class AccountRecoveryService(
    private val userRepository: UserRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenCodec: PasswordResetTokenCodec,
    private val eventPublisher: ApplicationEventPublisher,
    private val clock: Clock,
    @Value("\${app.password-reset-url}") private val passwordResetUrl: String,
    @Value("\${app.password-reset-token-ttl}") private val tokenTtl: Duration,
    @Value("\${app.password-reset-resend-cooldown}") private val resendCooldown: Duration
) {

    init {
        require(!tokenTtl.isNegative && !tokenTtl.isZero) {
            "app.password-reset-token-ttl은 0보다 커야 합니다."
        }
        require(!resendCooldown.isNegative) {
            "app.password-reset-resend-cooldown은 음수일 수 없습니다."
        }
    }

    @Transactional
    fun requestPasswordReset(email: String) {
        // TODO: LOCAL 사용자 lock, cooldown, hash 저장과 AFTER_COMMIT mail event 발행을 구현하세요.
        TODO("비밀번호 재설정 token 발급을 완성하세요.")
    }

    @Transactional
    fun confirmPasswordReset(request: PasswordResetConfirmRequest) {
        // TODO: token hash와 사용자 lock으로 만료·단일 사용을 확인하고 password 변경을 같은 transaction에 묶으세요.
        TODO("비밀번호 재설정 확정을 완성하세요.")
    }

    private fun createResetLink(rawToken: String): String {
        return UriComponentsBuilder.fromUriString(passwordResetUrl)
            .fragment("reset_token=$rawToken")
            .build()
            .encode()
            .toUriString()
    }

    private companion object {
        const val LOCAL_PROVIDER = "LOCAL"
    }
}
