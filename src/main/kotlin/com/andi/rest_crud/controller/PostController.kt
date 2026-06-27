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

/*
 * TODO(A&I)
 *
 * 게시글 API Controller를 작성하세요.
 *
 * 필요한 API:
 * 1. GET /posts
 * 2. GET /posts/{id}
 * 3. POST /posts
 * 4. PUT /posts/{id}
 * 5. DELETE /posts/{id}
 *
 * Controller는 HTTP 요청을 받고,
 * 실제 처리 흐름은 Service에 위임해야 합니다.
 * Controller에서 Repository를 직접 호출하지 마세요.
 */
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

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: PostUpdateRequest): PostResponse {
        return postService.update(id, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long){
        postService.delete(id)
    }
}
