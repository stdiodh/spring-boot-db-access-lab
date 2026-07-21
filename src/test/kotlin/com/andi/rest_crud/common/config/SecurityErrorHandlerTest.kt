package com.andi.rest_crud.common.config

import com.andi.rest_crud.common.error.ErrorResponse
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import tools.jackson.databind.ObjectMapper

class SecurityErrorHandlerTest {
    private val objectMapper = ObjectMapper()

    @Test
    fun `인증 실패는 ErrorResponse 형식과 Bearer 헤더로 응답한다`() {
        val response = MockHttpServletResponse()

        CustomAuthenticationEntryPoint(objectMapper).commence(
            MockHttpServletRequest(),
            response,
            BadCredentialsException("test authentication failure")
        )

        assertEquals(401, response.status)
        assertEquals("Bearer", response.getHeader(HttpHeaders.WWW_AUTHENTICATE))
        assertEquals(Charsets.UTF_8.name(), response.characterEncoding)
        assertTrue(response.contentType.orEmpty().startsWith(MediaType.APPLICATION_JSON_VALUE))
        assertEquals(
            objectMapper.writeValueAsString(
                ErrorResponse(code = "UNAUTHORIZED", message = "인증이 필요합니다.")
            ),
            response.contentAsString
        )
    }

    @Test
    fun `접근 거부는 ErrorResponse 형식의 403으로 응답한다`() {
        val response = MockHttpServletResponse()

        JsonAccessDeniedHandler(objectMapper).handle(
            MockHttpServletRequest(),
            response,
            AccessDeniedException("test authorization failure")
        )

        assertEquals(403, response.status)
        assertEquals(Charsets.UTF_8.name(), response.characterEncoding)
        assertTrue(response.contentType.orEmpty().startsWith(MediaType.APPLICATION_JSON_VALUE))
        assertEquals(
            objectMapper.writeValueAsString(
                ErrorResponse(code = "ACCESS_DENIED", message = "접근 권한이 없습니다.")
            ),
            response.contentAsString
        )
    }
}
