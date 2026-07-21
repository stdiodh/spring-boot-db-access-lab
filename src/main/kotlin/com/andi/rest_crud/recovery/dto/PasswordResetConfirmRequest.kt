package com.andi.rest_crud.recovery.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class PasswordResetConfirmRequest(
    @field:NotBlank(message = "token은 비어 있을 수 없습니다.")
    @field:Size(max = 128, message = "token은 128자 이하여야 합니다.")
    val token: String,

    @field:NotBlank(message = "newPassword는 비어 있을 수 없습니다.")
    @field:Size(min = 8, max = 64, message = "newPassword는 8자 이상 64자 이하여야 합니다.")
    val newPassword: String
)
