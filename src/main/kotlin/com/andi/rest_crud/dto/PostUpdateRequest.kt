package com.andi.rest_crud.dto

data class PostUpdateRequest(
    // TODO 1. 수정 요청도 생성 요청과 같은 기준으로 검증하세요.
    val title: String,

    // TODO 2. content가 비어 있으면 수정 흐름에 들어가지 않게 하세요.
    val content: String,

    // TODO 3. author도 비어 있는 값은 막으세요.
    val author: String
)
