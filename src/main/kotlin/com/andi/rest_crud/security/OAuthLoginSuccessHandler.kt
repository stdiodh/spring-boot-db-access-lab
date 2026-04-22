package com.andi.rest_crud.security

import com.andi.rest_crud.service.OAuthAccountService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

@Component
class OAuthLoginSuccessHandler(
    @Value("\${app.frontend-url}") private val frontendUrl: String,
    private val oAuthAccountService: OAuthAccountService
) : AuthenticationSuccessHandler {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        // TODO 1. OAuth2AuthenticationToken에서 provider와 principal을 읽으세요.
        // TODO 2. CustomOAuthUserService가 넣어둔 providerId, email을 프로필로 정리하세요.
        // TODO 3. Service에 사용자 연결을 맡기고, 성공 결과를 프론트 redirect 파라미터로 넘기세요.
        TODO("OAuth 로그인 성공 후 redirect 흐름을 완성하세요.")
    }
}
