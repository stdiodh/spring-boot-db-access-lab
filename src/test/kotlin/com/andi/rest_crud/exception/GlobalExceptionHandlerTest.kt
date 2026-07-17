package com.andi.rest_crud.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.springframework.context.MessageSourceResolvable
import org.springframework.core.MethodParameter
import org.springframework.validation.method.ParameterValidationResult
import org.springframework.web.method.annotation.HandlerMethodValidationException

class GlobalExceptionHandlerTest {
    private val handler = GlobalExceptionHandler()

    @Test
    fun `method parameter validation은 parameter별 첫 오류로 응답한다`() {
        val exception = mock(HandlerMethodValidationException::class.java)
        val result = mock(ParameterValidationResult::class.java)
        val parameter = mock(MethodParameter::class.java)
        val resolvableError = mock(MessageSourceResolvable::class.java)

        `when`(exception.parameterValidationResults).thenReturn(listOf(result))
        `when`(result.methodParameter).thenReturn(parameter)
        `when`(parameter.parameterIndex).thenReturn(0)
        `when`(parameter.parameterName).thenReturn("id")
        `when`(result.resolvableErrors).thenReturn(listOf(resolvableError))
        `when`(resolvableError.codes).thenReturn(arrayOf("Positive.postController.id"))
        `when`(resolvableError.defaultMessage).thenReturn("id는 양수여야 합니다.")

        val response = handler.handleMethodValidationException(exception)

        assertEquals("VALIDATION_ERROR", response.code)
        assertEquals("입력값 검증에 실패했습니다.", response.message)
        assertEquals(mapOf("id" to "id는 양수여야 합니다."), response.errors)
    }
}
