package com.andi.rest_crud.controller

import com.andi.rest_crud.service.PostService

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
class PostController(
    private val postService: PostService
)
