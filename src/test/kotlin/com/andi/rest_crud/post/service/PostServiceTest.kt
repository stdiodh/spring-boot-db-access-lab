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
        val request = TestFixtureFactory.postCreateRequest(
            title = "새 게시글",
            content = "새 게시글 내용"
        )
        val authorEmail = "writer@example.com"
        val savedPost = TestFixtureFactory.postEntity(
            id = 42L,
            title = request.title,
            content = request.content,
            author = authorEmail
        )
        `when`(postRepository.save(any(PostEntity::class.java))).thenReturn(savedPost)

        val result = postService.create(request, authorEmail)

        val postCaptor = ArgumentCaptor.forClass(PostEntity::class.java)
        verify(postRepository).save(postCaptor.capture())
        assertEquals(request.title, postCaptor.value.title)
        assertEquals(request.content, postCaptor.value.content)
        assertEquals(authorEmail, postCaptor.value.author)
        assertEquals(42L, result.id)
        assertEquals(request.title, result.title)
        assertEquals(request.content, result.content)
        assertEquals(authorEmail, result.author)
    }

    @Test
    fun `없는 게시글을 조회하면 찾을 수 없음 예외를 반환한다`() {
        `when`(postRepository.findById(999L)).thenReturn(Optional.empty<PostEntity>())

        assertThrows(PostNotFoundException::class.java) {
            postService.getById(999L)
        }

        verify(postRepository).findById(999L)
    }
}
