package com.andi.rest_crud.post.service

import com.andi.rest_crud.post.domain.PostEntity
import com.andi.rest_crud.post.exception.PostNotFoundException
import com.andi.rest_crud.post.repository.PostRepository
import com.andi.rest_crud.support.TestFixtureFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import java.util.Optional

class PostServiceTest {
    private val postRepository = mock(PostRepository::class.java)
    private val postService = PostService(postRepository)

    @Test
    fun `게시글 생성은 principal 작성자를 저장하고 응답으로 변환한다`() {
        TODO("PostService.create 성공 테스트를 완성하세요.")
    }

    @Test
    fun `없는 게시글을 조회하면 찾을 수 없음 예외를 반환한다`() {
        TODO("PostService.getById 조회 실패 테스트를 완성하세요.")
    }
}
