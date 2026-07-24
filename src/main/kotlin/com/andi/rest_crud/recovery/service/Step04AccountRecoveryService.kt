/*
 * 실습 순서 04 — reset token 발급과 확정
 * 선행 단계: Step03까지 OAuth 로그인과 내부 JWT 전달 경계를 완성합니다.
 * 요청 단계: LOCAL 계정과 cooldown을 확인하고 token을 commit한 뒤 동기 발송용 command를 반환합니다.
 * 실패 보상: SMTP가 실패하면 id·hash·미사용 조건이 모두 맞는 이번 token만 별도 transaction에서 삭제합니다.
 * 확정 단계: 비밀번호 변경과 token 단일 사용 처리를 한 transaction에서 함께 commit합니다.
 */
package com.andi.rest_crud.recovery.service

import com.andi.rest_crud.recovery.domain.PasswordResetToken
import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.exception.InvalidPasswordResetTokenException
import com.andi.rest_crud.recovery.exception.RecoveryMailCooldownException
import com.andi.rest_crud.recovery.exception.RecoveryMailNotSentException
import com.andi.rest_crud.recovery.mail.PasswordResetMailCommand
import com.andi.rest_crud.recovery.repository.PasswordResetTokenRepository
import com.andi.rest_crud.recovery.security.PasswordResetTokenCodec
import com.andi.rest_crud.user.repository.UserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.util.UriComponentsBuilder
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.Locale

@Service
@Transactional(readOnly = true)
class AccountRecoveryService(
    private val userRepository: UserRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenCodec: PasswordResetTokenCodec,
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
    fun requestPasswordReset(email: String): PasswordResetMailCommand {
        val normalizedEmail = email.lowercase(Locale.ROOT)
        val user = userRepository.findByEmailForUpdate(normalizedEmail)
            .orElseThrow(::RecoveryMailNotSentException)

        if (user.authProvider != LOCAL_PROVIDER) {
            throw RecoveryMailNotSentException()
        }

        val now = clock.instant()
        val existingToken = passwordResetTokenRepository.findByUserIdForUpdate(user.id).orElse(null)
        val cooldownEndsAt = existingToken?.createdAt?.plus(resendCooldown)
        if (existingToken != null && cooldownEndsAt != null &&
            existingToken.isRecentlyIssuedAndActive(now, cooldownEndsAt)
        ) {
            throw RecoveryMailCooldownException(retryAfterSeconds(now, cooldownEndsAt))
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

        val savedToken = passwordResetTokenRepository.saveAndFlush(token)
        // 메서드가 반환되면 Spring proxy가 이 transaction을 commit한 뒤 Controller가 SMTP를 호출합니다.
        return PasswordResetMailCommand(
            tokenId = savedToken.id,
            tokenHash = savedToken.tokenHash,
            recipientEmail = user.email,
            resetLink = createResetLink(rawToken)
        )
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun discardUndeliveredToken(tokenId: Long, tokenHash: String): Boolean {
        // 더 최신 hash로 회전됐거나 이미 사용된 row는 지우지 않습니다.
        return passwordResetTokenRepository.deleteUnusedByIdAndTokenHash(tokenId, tokenHash) == 1
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

    private fun retryAfterSeconds(now: Instant, cooldownEndsAt: Instant): Long {
        val remaining = Duration.between(now, cooldownEndsAt)
        val roundedUpSeconds = remaining.seconds + if (remaining.nano > 0) 1 else 0
        return roundedUpSeconds.coerceAtLeast(1)
    }

    private companion object {
        const val LOCAL_PROVIDER = "LOCAL"
    }
}
