package com.andi.rest_crud.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UserSignUpRequest(
    // 요청 본문 검증은 Kotlin backing field에 적용해야 잘못된 email이 Service까지 들어오지 않습니다.
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // 가입 시점에 저장 가능한 비밀번호 범위를 확정하되 원문의 공백은 사용자 입력으로 보존합니다.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(min = 8, max = 64, message = "password는 8자 이상 64자 이하여야 합니다.")
    val password: String
)

data class LoginRequest(
    // 회원가입과 로그인에 같은 email 계약을 사용해야 같은 계정을 일관되게 찾을 수 있습니다.
    @field:NotBlank(message = "email은 비어 있을 수 없습니다.")
    @field:Email(message = "email 형식이 올바르지 않습니다.")
    @field:Size(max = 254, message = "email은 254자 이하여야 합니다.")
    val email: String,

    // 로그인은 신규 비밀번호 정책이 아니라 저장된 값과의 일치를 확인하므로 최대 길이만 제한합니다.
    @field:NotBlank(message = "password는 비어 있을 수 없습니다.")
    @field:Size(max = 64, message = "password는 64자 이하여야 합니다.")
    val password: String
)

data class PostCreateRequest(
    // API가 허용한 제목이 DB 컬럼에서 잘리지 않도록 두 계층의 최대 길이를 맞춥니다.
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    // 본문은 공백뿐인 요청을 막고 실제 저장 가능한 범위 안에서만 받습니다.
    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
    val content: String
)

data class PostUpdateRequest(
    // 생성과 수정의 제목 계약이 같아야 저장된 게시글의 유효성이 작업마다 달라지지 않습니다.
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    // 수정 요청도 생성과 같은 본문 범위를 지켜 기존 데이터를 잘못된 상태로 만들지 않습니다.
    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
    val content: String
)
