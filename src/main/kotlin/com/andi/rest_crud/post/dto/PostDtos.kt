package com.andi.rest_crud.post.dto

import com.andi.rest_crud.post.domain.PostEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class PostCreateRequest(
    // 요청 최대 길이와 DB 컬럼 길이는 같은 저장 계약을 사용합니다.
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
    val content: String
)

data class PostUpdateRequest(
    // 같은 데이터는 생성과 수정에서 동일한 유효 범위를 유지합니다.
    @field:NotBlank(message = "title은 비어 있을 수 없습니다.")
    @field:Size(max = 100, message = "title은 100자 이하여야 합니다.")
    val title: String,

    @field:NotBlank(message = "content는 비어 있을 수 없습니다.")
    @field:Size(max = 5000, message = "content는 5000자 이하여야 합니다.")
    val content: String
)

// 영속성 Entity 대신 응답 모델을 사용해 변경 가능한 저장 상태가 API 경계 밖으로 노출되지 않게 합니다.
data class PostResponse(
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
