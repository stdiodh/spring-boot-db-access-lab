package com.andi.rest_crud.exception

import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
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
        // TODO(Validation) request body의 field error를 ErrorResponse로 변환하세요.
        // 같은 field에 오류가 여러 개면 우연히 덮어쓰지 말고 첫 오류를 결정적으로 선택하세요.
        TODO("request body validation 400 응답을 완성하세요.")
    }

    @ExceptionHandler(HandlerMethodValidationException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleMethodValidationException(exception: HandlerMethodValidationException): ErrorResponse {
        // TODO(Validation) path/query parameter 검증 오류를 같은 ErrorResponse 규칙으로 변환하세요.
        TODO("method parameter validation 400 응답을 완성하세요.")
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleMessageNotReadableException(exception: HttpMessageNotReadableException): ErrorResponse {
        // TODO(Validation) 읽을 수 없는 JSON에 field error와 구분되는 400 응답을 만드세요.
        TODO("malformed JSON 400 응답을 완성하세요.")
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
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handleInvalidCredentialsException(exception: InvalidCredentialsException): ErrorResponse {
        return ErrorResponse(
            code = "INVALID_CREDENTIALS",
            message = exception.message ?: "인증에 실패했습니다."
        )
    }
}
