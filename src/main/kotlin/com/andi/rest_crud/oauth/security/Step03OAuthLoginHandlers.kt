/*
 * 실습 순서 03 — OAuth 성공 redirect
 * 선행 단계: Step01/02에서 외부 profile 검증과 내부 계정 연결을 완료합니다.
 * 이 단계의 판단: JWT는 fragment로, 공개 상태만 query로 전달하고 응답을 저장하지 않게 합니다.
 * 다음 연결: Step04가 OAuth JWT로 확인한 Google 계정에 선택적 LOCAL 비밀번호를 등록합니다.
 */
package com.andi.rest_crud.oauth.security

import com.andi.rest_crud.oauth.dto.OAuthLoginResponse
import com.andi.rest_crud.oauth.exception.OAuthAccountCreationConflictException
import com.andi.rest_crud.oauth.exception.OAuthAccountLinkRequiredException
import com.andi.rest_crud.oauth.exception.OAuthProfileRejectedException
import com.andi.rest_crud.oauth.model.OAuthUserProfile
import com.andi.rest_crud.oauth.service.OAuthAccountService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.web.authentication.AuthenticationFailureHandler
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
        response.preventCaching()
        val profile = authentication.toOAuthUserProfile()
        if (profile == null) {
            response.redirectWithStatus(frontendUrl, "failed")
            return
        }

        val loginResponse = try {
            oAuthAccountService.handleOAuthLogin(profile)
        } catch (_: OAuthAccountLinkRequiredException) {
            response.redirectWithStatus(frontendUrl, "link_required")
            return
        } catch (_: OAuthAccountCreationConflictException) {
            response.redirectWithStatus(frontendUrl, "failed")
            return
        } catch (_: OAuthProfileRejectedException) {
            response.redirectWithStatus(frontendUrl, "failed")
            return
        }

        response.sendRedirect(successRedirectUrl(frontendUrl, loginResponse))
    }
}

@Component
class OAuthLoginFailureHandler(
    @Value("\${app.frontend-url}") private val frontendUrl: String
) : AuthenticationFailureHandler {

    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException
    ) {
        // 외부 인증 오류의 code/message는 URL에 싣지 않고 고정된 공개 상태만 전달합니다.
        response.preventCaching()
        response.redirectWithStatus(frontendUrl, "failed")
    }
}

private fun Authentication.toOAuthUserProfile(): OAuthUserProfile? {
    val oauthAuthentication = this as? OAuth2AuthenticationToken ?: return null
    val principal = oauthAuthentication.principal ?: return null
    val attributes = principal.attributes
    val provider = attributes["provider"] as? String ?: return null
    val providerId = attributes["providerId"] as? String ?: return null
    val email = attributes["email"] as? String ?: return null
    val emailVerified = attributes["emailVerified"] == true

    if (!emailVerified || provider.isBlank() || providerId.isBlank() || email.isBlank()) {
        return null
    }

    return OAuthUserProfile(provider, providerId, email, emailVerified)
}

private fun successRedirectUrl(frontendUrl: String, result: OAuthLoginResponse): String {
    // 우리 API용 Access Token은 query가 아닌 fragment에만 두어 서버 로그와 referrer 전달 범위를 줄입니다.
    return UriComponentsBuilder.fromUriString(frontendUrl)
        .queryParam("oauth", "success")
        .queryParam("provider", result.provider)
        .queryParam("isNewUser", result.isNewUser)
        .fragment("access_token=${result.accessToken}")
        .build()
        .encode()
        .toUriString()
}

private fun HttpServletResponse.redirectWithStatus(frontendUrl: String, status: String) {
    val redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl)
        .queryParam("oauth", status)
        .build()
        .encode()
        .toUriString()
    sendRedirect(redirectUrl)
}

private fun HttpServletResponse.preventCaching() {
    setHeader(HttpHeaders.CACHE_CONTROL, "no-store")
}
