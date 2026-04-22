package com.andi.rest_crud.exception

// TODO 1. 실패 응답도 일정한 구조로 내려가게 유지하세요.
// TODO 2. code, message, errors 세 칸만으로도 기본 흐름은 충분합니다.
data class ErrorResponse(
    val code: String,
    val message: String,
    val errors: Map<String, String> = emptyMap()
)
