package com.andi.rest_crud.dto

data class LoginRequest(
    // TODO 1. 로그인 요청에도 email, password만 받도록 유지하세요.
    // TODO 2. id 같은 서버 관리 값은 로그인 요청에 넣지 마세요.
    val email: String,

    // TODO 3. password가 비어 있으면 초입에서 막히게 하세요.
    val password: String
)
