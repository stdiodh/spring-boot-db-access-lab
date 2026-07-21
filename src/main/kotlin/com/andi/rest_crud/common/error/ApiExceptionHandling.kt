package com.andi.rest_crud.common.error

import com.andi.rest_crud.auth.exception.InvalidCredentialsException
import com.andi.rest_crud.auth.exception.UserAlreadyExistsException
import com.andi.rest_crud.post.exception.ForbiddenPostAccessException
import com.andi.rest_crud.post.exception.PostNotFoundException
import com.andi.rest_crud.recovery.exception.InvalidPasswordResetTokenException
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

// code는 클라이언트 분기, message는 사용자 설명, errors는 필드별 Validation 실패에 사용합니다.
data class ErrorResponse(
    val code: String,
    val message: String,
    val errors: Map<String, String> = emptyMap()
)

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationException(exception: MethodArgumentNotValidException): ErrorResponse {
        // 같은 입력은 검증 실행 순서와 무관하게 같은 첫 오류를 반환합니다.
        return validationErrorResponse(toFirstFieldErrors(exception.bindingResult.fieldErrors))
    }

    @ExceptionHandler(HandlerMethodValidationException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleMethodValidationException(exception: HandlerMethodValidationException): ErrorResponse {
        // 입력 위치가 달라도 body Validation과 같은 오류 문법을 사용합니다.
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
        // 역직렬화 실패는 DTO 제약 검증 이전에 발생하므로 별도 오류로 표현합니다.
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
        // 로그인 실패도 401 응답 정책에 따라 Bearer challenge header를 함께 반환합니다.
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .header(HttpHeaders.WWW_AUTHENTICATE, "Bearer")
            .body(
                ErrorResponse(
                    code = "INVALID_CREDENTIALS",
                    message = exception.message ?: "인증에 실패했습니다."
                )
            )
    }

    @ExceptionHandler(InvalidPasswordResetTokenException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleInvalidPasswordResetTokenException(exception: InvalidPasswordResetTokenException): ErrorResponse {
        return ErrorResponse(
            code = "INVALID_PASSWORD_RESET_TOKEN",
            message = exception.message ?: "비밀번호 재설정 링크가 유효하지 않습니다."
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
        // 빈 값에는 Email/Size보다 NotBlank를 우선해 같은 입력이 언제나 같은 첫 메시지를 갖게 합니다.
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
