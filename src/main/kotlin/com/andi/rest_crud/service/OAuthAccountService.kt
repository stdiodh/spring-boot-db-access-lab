package com.andi.rest_crud.service

import com.andi.rest_crud.domain.User
import com.andi.rest_crud.dto.OAuthLoginResponse
import com.andi.rest_crud.exception.OAuthAccountLinkRequiredException
import com.andi.rest_crud.repository.UserRepository
import com.andi.rest_crud.security.JwtTokenProvider
import com.andi.rest_crud.security.OAuthUserProfile
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class OAuthAccountService(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val passwordEncoder: PasswordEncoder
) {

    // TODO 1. provider + providerId 기준으로 기존 OAuth 사용자를 먼저 찾으세요.
    // TODO 2. 같은 email의 로컬 계정은 자동 연결하지 말고 명시적인 계정 연결 확인이 필요함을 반환하세요.
    // TODO 3. 검증된 email이고 기존 OAuth 사용자가 없을 때만 새 사용자를 만들고 JWT를 발급하세요.
    fun handleOAuthLogin(profile: OAuthUserProfile): OAuthLoginResponse {
        TODO("OAuth 사용자 연결 흐름을 완성하세요.")
    }

    private fun linkOrCreateUser(profile: OAuthUserProfile): OAuthLinkResult {
        val provider = profile.provider.uppercase()

        val existingOAuthUser = userRepository.findByAuthProviderAndProviderId(provider, profile.providerId)
            .orElse(null)

        if (existingOAuthUser != null) {
            existingOAuthUser.email = profile.email
            val savedUser = userRepository.save(existingOAuthUser)
            return OAuthLinkResult(savedUser, false)
        }

        val existingEmailUser = userRepository.findByEmail(profile.email)
            .orElse(null)

        if (existingEmailUser != null) {
            throw OAuthAccountLinkRequiredException()
        }

        val newUser = userRepository.save(
            User(
                email = profile.email,
                password = requireNotNull(passwordEncoder.encode(UUID.randomUUID().toString())),
                authProvider = provider,
                providerId = profile.providerId
            )
        )

        return OAuthLinkResult(newUser, true)
    }

    private fun createSuccessResponse(user: User, isNewUser: Boolean): OAuthLoginResponse {
        val email = requireNotNull(user.email)

        return OAuthLoginResponse(
            email = email,
            accessToken = jwtTokenProvider.createToken(email),
            provider = requireNotNull(user.authProvider),
            isNewUser = isNewUser
        )
    }

    private data class OAuthLinkResult(
        val user: User,
        val isNewUser: Boolean
    )
}
