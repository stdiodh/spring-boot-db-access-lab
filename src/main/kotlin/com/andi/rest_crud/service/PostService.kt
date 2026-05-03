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
        val post = postRepository.findById(id)
            .orElseThrow { NoSuchElementException("Post not found. id=$id") }

        return PostResponse.from(post)
    }

    fun update(id: Long, request: PostUpdateRequest): PostResponse {
        val post = postRepository.findById(id)
            .orElseThrow { NoSuchElementException("Post not found. id=$id") }

        post.title = request.title
        post.content = request.content
        post.author = request.author

        val updatedPost = postRepository.save(post)
        return PostResponse.from(updatedPost)
    }

    fun delete(id: Long) {
        postRepository.deleteById(id)
    }
}
