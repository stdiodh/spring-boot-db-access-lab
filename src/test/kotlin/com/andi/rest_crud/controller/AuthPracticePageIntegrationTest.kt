package com.andi.rest_crud.controller

import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class AuthPracticePageIntegrationTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    @Test
    fun `짧은 진입 경로는 인증 실습 페이지로 이동한다`() {
        listOf("/", "/auth-practice", "/auth-practice/").forEach { path ->
            mockMvc.perform(get(path))
                .andExpect(status().is3xxRedirection)
                .andExpect(redirectedUrl("/auth-practice/index.html"))
        }
    }

    @Test
    fun `인증 없이 인증 실습 페이지와 자산에 접근할 수 있다`() {
        mockMvc.perform(get("/auth-practice/index.html"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
            .andExpect(content().string(containsString("id=\"authForm\"")))
            .andExpect(content().string(containsString("id=\"fullToken\"")))
            .andExpect(content().string(containsString("https://www.jwt.io/#debugger-io")))

        mockMvc.perform(get("/auth-practice/styles.css"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("text/css"))

        mockMvc.perform(get("/auth-practice/app.js"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("text/javascript"))
    }
}
