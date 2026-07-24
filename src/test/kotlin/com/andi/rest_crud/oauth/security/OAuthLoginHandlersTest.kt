package com.andi.rest_crud.oauth.security

import com.andi.rest_crud.oauth.dto.OAuthLoginResponse
import com.andi.rest_crud.oauth.exception.OAuthAccountLinkRequiredException
import com.andi.rest_crud.oauth.model.OAuthUserProfile
import com.andi.rest_crud.oauth.service.OAuthAccountService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import java.net.URI

class OAuthLoginHandlersTest {
    private val frontendUrl = "http://localhost:8080/auth-practice/oauth.html"
    private val accountService = mock(OAuthAccountService::class.java)
    private val profile = OAuthUserProfile("GOOGLE", "provider-1", "student@example.com", true)

    @Test
    fun `성공 redirect는 token을 query가 아닌 fragment에만 담고 no-store를 설정한다`() {
        `when`(accountService.handleOAuthLogin(profile)).thenReturn(
            OAuthLoginResponse(
                email = "student@example.com",
                accessToken = "header.payload.signature",
                provider = "GOOGLE",
                isNewUser = true
            )
        )
        val response = MockHttpServletResponse()

        OAuthLoginSuccessHandler(frontendUrl, accountService).onAuthenticationSuccess(
            MockHttpServletRequest(),
            response,
            oauthAuthentication()
        )

        val location = requireNotNull(response.getHeader(HttpHeaders.LOCATION))
        val uri = URI(location)
        assertEquals(302, response.status)
        assertEquals("no-store", response.getHeader(HttpHeaders.CACHE_CONTROL))
        assertEquals("oauth=success&provider=GOOGLE&isNewUser=true", uri.rawQuery)
        assertFalse(uri.rawQuery.contains("header.payload.signature"))
        assertEquals("access_token=header.payload.signature", uri.rawFragment)
    }

    @Test
    fun `계정 연결 필요 redirect는 공개 상태만 담고 token이나 내부 정보를 노출하지 않는다`() {
        `when`(accountService.handleOAuthLogin(profile))
            .thenThrow(OAuthAccountLinkRequiredException())
        val response = MockHttpServletResponse()

        OAuthLoginSuccessHandler(frontendUrl, accountService).onAuthenticationSuccess(
            MockHttpServletRequest(),
            response,
            oauthAuthentication()
        )

        val location = requireNotNull(response.getHeader(HttpHeaders.LOCATION))
        val uri = URI(location)
        assertEquals("no-store", response.getHeader(HttpHeaders.CACHE_CONTROL))
        assertEquals("oauth=link_required", uri.rawQuery)
        assertNull(uri.rawFragment)
        assertFalse(location.contains("access_token"))
        assertFalse(location.contains("기존 계정"))
    }

    @Test
    fun `인증 실패 redirect는 provider 오류와 token 없이 고정된 공개 상태만 전달한다`() {
        val response = MockHttpServletResponse()
        val sensitiveMessage = "provider_secret=do-not-expose"

        OAuthLoginFailureHandler(frontendUrl).onAuthenticationFailure(
            MockHttpServletRequest(),
            response,
            OAuth2AuthenticationException(OAuth2Error("provider_error"), sensitiveMessage)
        )

        val location = requireNotNull(response.getHeader(HttpHeaders.LOCATION))
        val uri = URI(location)
        assertEquals(302, response.status)
        assertEquals("no-store", response.getHeader(HttpHeaders.CACHE_CONTROL))
        assertEquals("oauth=failed", uri.rawQuery)
        assertNull(uri.rawFragment)
        assertFalse(location.contains("provider_error"))
        assertFalse(location.contains(sensitiveMessage))
        assertTrue(location.startsWith(frontendUrl))
    }

    private fun oauthAuthentication(): OAuth2AuthenticationToken {
        val principal = DefaultOAuth2User(
            listOf(SimpleGrantedAuthority("OAUTH_USER")),
            mapOf(
                "provider" to "GOOGLE",
                "providerId" to "provider-1",
                "email" to "student@example.com",
                "emailVerified" to true
            ),
            "providerId"
        )
        return OAuth2AuthenticationToken(principal, principal.authorities, "google")
    }
}
