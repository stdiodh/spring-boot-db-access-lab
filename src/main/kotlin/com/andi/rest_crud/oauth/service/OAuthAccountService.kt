package com.andi.rest_crud.oauth.service

import com.andi.rest_crud.auth.security.JwtTokenProvider
import com.andi.rest_crud.oauth.dto.OAuthLoginResponse
import com.andi.rest_crud.oauth.exception.OAuthAccountCreationConflictException
import com.andi.rest_crud.oauth.exception.OAuthAccountLinkRequiredException
import com.andi.rest_crud.oauth.exception.OAuthProfileRejectedException
import com.andi.rest_crud.oauth.model.OAuthUserProfile
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.hibernate.exception.ConstraintViolationException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class OAuthAccountService(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val passwordEncoder: PasswordEncoder
) {

    @Transactional
    fun handleOAuthLogin(profile: OAuthUserProfile): OAuthLoginResponse {
        val normalizedProfile = validateAndNormalize(profile)
        val existingOAuthUser = userRepository.findByAuthProviderAndProviderId(
            normalizedProfile.provider,
            normalizedProfile.providerId
        ).orElse(null)

        if (existingOAuthUser != null) {
            // 내부 email은 JWT subject와 게시글 작성자 식별자이므로 provider가 보낸 변경값으로 자동 갱신하지 않습니다.
            return createSuccessResponse(existingOAuthUser, isNewUser = false)
        }

        // 같은 email의 LOCAL 또는 다른 외부 계정은 사용자의 명시적인 연결 확인 없이는 합치지 않습니다.
        if (userRepository.existsByEmail(normalizedProfile.email)) {
            throw OAuthAccountLinkRequiredException()
        }

        val encodedPassword = requireNotNull(passwordEncoder.encode(UUID.randomUUID().toString()))
        val newUser = User(
            email = normalizedProfile.email,
            password = encodedPassword,
            authProvider = normalizedProfile.provider,
            providerId = normalizedProfile.providerId
        )

        val savedUser = try {
            // 사전 조회 뒤의 동시 가입도 DB unique 제약과 flush로 이 transaction 안에서 확정합니다.
            userRepository.saveAndFlush(newUser)
        } catch (exception: DataIntegrityViolationException) {
            if (exception.isUniqueConstraintViolation()) {
                // 제약명이나 충돌한 계정 정보를 외부로 노출하지 않고 재시도 가능한 도메인 실패로 바꿉니다.
                throw OAuthAccountCreationConflictException()
            }
            throw exception
        }

        return createSuccessResponse(savedUser, isNewUser = true)
    }

    private fun validateAndNormalize(profile: OAuthUserProfile): OAuthUserProfile {
        val normalized = profile.normalized()
        if (
            !normalized.emailVerified ||
            normalized.provider.isBlank() ||
            normalized.providerId.isBlank() ||
            normalized.email.isBlank() ||
            normalized.provider.length > 32 ||
            normalized.providerId.length > 255 ||
            normalized.email.length > 254
        ) {
            throw OAuthProfileRejectedException()
        }
        return normalized
    }

    private fun createSuccessResponse(user: User, isNewUser: Boolean): OAuthLoginResponse {
        return OAuthLoginResponse(
            email = user.email,
            accessToken = jwtTokenProvider.createToken(user.email),
            provider = user.authProvider,
            isNewUser = isNewUser
        )
    }

    private fun DataIntegrityViolationException.isUniqueConstraintViolation(): Boolean {
        return generateSequence(cause) { it.cause }
            .filterIsInstance<ConstraintViolationException>()
            .any { it.kind == ConstraintViolationException.ConstraintKind.UNIQUE }
    }
}
