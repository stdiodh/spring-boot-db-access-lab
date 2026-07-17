package com.andi.rest_crud.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

// WHY: Kotlin 생성자 프로퍼티에는 @field:를 써야 Bean Validation이 실제 backing field의 값을 검사한다.
data class UserSignUpRequest(
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // WHY: 회원가입 비밀번호는 BCrypt 처리 전에 최소 길이와 저장 가능한 최대 길이를 함께 제한한다.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(min = 8, max = 64, message = "password는 8자 이상 64자 이하여야 합니다.")
    val password: String
)

// WHY: 로그인은 기존 비밀번호 정책을 다시 강제하지 않고 형식과 안전한 최대 길이만 검증한다.
data class LoginRequest(
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(max = 64, message = "password는 64자 이하여야 합니다.")
    val password: String
)

// WHY: create와 update가 같은 title/content 계약을 가져야 저장 경로에 따라 허용 길이가 달라지지 않는다.
data class PostCreateRequest(
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
    val content: String
)

data class PostUpdateRequest(
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
    val content: String
)
