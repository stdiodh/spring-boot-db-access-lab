package com.andi.rest_crud.dto

data class LoginRequest(
    // TODO(Validation) 1. email이 비어 있지 않고 이메일 형식이며 254자를 넘지 않게 검증하세요.
    // 회원가입 요청과 같은 email 계약을 유지합니다.
    val email: String,

    // TODO(Validation) 2. password가 비어 있지 않고 64자를 넘지 않게 검증하세요.
    // 로그인에서는 가입 가능한 최소 길이보다 저장된 비밀번호와의 일치 여부가 핵심입니다.
    val password: String
)
