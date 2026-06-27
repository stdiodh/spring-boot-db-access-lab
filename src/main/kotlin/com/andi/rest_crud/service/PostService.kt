package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.dto.PostCreateRequest
import com.andi.rest_crud.dto.PostResponse
import com.andi.rest_crud.dto.PostUpdateRequest
import com.andi.rest_crud.repository.PostRepository
import org.springframework.stereotype.Service

@Service
class PostService(
    private val postRepository: PostRepository
) {

    /*
     * TODO(A&I)
     *
     * 1. 요청 DTO로 Entity를 만드세요.
     * 2. Repository로 저장하세요.
     * 3. 저장 결과를 Response DTO로 변환하세요.
     */
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

    /*
     * TODO(A&I)
     *
     * 1. Repository에서 전체 Entity 목록을 조회하세요.
     * 2. 각 Entity를 Response DTO로 변환하세요.
     */
    fun getAll(): List<PostResponse> {
        return postRepository.findAll()
            .map(PostResponse::from)
    }

    /*
     * TODO(A&I)
     *
     * 1. id로 Entity를 조회하세요.
     * 2. 조회 결과를 Response DTO로 변환하세요.
     */
    fun getById(id: Long): PostResponse {
        val post = postRepository.findById(id)
            .orElseThrow { NoSuchElementException("게시물을 찾을 수 없습니다. id=$id") }

        return PostResponse.from(post)
    }

    /*
     * TODO(A&I)
     *
     * 1. id로 기존 Entity를 조회하세요.
     * 2. 요청 DTO 값으로 Entity를 수정하세요.
     * 3. 저장 결과를 Response DTO로 변환하세요.
     */
    fun update(id: Long, request: PostUpdateRequest): PostResponse {
        val post = postRepository.findById(id)
            .orElseThrow { NoSuchElementException("게시물을 찾을 수 없습니다. id=$id") }

        post.title = request.title
        post.content = request.content
        post.author = request.author

        val updatePost = postRepository.save(post)
        return PostResponse.from(updatePost)
    }

    /*
     * TODO(A&I)
     *
     * 1. id로 삭제할 Entity를 찾으세요.
     * 2. Repository로 삭제하세요.
     */
    fun delete(id: Long) {
        postRepository.deleteById(id)
    }
}
