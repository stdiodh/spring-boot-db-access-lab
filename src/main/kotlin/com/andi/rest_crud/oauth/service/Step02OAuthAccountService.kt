/*
 * 실습 순서 02 — 내부 계정 연결
 * 선행 단계: Step01에서 외부 profile을 검증된 OAuthUserProfile로 정규화합니다.
 * 이 단계의 판단: provider identity를 우선 조회하고 email 충돌을 차단한 뒤 자체 JWT를 발급합니다.
 * 다음 연결: Step03이 내부 로그인 결과를 브라우저 redirect로 안전하게 전달합니다.
 */
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
        // TODO: 검증된 profile로 기존 identity 조회, LOCAL 충돌 거부, 신규 계정 저장과 JWT 발급을 구현하세요.
        TODO("OAuth 계정 처리를 완성하세요.")
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
