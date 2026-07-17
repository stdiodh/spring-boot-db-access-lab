package com.andi.rest_crud.dto

data class UserSignUpRequest(
    // TODO(Validation) 1. email이 비어 있지 않고 이메일 형식이며 254자를 넘지 않게 검증하세요.
    // TODO(Validation) 2. Kotlin에서는 제약 조건이 field에 적용되도록 use-site target을 확인하세요.
    val email: String,

    // TODO(Validation) 3. password가 비어 있지 않고 8자 이상 64자 이하인지 검증하세요.
    // password는 공백도 입력값이므로 trim하지 않습니다.
    val password: String
)
