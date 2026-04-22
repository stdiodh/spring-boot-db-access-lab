package com.andi.rest_crud.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class LoginRequest(
    // TODO 1. 로그인 요청에도 email, password만 받도록 유지하세요.
    // TODO 2. id 같은 서버 관리 값은 로그인 요청에 넣지 마세요.
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    val email: String,

    // TODO 3. password가 비어 있으면 초입에서 막히게 하세요.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    val password: String
)
