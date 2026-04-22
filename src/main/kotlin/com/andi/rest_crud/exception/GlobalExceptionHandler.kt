package com.andi.rest_crud.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    // TODO 1. Validation 실패는 400 Bad Request로 내려가게 하세요.
    // TODO 2. fieldErrors를 읽어서 어떤 필드가 실패했는지 errors에 담아보세요.
    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationException(exception: MethodArgumentNotValidException): ErrorResponse {
        TODO("검증 실패 응답 형식을 완성하세요.")
    }

    // TODO 3. 비즈니스 예외는 검증 실패와 다른 code로 내려가게 하세요.
    @ExceptionHandler(PostNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handlePostNotFoundException(exception: PostNotFoundException): ErrorResponse {
        TODO("게시글 조회 실패 응답 형식을 완성하세요.")
    }
}
