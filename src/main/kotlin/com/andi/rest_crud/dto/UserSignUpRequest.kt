package com.andi.rest_crud.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UserSignUpRequest(
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    val email: String,

    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(min = 8, message = "password는 8자 이상이어야 합니다.")
    val password: String
)
