package com.andi.rest_crud.oauth.security

import com.andi.rest_crud.oauth.model.OAuthUserProfile
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service

@Service
class CustomOAuthUserService : OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private val delegate = DefaultOAuth2UserService()

    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        return normalizePrincipal(
            userRequest.clientRegistration.registrationId,
            delegate.loadUser(userRequest)
        )
    }

    // 외부 호출은 delegate가 담당하고, 이 경계부터는 검증·정규화된 식별값만 애플리케이션에 전달합니다.
    internal fun normalizePrincipal(registrationId: String, oauthUser: OAuth2User): OAuth2User {
        val provider = registrationId.trim()
            .takeIf { it.isNotEmpty() }
            ?: reject("missing_provider", "OAuth provider를 확인할 수 없습니다.")
        val email = (oauthUser.attributes["email"] as? String)
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: reject("missing_email", "OAuth email을 확인할 수 없습니다.")
        val providerId = (oauthUser.attributes["sub"] as? String)
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: reject("missing_provider_id", "OAuth provider id를 확인할 수 없습니다.")

        if (oauthUser.attributes["email_verified"] != true) {
            reject("unverified_email", "검증된 OAuth email만 사용할 수 있습니다.")
        }

        val profile = OAuthUserProfile(
            provider = provider,
            providerId = providerId,
            email = email,
            emailVerified = true
        ).normalized()

        if (profile.provider.length > 32 || profile.providerId.length > 255 || profile.email.length > 254) {
            reject("invalid_user_info", "OAuth 사용자 식별값의 길이가 올바르지 않습니다.")
        }

        val normalizedAttributes = oauthUser.attributes.toMutableMap().apply {
            put("provider", profile.provider)
            put("providerId", profile.providerId)
            put("email", profile.email)
            put("emailVerified", true)
        }

        return DefaultOAuth2User(
            oauthUser.authorities,
            normalizedAttributes,
            "providerId"
        )
    }

    private fun reject(code: String, message: String): Nothing {
        throw OAuth2AuthenticationException(OAuth2Error(code), message)
    }
}
