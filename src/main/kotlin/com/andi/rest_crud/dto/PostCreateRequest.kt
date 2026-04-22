package com.andi.rest_crud.dto

data class PostCreateRequest(
    // TODO 1. 요청으로 받을 필드만 남기세요.
    // TODO 2. title이 비어 있으면 초입에서 막히도록 기본 검증을 붙이세요.
    val title: String,

    // TODO 3. content에도 같은 방식으로 검증을 붙이세요.
    val content: String,

    // TODO 4. author도 비어 있는 요청을 받지 않게 하세요.
    val author: String
)
