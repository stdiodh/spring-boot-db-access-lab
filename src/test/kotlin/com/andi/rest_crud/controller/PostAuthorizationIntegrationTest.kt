package com.andi.rest_crud.controller

import com.andi.rest_crud.domain.PostEntity
import com.andi.rest_crud.repository.PostRepository
import com.andi.rest_crud.security.JwtTokenProvider
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class PostAuthorizationIntegrationTest @Autowired constructor(
    private val mockMvc: MockMvc,
    private val postRepository: PostRepository,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @BeforeEach
    fun setUp() {
        postRepository.deleteAll()
    }

    @Test
    fun `GET posts는 인증 없이 접근할 수 있다`() {
        val post = postRepository.save(
            PostEntity(
                title = "공개 게시글",
                content = "누구나 조회할 수 있습니다.",
                author = "owner@example.com"
            )
        )

        mockMvc.perform(get("/posts"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].author").value("owner@example.com"))

        mockMvc.perform(get("/posts/{id}", post.id))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.title").value("공개 게시글"))
    }

    @Test
    fun `POST posts는 인증이 없으면 401을 반환한다`() {
        mockMvc.perform(
            post("/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"제목","content":"내용"}""")
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `POST posts는 validation 실패 시 400을 반환한다`() {
        mockMvc.perform(
            post("/posts")
                .bearer("owner@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"","content":"내용"}""")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
    }

    @Test
    fun `POST posts는 인증된 사용자를 작성자로 저장한다`() {
        mockMvc.perform(
            post("/posts")
                .bearer("owner@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"제목","content":"내용"}""")
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.author").value("owner@example.com"))
    }

    @Test
    fun `PUT posts는 작성자가 아니면 403을 반환한다`() {
        val post = postRepository.save(
            PostEntity(
                title = "원래 제목",
                content = "원래 내용",
                author = "owner@example.com"
            )
        )

        mockMvc.perform(
            put("/posts/{id}", post.id)
                .bearer("other@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"수정 제목","content":"수정 내용"}""")
        )
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("$.code").value("FORBIDDEN_POST_ACCESS"))
    }

    @Test
    fun `PUT posts는 작성자면 성공한다`() {
        val post = postRepository.save(
            PostEntity(
                title = "원래 제목",
                content = "원래 내용",
                author = "owner@example.com"
            )
        )

        mockMvc.perform(
            put("/posts/{id}", post.id)
                .bearer("owner@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"수정 제목","content":"수정 내용"}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.title").value("수정 제목"))
            .andExpect(jsonPath("$.author").value("owner@example.com"))
    }

    @Test
    fun `DELETE posts는 작성자가 아니면 403을 반환한다`() {
        val post = postRepository.save(
            PostEntity(
                title = "원래 제목",
                content = "원래 내용",
                author = "owner@example.com"
            )
        )

        mockMvc.perform(
            delete("/posts/{id}", post.id)
                .bearer("other@example.com")
        )
            .andExpect(status().isForbidden)
    }

    @Test
    fun `DELETE posts는 작성자면 성공한다`() {
        val post = postRepository.save(
            PostEntity(
                title = "원래 제목",
                content = "원래 내용",
                author = "owner@example.com"
            )
        )

        mockMvc.perform(
            delete("/posts/{id}", post.id)
                .bearer("owner@example.com")
        )
            .andExpect(status().isNoContent)
    }

    private fun MockHttpServletRequestBuilder.bearer(email: String): MockHttpServletRequestBuilder {
        return header("Authorization", "Bearer ${jwtTokenProvider.createToken(email)}")
    }
}
