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

// WHY: 모든 실패 응답이 같은 code/message/errors 계약을 사용해야 클라이언트가 상태별로 안정적으로 처리할 수 있다.
data class ErrorResponse(
    val code: String,
    val message: String,
    val errors: Map<String, String> = emptyMap()
)

// WHY: Service는 HTTP 상태를 직접 만들지 않고 도메인 실패만 표현하고, 상태 변환은 아래 Handler가 맡는다.
class PostNotFoundException(id: Long) : RuntimeException("id=$id 에 해당하는 게시글이 없습니다.")

class ForbiddenPostAccessException(id: Long) : RuntimeException("id=$id 게시글을 수정하거나 삭제할 권한이 없습니다.")

class UserAlreadyExistsException : RuntimeException("이미 가입된 이메일입니다.")

class InvalidCredentialsException : RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")

// WHY: MVC Validation과 Service 예외를 한 경계에서 ErrorResponse로 바꾸면 Controller의 성공 흐름이 단순해진다.
@RestControllerAdvice
class GlobalExceptionHandler {

    // WHY: @RequestBody DTO의 @field 제약 실패는 Controller 본문에 들어가기 전에 400으로 끝낸다.
    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationException(exception: MethodArgumentNotValidException): ErrorResponse {
        return validationErrorResponse(toFirstFieldErrors(exception.bindingResult.fieldErrors))
    }

    // WHY: path/query parameter 검증은 body 검증과 예외 타입이 달라 별도 처리해야 한다.
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

    // WHY: 로그인 자격 정보가 틀린 경우도 보호 API와 같은 401 본문·header 계약으로 반환한다.
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

    // WHY: 같은 필드의 여러 오류는 정렬 후 첫 오류만 선택해 실행할 때마다 같은 응답을 만든다.
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
