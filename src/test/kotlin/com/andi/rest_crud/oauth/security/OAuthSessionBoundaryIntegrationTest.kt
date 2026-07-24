package com.andi.rest_crud.oauth.security

import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.Collections

@SpringBootTest(
    properties = [
        "APP_FRONTEND_URL=http://localhost:8080/auth-practice/index.html",
        "APP_OAUTH_RESULT_URL=http://localhost:8080/auth-practice/oauth.html"
    ]
)
@AutoConfigureMockMvc
class OAuthSessionBoundaryIntegrationTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    @Test
    fun `OAuth state 임시 session은 보호 API 인증 session으로 사용되지 않는다`() {
        val authorizationResult = mockMvc.perform(get("/oauth2/authorization/google"))
            .andExpect(status().is3xxRedirection)
            .andReturn()
        val session = authorizationResult.request.getSession(false) as? MockHttpSession
        assertNotNull(session)

        val authorizationRequest = Collections.list(requireNotNull(session).attributeNames)
            .mapNotNull { session.getAttribute(it) as? OAuth2AuthorizationRequest }
            .single()
        assertTrue(authorizationRequest.state.isNotBlank())

        val securityContext = SecurityContextHolder.createEmptyContext()
        securityContext.authentication = UsernamePasswordAuthenticationToken(
            "session-user@example.com",
            null,
            listOf(SimpleGrantedAuthority("ROLE_USER"))
        )
        session.setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
            securityContext
        )

        mockMvc.perform(get("/auth/me").session(session))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))

        mockMvc.perform(
            get("/login/oauth2/code/google")
                .param("error", "access_denied")
                .param("error_description", "provider internal detail")
                .param("state", authorizationRequest.state)
                .session(session)
        )
            .andExpect(status().is3xxRedirection)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(redirectedUrl("http://localhost:8080/auth-practice/oauth.html?oauth=failed"))
    }
}
