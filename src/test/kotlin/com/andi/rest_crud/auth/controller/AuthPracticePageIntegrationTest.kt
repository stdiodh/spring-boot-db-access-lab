package com.andi.rest_crud.auth.controller

import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.not
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
    fun `자체 로그인 페이지는 LOCAL JWT와 게시글 흐름만 제공한다`() {
        mockMvc.perform(get("/auth-practice/index.html"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
            .andExpect(content().string(containsString("id=\"authForm\"")))
            .andExpect(content().string(containsString("id=\"fullToken\"")))
            .andExpect(content().string(containsString("id=\"postForm\"")))
            .andExpect(content().string(containsString("id=\"postTitle\"")))
            .andExpect(content().string(containsString("id=\"postContent\"")))
            .andExpect(content().string(containsString("id=\"postList\"")))
            .andExpect(content().string(containsString("SecurityContext Principal")))
            .andExpect(content().string(containsString("Post.author")))
            .andExpect(content().string(containsString("https://www.jwt.io/#debugger-io")))
            .andExpect(content().string(containsString("href=\"./index.html\" aria-current=\"page\"")))
            .andExpect(content().string(containsString("href=\"./oauth.html\"")))
            .andExpect(content().string(containsString("href=\"./recovery.html\"")))
            .andExpect(content().string(not(containsString("id=\"googleLoginLink\""))))
            .andExpect(content().string(not(containsString("id=\"recoveryRequestForm\""))))
    }

    @Test
    fun `Google OAuth 페이지는 공식 버튼과 내부 계정 영수증을 제공한다`() {
        mockMvc.perform(get("/auth-practice/oauth.html"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
            .andExpect(content().string(containsString("id=\"secretAirlock\"")))
            .andExpect(content().string(containsString("id=\"googleLoginLink\"")))
            .andExpect(content().string(containsString("href=\"/oauth2/authorization/google\"")))
            .andExpect(content().string(containsString("<script src=\"./redirect-bootstrap.js\"></script>")))
            .andExpect(content().string(containsString("src=\"./assets/google-g.svg\"")))
            .andExpect(content().string(containsString("id=\"oauthReceipt\"")))
            .andExpect(content().string(containsString("id=\"internalEmail\"")))
            .andExpect(content().string(containsString("id=\"passwordTransfer\"")))
            .andExpect(content().string(containsString("Google password")))
            .andExpect(content().string(containsString("GET /auth/me")))
            .andExpect(content().string(containsString("href=\"./oauth.html\" aria-current=\"page\"")))
            .andExpect(content().string(not(containsString("id=\"authForm\""))))
            .andExpect(content().string(not(containsString("id=\"recoveryRequestForm\""))))
    }

    @Test
    fun `SMTP 복구 페이지는 요청과 일회용 token 확정 흐름을 제공한다`() {
        mockMvc.perform(get("/auth-practice/recovery.html"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
            .andExpect(content().string(containsString("id=\"secretAirlock\"")))
            .andExpect(content().string(containsString("id=\"recoveryRequestForm\"")))
            .andExpect(content().string(containsString("id=\"recoveryEmail\"")))
            .andExpect(content().string(containsString("id=\"resetForm\"")))
            .andExpect(content().string(containsString("id=\"newPassword\"")))
            .andExpect(content().string(containsString("support.google.com/mail/answer/185833")))
            .andExpect(content().string(containsString("<script src=\"./redirect-bootstrap.js\"></script>")))
            .andExpect(content().string(containsString("href=\"./recovery.html\" aria-current=\"page\"")))
            .andExpect(content().string(not(containsString("id=\"authForm\""))))
            .andExpect(content().string(not(containsString("id=\"googleLoginLink\""))))
    }

    @Test
    fun `세 실습 페이지의 공통 자산과 전용 script에 인증 경계가 분리되어 있다`() {
        mockMvc.perform(get("/auth-practice/styles.css"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("text/css"))

        mockMvc.perform(get("/auth-practice/practice-common.js"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("text/javascript"))
            .andExpect(content().string(containsString("requestJson")))

        mockMvc.perform(get("/auth-practice/redirect-bootstrap.js"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("text/javascript"))
            .andExpect(content().string(containsString("window.history.replaceState")))
            .andExpect(content().string(containsString("access_token")))
            .andExpect(content().string(containsString("reset_token")))

        mockMvc.perform(get("/auth-practice/assets/google-g.svg"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("image/svg+xml"))
            .andExpect(content().string(containsString("data:image/png;base64,")))

        mockMvc.perform(get("/auth-practice/app.js"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("text/javascript"))
            .andExpect(content().string(containsString("/auth/signup")))
            .andExpect(content().string(containsString("/auth/login")))
            .andExpect(content().string(not(containsString("access_token"))))
            .andExpect(content().string(not(containsString("reset_token"))))

        mockMvc.perform(get("/auth-practice/oauth.js"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("text/javascript"))
            .andExpect(content().string(containsString("__authPracticeRedirect")))
            .andExpect(content().string(containsString("/auth/me")))
            .andExpect(content().string(containsString("payload.isNewUser === \"true\"")))
            .andExpect(content().string(containsString("payload.isNewUser === \"false\"")))

        mockMvc.perform(get("/auth-practice/recovery.js"))
            .andExpect(status().isOk)
            .andExpect(content().contentTypeCompatibleWith("text/javascript"))
            .andExpect(content().string(containsString("__authPracticeRedirect")))
            .andExpect(content().string(containsString("/account-recovery/password-reset/confirm")))
            .andExpect(content().string(containsString("RECOVERY_MAIL_AUTHENTICATION_FAILED")))
            .andExpect(content().string(containsString("evidence.setState(\"notice\"")))
    }
}
