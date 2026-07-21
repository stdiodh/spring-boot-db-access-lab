package com.andi.rest_crud.auth.security

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotSame
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder

class JwtAuthenticationFilterTest {
    private val jwtTokenProvider = mock(JwtTokenProvider::class.java)
    private val filter = JwtAuthenticationFilter(jwtTokenProvider)

    @AfterEach
    fun clearContext() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `유효한 token은 한 번 검증하고 새 context에 Authentication을 설정한다`() {
        val previousContext = SecurityContextHolder.createEmptyContext()
        SecurityContextHolder.setContext(previousContext)
        `when`(jwtTokenProvider.getValidatedSubject("valid-token")).thenReturn("student@example.com")

        filter.doFilter(
            requestWithAuthorization("Bearer valid-token"),
            MockHttpServletResponse(),
            MockFilterChain()
        )

        val currentContext = SecurityContextHolder.getContext()
        val authentication = requireNotNull(currentContext.authentication)
        assertNotSame(previousContext, currentContext)
        assertEquals("student@example.com", authentication.name)
        assertTrue(authentication.authorities.isEmpty())
        verify(jwtTokenProvider).getValidatedSubject("valid-token")
    }

    @Test
    fun `기존 Authentication이 있으면 Authorization header로 덮어쓰지 않는다`() {
        val existingAuthentication = UsernamePasswordAuthenticationToken("existing@example.com", null, emptyList())
        SecurityContextHolder.getContext().authentication = existingAuthentication

        filter.doFilter(
            requestWithAuthorization("Bearer another-token"),
            MockHttpServletResponse(),
            MockFilterChain()
        )

        assertSame(existingAuthentication, SecurityContextHolder.getContext().authentication)
        verifyNoInteractions(jwtTokenProvider)
    }

    @Test
    fun `Bearer token이 공백이면 Authentication을 만들지 않는다`() {
        filter.doFilter(
            requestWithAuthorization("Bearer    "),
            MockHttpServletResponse(),
            MockFilterChain()
        )

        assertTrue(SecurityContextHolder.getContext().authentication == null)
        verifyNoInteractions(jwtTokenProvider)
    }

    @Test
    fun `Bearer prefix가 아니면 token으로 처리하지 않는다`() {
        filter.doFilter(
            requestWithAuthorization("Basic credential"),
            MockHttpServletResponse(),
            MockFilterChain()
        )

        assertTrue(SecurityContextHolder.getContext().authentication == null)
        verifyNoInteractions(jwtTokenProvider)
    }

    @Test
    fun `provider가 검증된 subject를 반환하지 않으면 Authentication을 만들지 않는다`() {
        `when`(jwtTokenProvider.getValidatedSubject("invalid-token")).thenReturn(null)

        filter.doFilter(
            requestWithAuthorization("Bearer invalid-token"),
            MockHttpServletResponse(),
            MockFilterChain()
        )

        assertTrue(SecurityContextHolder.getContext().authentication == null)
        verify(jwtTokenProvider).getValidatedSubject("invalid-token")
    }

    private fun requestWithAuthorization(value: String): MockHttpServletRequest {
        return MockHttpServletRequest().apply {
            addHeader(HttpHeaders.AUTHORIZATION, value)
        }
    }
}
