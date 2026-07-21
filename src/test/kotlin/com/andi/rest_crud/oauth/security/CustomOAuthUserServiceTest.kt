package com.andi.rest_crud.oauth.security

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.user.OAuth2User
import java.util.Locale

class CustomOAuthUserServiceTest {
    private val service = CustomOAuthUserService()

    @Test
    fun `email이 없거나 공백이면 OAuth 경계에서 인증 실패로 거부한다`() {
        listOf(
            mapOf("sub" to "provider-1", "email_verified" to true),
            mapOf("sub" to "provider-1", "email" to "   ", "email_verified" to true)
        ).forEach { attributes ->
            val exception = assertThrows(OAuth2AuthenticationException::class.java) {
                service.normalizePrincipal("google", oauthUser(attributes))
            }

            assertEquals("missing_email", exception.error.errorCode)
        }
    }

    @Test
    fun `provider id가 없거나 공백이면 OAuth 경계에서 인증 실패로 거부한다`() {
        listOf(
            mapOf("email" to "student@example.com", "email_verified" to true),
            mapOf("sub" to "   ", "email" to "student@example.com", "email_verified" to true)
        ).forEach { attributes ->
            val exception = assertThrows(OAuth2AuthenticationException::class.java) {
                service.normalizePrincipal("google", oauthUser(attributes))
            }

            assertEquals("missing_provider_id", exception.error.errorCode)
        }
    }

    @Test
    fun `email verified가 true가 아니면 OAuth 경계에서 거부한다`() {
        listOf(false, "true", null).forEach { verified ->
            val attributes = mutableMapOf<String, Any>(
                "sub" to "provider-1",
                "email" to "student@example.com"
            )
            if (verified != null) {
                attributes["email_verified"] = verified
            }

            val exception = assertThrows(OAuth2AuthenticationException::class.java) {
                service.normalizePrincipal("google", oauthUser(attributes))
            }

            assertEquals("unverified_email", exception.error.errorCode)
        }
    }

    @Test
    fun `provider와 email은 시스템 Locale과 무관하게 ROOT 규칙으로 정규화한다`() {
        val previousLocale = Locale.getDefault()
        Locale.setDefault(Locale.forLanguageTag("tr-TR"))

        try {
            val principal = service.normalizePrincipal(
                " i ",
                oauthUser(
                    mapOf(
                        "sub" to " provider-1 ",
                        "email" to " STUDENT@EXAMPLE.COM ",
                        "email_verified" to true
                    )
                )
            )

            assertEquals("I", principal.attributes["provider"])
            assertEquals("provider-1", principal.attributes["providerId"])
            assertEquals("student@example.com", principal.attributes["email"])
            assertEquals(true, principal.attributes["emailVerified"])
        } finally {
            Locale.setDefault(previousLocale)
        }
    }

    @Test
    fun `저장 범위를 넘는 OAuth 식별값은 경계에서 거부한다`() {
        val cases = listOf(
            Triple("g".repeat(33), "provider-1", "student@example.com"),
            Triple("google", "p".repeat(256), "student@example.com"),
            Triple("google", "provider-1", "a".repeat(243) + "@example.com")
        )

        cases.forEach { (provider, providerId, email) ->
            val exception = assertThrows(OAuth2AuthenticationException::class.java) {
                service.normalizePrincipal(
                    provider,
                    oauthUser(
                        mapOf(
                            "sub" to providerId,
                            "email" to email,
                            "email_verified" to true
                        )
                    )
                )
            }

            assertEquals("invalid_user_info", exception.error.errorCode)
        }
    }

    private fun oauthUser(attributes: Map<String, Any>): OAuth2User {
        val user = mock(OAuth2User::class.java)
        `when`(user.attributes).thenReturn(attributes)
        `when`(user.authorities).thenReturn(listOf(SimpleGrantedAuthority("OAUTH_USER")))
        return user
    }
}
