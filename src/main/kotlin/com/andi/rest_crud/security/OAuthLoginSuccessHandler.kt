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
        // TODO 2. CustomOAuthUserService가 넣어둔 providerId, email, emailVerified를 프로필로 정리하세요.
        // TODO 3. JWT는 query가 아니라 URL fragment로 넘기고, 기존 계정 연결 확인이 필요하면 token 없이 상태만 전달하세요.
        TODO("OAuth 로그인 성공 후 redirect 흐름을 완성하세요.")
    }
}
