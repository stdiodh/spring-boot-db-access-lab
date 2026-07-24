package com.andi.rest_crud.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UserSignUpRequest(
    // Kotlin Validation은 backing field에 적용되도록 use-site target을 명시합니다.
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // 앞뒤 공백도 자격 정보의 일부이므로 Service가 원문을 임의로 바꾸지 않습니다.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(min = 8, max = 64, message = "password는 8자 이상 64자 이하여야 합니다.")
    val password: String
)

data class LoginRequest(
    // 같은 사용자 식별자는 진입 API가 달라도 같은 규칙으로 검증합니다.
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // 로그인은 신규 password 정책보다 저장된 자격 정보와의 일치가 핵심이므로 최대 길이만 제한합니다.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(max = 64, message = "password는 64자 이하여야 합니다.")
    val password: String
)

data class LocalPasswordEnrollmentRequest(
    // OAuth 가입 뒤 사용자가 고른 LOCAL 비밀번호도 자체 가입과 같은 길이 계약을 사용합니다.
    @field:NotBlank(message = "newPassword는 비어 있을 수 없습니다.")
    @field:Size(min = 8, max = 64, message = "newPassword는 8자 이상 64자 이하여야 합니다.")
    val newPassword: String
)

// 보호 API는 검증된 최소 신원만 반환해 JWT 내부 구조가 응답 계약으로 새지 않게 합니다.
data class CurrentUserResponse(
    val email: String,
    val loginMethods: List<String>
)

// 클라이언트가 JWT payload를 직접 해석하지 않도록 전달 방식과 남은 만료 시간을 함께 제공합니다.
// expiresIn은 내부 millisecond 설정 대신 HTTP 클라이언트가 바로 쓰기 쉬운 초 단위입니다.
data class TokenResponse(
    val accessToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long
)
