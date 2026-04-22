package com.andi.rest_crud.dto

import com.andi.rest_crud.domain.PostEntity

data class PostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val author: String
) {
    companion object {
        // TODO 1. Entity를 그대로 응답으로 내보내지 마세요.
        // TODO 2. Response DTO에 필요한 값만 담아 반환하세요.
        fun from(entity: PostEntity): PostResponse {
            TODO("PostEntity를 PostResponse로 변환하세요.")
        }
    }
}
