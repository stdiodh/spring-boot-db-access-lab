package com.andi.rest_crud.controller

import com.andi.rest_crud.dto.PostCreateRequest
import com.andi.rest_crud.dto.PostResponse
import com.andi.rest_crud.dto.PostUpdateRequest
import com.andi.rest_crud.service.PostService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/posts")
class PostController(
    private val postService: PostService
) {

    @GetMapping
    fun getAll(): List<PostResponse> {
        return postService.getAll()
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): PostResponse {
        return postService.getById(id)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody request: PostCreateRequest): PostResponse {
        return postService.create(request)
    }

    // TODO(A&I) 1. PUT /posts/{id}를 Service update 흐름과 연결하세요.
    // TODO(A&I) 2. Controller에서 DB 저장 로직을 직접 처리하지 마세요.
    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: PostUpdateRequest): PostResponse {
        return postService.update(id, request)
    }

    // TODO(A&I) 1. DELETE /posts/{id}를 Service delete 흐름과 연결하세요.
    // TODO(A&I) 2. 성공 시 204 No Content를 유지하세요.
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) {
        postService.delete(id)
    }
}
