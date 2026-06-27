package com.andi.rest_crud.dto

import com.andi.rest_crud.domain.PostEntity

/*
 * TODO(A&I)
 *
 * 게시글 응답 DTO를 작성하세요.
 *
 * 필요한 값:
 * - id
 * - title
 * - content
 * - author
 *
 * 추가로 PostEntity를 PostResponse로 변환하는 from 메서드를 작성하세요.
 *
 * 목표 사용 형태:
 * PostResponse.from(entity)
 */
class PostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val author: String
) {
    companion object {
        fun from(entity: PostEntity): PostResponse = PostResponse(
            id = entity.id,
            title = entity.title,
            content = entity.content,
            author = entity.author
        )
    }
}
