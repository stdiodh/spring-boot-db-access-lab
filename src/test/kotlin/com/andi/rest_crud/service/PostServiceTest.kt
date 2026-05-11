package com.andi.rest_crud.service

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.exception.ForbiddenPostAccessException
import com.andi.rest_crud.exception.PostNotFoundException
import com.andi.rest_crud.repository.PostRepository
import com.andi.rest_crud.support.TestFixtureFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import java.util.Optional

class PostServiceTest {

    private val postRepository: PostRepository = mock(PostRepository::class.java)
    private val postService = PostService(postRepository)

    @Test
    fun `create는 현재 로그인 사용자를 작성자로 저장한다`() {
        val request = TestFixtureFactory.postCreateRequest()
        val savedPost = TestFixtureFactory.postEntity(
            id = 1L,
            title = request.title,
            content = request.content,
            author = "owner@example.com"
        )
        `when`(postRepository.save(any(PostEntity::class.java))).thenReturn(savedPost)

        val result = postService.create(request, "owner@example.com")

        assertEquals(1L, result.id)
        assertEquals(request.title, result.title)
        assertEquals(request.content, result.content)
        assertEquals("owner@example.com", result.author)
    }

    @Test
    fun `update는 작성자만 게시글을 수정한다`() {
        val post = TestFixtureFactory.postEntity(author = "owner@example.com")
        val request = TestFixtureFactory.postUpdateRequest()
        `when`(postRepository.findById(1L)).thenReturn(Optional.of(post))

        val result = postService.update(1L, request, "owner@example.com")

        assertEquals(request.title, result.title)
        assertEquals(request.content, result.content)
        assertEquals("owner@example.com", result.author)
        verify(postRepository, never()).save(any(PostEntity::class.java))
    }

    @Test
    fun `update는 작성자가 아니면 403 예외 흐름으로 보낸다`() {
        val post = TestFixtureFactory.postEntity(author = "owner@example.com")
        `when`(postRepository.findById(1L)).thenReturn(Optional.of(post))

        assertThrows(ForbiddenPostAccessException::class.java) {
            postService.update(1L, TestFixtureFactory.postUpdateRequest(), "other@example.com")
        }
    }

    @Test
    fun `delete는 없는 게시글 id면 예외 흐름을 확인한다`() {
        `when`(postRepository.findById(999L)).thenReturn(Optional.empty())

        assertThrows(PostNotFoundException::class.java) {
            postService.delete(999L, "owner@example.com")
        }
    }
}
