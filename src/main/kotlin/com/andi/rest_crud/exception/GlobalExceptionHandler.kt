package com.andi.rest_crud.exception

import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.HandlerMethodValidationException

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationException(exception: MethodArgumentNotValidException): ErrorResponse {
        return validationErrorResponse(toFirstFieldErrors(exception.bindingResult.fieldErrors))
    }

    @ExceptionHandler(HandlerMethodValidationException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleMethodValidationException(exception: HandlerMethodValidationException): ErrorResponse {
        val errors = linkedMapOf<String, String>()

        exception.parameterValidationResults
            .sortedBy { it.methodParameter.parameterIndex }
            .forEach { result ->
                val parameter = result.methodParameter
                val field = parameter.parameterName ?: "argument${parameter.parameterIndex}"
                val message = result.resolvableErrors
                    .sortedWith(compareBy({ constraintPriority(it.codes?.firstOrNull()) }, { it.defaultMessage }))
                    .firstOrNull()
                    ?.defaultMessage
                    ?: DEFAULT_VALIDATION_MESSAGE

                errors.putIfAbsent(field, message)
            }

        return validationErrorResponse(errors)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleHttpMessageNotReadableException(): ErrorResponse {
        return ErrorResponse(
            code = "MALFORMED_JSON",
            message = "요청 본문을 읽을 수 없습니다. JSON 형식을 확인해 주세요."
        )
    }

    @ExceptionHandler(PostNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handlePostNotFoundException(exception: PostNotFoundException): ErrorResponse {
        return ErrorResponse(
            code = "POST_NOT_FOUND",
            message = exception.message ?: "게시글을 찾을 수 없습니다."
        )
    }

    @ExceptionHandler(ForbiddenPostAccessException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleForbiddenPostAccessException(exception: ForbiddenPostAccessException): ErrorResponse {
        return ErrorResponse(
            code = "FORBIDDEN_POST_ACCESS",
            message = exception.message ?: "게시글 접근 권한이 없습니다."
        )
    }

    @ExceptionHandler(UserAlreadyExistsException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handleUserAlreadyExistsException(exception: UserAlreadyExistsException): ErrorResponse {
        return ErrorResponse(
            code = "USER_ALREADY_EXISTS",
            message = exception.message ?: "이미 가입된 사용자입니다."
        )
    }

    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleInvalidCredentialsException(exception: InvalidCredentialsException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .header(HttpHeaders.WWW_AUTHENTICATE, "Bearer")
            .body(
                ErrorResponse(
                    code = "INVALID_CREDENTIALS",
                    message = exception.message ?: "인증에 실패했습니다."
                )
            )
    }

    private fun toFirstFieldErrors(fieldErrors: List<FieldError>): Map<String, String> {
        val errors = linkedMapOf<String, String>()

        fieldErrors
            .sortedWith(compareBy({ it.field }, { constraintPriority(it.code) }, { it.defaultMessage }))
            .forEach { fieldError ->
                errors.putIfAbsent(
                    fieldError.field,
                    fieldError.defaultMessage ?: DEFAULT_VALIDATION_MESSAGE
                )
            }

        return errors
    }

    private fun validationErrorResponse(errors: Map<String, String>): ErrorResponse {
        return ErrorResponse(
            code = "VALIDATION_ERROR",
            message = "입력값 검증에 실패했습니다.",
            errors = errors
        )
    }

    private fun constraintPriority(code: String?): Int {
        return when (code?.substringBefore('.')) {
            "NotBlank" -> 0
            "Email" -> 1
            "Size" -> 2
            else -> Int.MAX_VALUE
        }
    }

    private companion object {
        const val DEFAULT_VALIDATION_MESSAGE = "잘못된 요청입니다."
    }
}
