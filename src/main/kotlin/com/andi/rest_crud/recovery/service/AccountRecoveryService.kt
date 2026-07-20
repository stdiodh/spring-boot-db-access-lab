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
        val normalizedEmail = email.lowercase(Locale.ROOT)
        val user = userRepository.findByEmailForUpdate(normalizedEmail).orElse(null) ?: return

        if (user.authProvider != LOCAL_PROVIDER) {
            return
        }

        val now = clock.instant()
        val existingToken = passwordResetTokenRepository.findByUserIdForUpdate(user.id).orElse(null)
        if (
            existingToken != null &&
            existingToken.isRecentlyIssuedAndActive(now, existingToken.createdAt.plus(resendCooldown))
        ) {
            return
        }

        val rawToken = tokenCodec.generateRawToken()
        val tokenHash = tokenCodec.hash(rawToken)
        val expiresAt = now.plus(tokenTtl)
        val token = existingToken?.apply {
            rotate(tokenHash, now, expiresAt)
        } ?: PasswordResetToken(
            user = user,
            tokenHash = tokenHash,
            createdAt = now,
            expiresAt = expiresAt
        )

        passwordResetTokenRepository.saveAndFlush(token)
        eventPublisher.publishEvent(
            PasswordResetMailRequestedEvent(
                recipientEmail = user.email,
                resetLink = createResetLink(rawToken)
            )
        )
    }

    @Transactional
    fun confirmPasswordReset(request: PasswordResetConfirmRequest) {
        val now = clock.instant()
        val tokenHash = tokenCodec.hash(request.token)
        val initialToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(::InvalidPasswordResetTokenException)
        val user = userRepository.findByIdForUpdate(initialToken.user.id)
            .orElseThrow(::InvalidPasswordResetTokenException)
        val lockedToken = passwordResetTokenRepository.findActiveByTokenHashForUpdate(tokenHash, now)
            .orElseThrow(::InvalidPasswordResetTokenException)

        if (
            lockedToken.user.id != user.id ||
            user.authProvider != LOCAL_PROVIDER ||
            lockedToken.usedAt != null ||
            !lockedToken.expiresAt.isAfter(now)
        ) {
            throw InvalidPasswordResetTokenException()
        }

        user.password = requireNotNull(passwordEncoder.encode(request.newPassword))
        lockedToken.markUsed(now)
        passwordResetTokenRepository.save(lockedToken)
        userRepository.saveAndFlush(user)
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
