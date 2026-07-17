package com.andi.rest_crud.dto

data class PostUpdateRequest(
    // TODO(Validation) 1. title이 비어 있지 않고 100자를 넘지 않게 검증하세요.
    val title: String,

    // TODO(Validation) 2. content가 비어 있지 않고 5000자를 넘지 않게 검증하세요.
    val content: String
)
