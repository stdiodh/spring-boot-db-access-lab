package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.dto.PostCreateRequest
import com.andi.rest_crud.dto.PostResponse
import com.andi.rest_crud.dto.PostUpdateRequest
import com.andi.rest_crud.exception.PostNotFoundException
import com.andi.rest_crud.repository.PostRepository
import org.springframework.stereotype.Service

@Service
class PostService(
    private val postRepository: PostRepository
) {

    // TODO 1. Request DTO를 Entity로 바꾸는 흐름을 확인하세요.
    // TODO 2. 저장 결과는 Entity가 아니라 Response DTO로 반환하세요.
    fun create(request: PostCreateRequest): PostResponse {
        val savedPost = postRepository.save(
            PostEntity(
                title = request.title,
                content = request.content,
                author = request.author
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

    fun update(id: Long, request: PostUpdateRequest): PostResponse {
        val post = findPostById(id)
        post.title = request.title
        post.content = request.content
        post.author = request.author

        val updatedPost = postRepository.save(post)
        return PostResponse.from(updatedPost)
    }

    fun delete(id: Long) {
        val post = findPostById(id)
        postRepository.delete(post)
    }

    // TODO 3. 없는 게시글이면 NoSuchElementException 대신 비즈니스 예외를 던지세요.
    // TODO 4. 이 예외는 GlobalExceptionHandler에서 일관된 형식으로 처리할 예정입니다.
    private fun findPostById(id: Long): PostEntity {
        return postRepository.findById(id)
            .orElseThrow { NoSuchElementException("Post not found. id=$id") }
    }
}
