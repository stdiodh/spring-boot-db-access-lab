/*
 * 실습 순서 04 — 애플리케이션 오류 계약
 * 선행 단계: Step01의 입력 오류와 이후 Service가 던질 도메인 예외 종류를 확인합니다.
 * 이 단계의 판단: Controller 밖에서 발생한 실패를 code/message/errors 형태와 정확한 HTTP status로 번역합니다.
 * 다음 연결: Step06의 인증 실패와 Step08의 403/404가 DB 내부 정보 없이 같은 응답 문법을 사용합니다.
 */
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

// code는 클라이언트 분기, message는 사용자 설명, errors는 필드별 Validation 실패에 사용합니다.
data class ErrorResponse(
    val code: String,
    val message: String,
    val errors: Map<String, String> = emptyMap()
)

class PostNotFoundException(id: Long) : RuntimeException("id=$id 에 해당하는 게시글이 없습니다.")

class ForbiddenPostAccessException(id: Long) : RuntimeException("id=$id 게시글을 수정하거나 삭제할 권한이 없습니다.")

class UserAlreadyExistsException : RuntimeException("이미 가입된 이메일입니다.")

class InvalidCredentialsException : RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationException(exception: MethodArgumentNotValidException): ErrorResponse {
        // 실습 빈칸 대응: request body의 field 오류를 공통 Validation 응답으로 바꿉니다.
        // 설명 포인트: 같은 입력은 검증 실행 순서와 무관하게 같은 첫 오류를 보여줘야 합니다.
        // 확인 질문: 한 field가 여러 제약을 어기면 어떤 메시지를 우선해야 할까요?
        return validationErrorResponse(toFirstFieldErrors(exception.bindingResult.fieldErrors))
    }

    @ExceptionHandler(HandlerMethodValidationException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleMethodValidationException(exception: HandlerMethodValidationException): ErrorResponse {
        // 실습 빈칸 대응: path와 query parameter 오류도 공통 Validation 응답으로 바꿉니다.
        // 설명 포인트: 입력 위치가 달라도 클라이언트가 받는 오류 문법은 같아야 합니다.
        // 확인 질문: body 오류와 method parameter 오류는 같은 예외로 들어올까요?
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
        // 실습 빈칸 대응: 읽을 수 없는 JSON을 field Validation과 다른 400 응답으로 표현합니다.
        // 설명 포인트: 역직렬화에 실패하면 DTO 제약 검증 단계까지 도달하지 못합니다.
        // 확인 질문: 문법이 깨진 JSON에서 field별 오류를 만들 수 있을까요?
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
