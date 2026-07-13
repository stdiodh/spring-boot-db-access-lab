package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.repository.PostRepository
import com.andi.rest_crud.support.TestFixtureFactory
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock

class PostServiceTest {

    private val postRepository: PostRepository = mock(PostRepository::class.java)
    private val postService = PostService(postRepository)

    @Test
    fun `create는 요청 값을 저장하고 응답으로 돌려준다`() {
        // TODO 1. given: postCreateRequest()로 요청 DTO를 준비하세요.
        val request = TestFixtureFactory.postCreateRequest()

        // TODO 2. given: 저장 후 돌아올 게시글 Entity를 준비하세요.
        val savedPost = TestFixtureFactory.postEntity(
            id = 1L,
            title = request.title,
            content = request.content,
            author = "owner@example.com"
        )

        // TODO 3. given: postRepository.save(...)가 savedPost를 돌려주게 mock을 설정하세요.

        // TODO 4. when: 인증된 사용자 email과 함께 postService.create(...)를 호출하세요.
        postService.create(request, "owner@example.com")

        // TODO 5. then: id, title, content, author가 기대값과 같은지 검증하세요.
    }

    @Test
    fun `getById는 없는 게시글 id면 예외 흐름을 확인한다`() {
        // TODO 1. given: postRepository.findById(999L)가 빈 결과를 돌려주게 설정하세요.

        // TODO 2. when + then: postService.getById(999L) 호출 시 예외가 발생하는지 확인하세요.
    }
}
