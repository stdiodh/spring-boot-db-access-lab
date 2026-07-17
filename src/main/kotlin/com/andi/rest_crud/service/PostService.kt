package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.dto.PostCreateRequest
import com.andi.rest_crud.dto.PostResponse
import com.andi.rest_crud.dto.PostUpdateRequest
import com.andi.rest_crud.exception.PostNotFoundException
import com.andi.rest_crud.repository.PostRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class PostService(
    private val postRepository: PostRepository
) {

    @Transactional
    fun create(request: PostCreateRequest, authorEmail: String): PostResponse {
        val savedPost = postRepository.save(
            PostEntity(
                title = request.title,
                content = request.content,
                author = authorEmail
            )
        )

        return PostResponse.from(savedPost)
    }

    fun getAll(): List<PostResponse> {
        return postRepository.findAll()
            .map(PostResponse::from)
    }

    fun getById(id: Long): PostResponse {
        return PostResponse.from(findPostById(id))
    }

    @Transactional
    fun update(id: Long, request: PostUpdateRequest, currentUserEmail: String): PostResponse {
        val post = findPostById(id)
        // TODO(Authorization) 저장된 작성자와 currentUserEmail을 비교하고,
        // 다른 사용자의 게시글이면 ForbiddenPostAccessException을 발생시키세요.
        post.update(request.title, request.content)

        return PostResponse.from(post)
    }

    @Transactional
    fun delete(id: Long, currentUserEmail: String) {
        val post = findPostById(id)
        // TODO(Authorization) 삭제 전에도 수정과 같은 작성자 검사를 적용하세요.
        postRepository.delete(post)
    }

    private fun findPostById(id: Long): PostEntity {
        return postRepository.findById(id)
            .orElseThrow { PostNotFoundException(id) }
    }

}
