/*
 * 실습 순서 01 — OAuth profile 검증
 * 선행 단계: Step 0에서 OAuth 설정과 Security callback 경계를 확인합니다.
 * 이 단계의 판단: provider, providerId, email과 verified 상태를 내부 식별 속성으로 정규화합니다.
 * 다음 연결: Step02가 검증된 OAuthUserProfile을 내부 사용자와 자체 JWT로 연결합니다.
 */
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
        TODO("Step 01: OAuth profile 검증·정규화를 구현하세요.")
    }

    private fun reject(code: String, message: String): Nothing {
        throw OAuth2AuthenticationException(OAuth2Error(code), message)
    }
}
