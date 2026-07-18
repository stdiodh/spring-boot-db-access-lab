package com.andi.rest_crud.post.controller

import com.andi.rest_crud.auth.security.JwtTokenProvider
import com.andi.rest_crud.post.domain.PostEntity
import com.andi.rest_crud.post.repository.PostRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header

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
            PostEntity(title = "공개 게시글", content = "공개 내용", author = "owner@example.com")
        )

        mockMvc.perform(get("/posts"))
            .andExpect(status().isOk)
        mockMvc.perform(get("/posts/{id}", post.id))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.author").value("owner@example.com"))
    }

    @Test
    fun `공개 GET은 잘못된 Authorization 헤더가 있어도 접근할 수 있다`() {
        mockMvc.perform(
            get("/posts")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token")
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `존재하지 않는 게시글 GET은 404 ErrorResponse를 반환한다`() {
        mockMvc.perform(get("/posts/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.code").value("POST_NOT_FOUND"))
    }

    @Test
    fun `POST posts는 인증이 없으면 401을 반환한다`() {
        mockMvc.perform(
            post("/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"제목","content":"내용"}""")
        )
            .andExpect(status().isUnauthorized)
            .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
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
            PostEntity(title = "원래 제목", content = "원래 내용", author = "owner@example.com")
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
            PostEntity(title = "원래 제목", content = "원래 내용", author = "owner@example.com")
        )

        mockMvc.perform(
            put("/posts/{id}", post.id)
                .bearer("owner@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"수정 제목","content":"수정 내용"}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.title").value("수정 제목"))
            .andExpect(jsonPath("$.content").value("수정 내용"))
    }

    @Test
    fun `PUT posts도 title 길이와 빈 content를 검증한다`() {
        val post = postRepository.save(
            PostEntity(title = "원래 제목", content = "원래 내용", author = "owner@example.com")
        )

        mockMvc.perform(
            put("/posts/{id}", post.id)
                .bearer("owner@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"${"t".repeat(101)}","content":""}""")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.title").value("title은 100자 이하여야 합니다."))
            .andExpect(jsonPath("$.errors.content").value("content는 비어 있을 수 없습니다."))
    }

    @Test
    fun `DELETE posts는 작성자가 아니면 403을 반환한다`() {
        val post = postRepository.save(
            PostEntity(title = "원래 제목", content = "원래 내용", author = "owner@example.com")
        )

        mockMvc.perform(delete("/posts/{id}", post.id).bearer("other@example.com"))
            .andExpect(status().isForbidden)
            .andExpect(jsonPath("$.code").value("FORBIDDEN_POST_ACCESS"))
    }

    @Test
    fun `DELETE posts는 작성자면 성공한다`() {
        val post = postRepository.save(
            PostEntity(title = "원래 제목", content = "원래 내용", author = "owner@example.com")
        )

        mockMvc.perform(delete("/posts/{id}", post.id).bearer("owner@example.com"))
            .andExpect(status().isNoContent)
    }

    @Test
    fun `게시글 입력이 최대 길이를 초과하면 400을 반환한다`() {
        val content = """{"title":"${"t".repeat(101)}","content":"${"c".repeat(5001)}"}"""

        mockMvc.perform(
            post("/posts")
                .bearer("owner@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.title").value("title은 100자 이하여야 합니다."))
            .andExpect(jsonPath("$.errors.content").value("content는 5000자 이하여야 합니다."))
    }

    @Test
    fun `게시글 입력은 경계 길이까지 H2에 저장된다`() {
        mockMvc.perform(
            post("/posts")
                .bearer("owner@example.com")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"title":"${"t".repeat(100)}","content":"${"c".repeat(5000)}"}""")
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.title").value("t".repeat(100)))
            .andExpect(jsonPath("$.content").value("c".repeat(5000)))
    }

    private fun MockHttpServletRequestBuilder.bearer(email: String): MockHttpServletRequestBuilder {
        return header("Authorization", "Bearer ${jwtTokenProvider.createToken(email)}")
    }
}
