package com.andi.rest_crud.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank

data class IdolRequest(
    @field:NotBlank(message = "이름은 필수입니다.")
    val name: String,

    @field:NotBlank(message = "그룹명은 필수입니다.")
    val group: String,

    @field:NotBlank(message = "소속사는 필수입니다.")
    val agency: String,

    @field:Min(value = 1990, message = "데뷔 연도는 1990년 이후여야 합니다.")
    val debutYear: Int
)
