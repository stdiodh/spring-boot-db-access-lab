package com.andi.rest_crud.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class UserSignUpRequest(
    // TODO 1. 회원가입에 필요한 핵심 필드만 남기세요.
    // TODO 2. email 형식을 기본 수준에서 검증하세요.
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    val email: String,

    // TODO 3. 비밀번호를 비워 둔 채 받지 않도록 검증하세요.
    // TODO 4. 비밀번호 원문을 그대로 저장하지 않는다는 점을 다음 단계에서 연결하세요.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    val password: String
)
