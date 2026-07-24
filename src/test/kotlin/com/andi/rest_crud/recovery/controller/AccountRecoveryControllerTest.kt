package com.andi.rest_crud.recovery.controller

import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.exception.InvalidPasswordResetTokenException
import com.andi.rest_crud.recovery.exception.RecoveryMailAuthenticationException
import com.andi.rest_crud.recovery.exception.RecoveryMailUnavailableException
import com.andi.rest_crud.recovery.mail.RecoveryMailReadiness
import com.andi.rest_crud.recovery.service.AccountRecoveryService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.any
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.inOrder
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class AccountRecoveryControllerTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    @MockitoBean
    private lateinit var accountRecoveryService: AccountRecoveryService

    @MockitoBean
    private lateinit var recoveryMailReadiness: RecoveryMailReadiness

    @Test
    fun `존재 여부와 무관하게 유효한 요청은 같은 202를 반환한다`() {
        listOf("known@example.com", "missing@example.com").forEach { email ->
            mockMvc.perform(
                post("/account-recovery/password-reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$email"}""")
            )
                .andExpect(status().isAccepted)
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
        }

        val order = inOrder(recoveryMailReadiness, accountRecoveryService)
        order.verify(recoveryMailReadiness).ensureReady()
        order.verify(accountRecoveryService).requestPasswordReset("known@example.com")
        order.verify(recoveryMailReadiness).ensureReady()
        order.verify(accountRecoveryService).requestPasswordReset("missing@example.com")
    }

    @Test
    fun `SMTP 인증 실패는 계정 조회 전에 모든 email에 같은 503을 반환한다`() {
        doThrow(RecoveryMailAuthenticationException())
            .`when`(recoveryMailReadiness)
            .ensureReady()

        listOf("known@example.com", "missing@example.com").forEach { email ->
            mockMvc.perform(
                post("/account-recovery/password-reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$email"}""")
            )
                .andExpect(status().isServiceUnavailable)
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_AUTHENTICATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Gmail 앱 비밀번호가 올바르지 않거나 사용할 수 없습니다."))
                .andExpect(jsonPath("$.errors").isEmpty)
        }

        verify(recoveryMailReadiness, times(2)).ensureReady()
        verifyNoInteractions(accountRecoveryService)
    }

    @Test
    fun `SMTP 연결 실패는 계정 조회 전에 안전한 503을 반환한다`() {
        doThrow(RecoveryMailUnavailableException())
            .`when`(recoveryMailReadiness)
            .ensureReady()

        mockMvc.perform(
            post("/account-recovery/password-reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"email":"student@example.com"}""")
        )
            .andExpect(status().isServiceUnavailable)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_UNAVAILABLE"))
            .andExpect(jsonPath("$.message").value("메일 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."))
            .andExpect(jsonPath("$.errors").isEmpty)

        verify(recoveryMailReadiness).ensureReady()
        verifyNoInteractions(accountRecoveryService)
    }

    @Test
    fun `잘못된 email 요청은 400을 반환하고 service를 호출하지 않는다`() {
        listOf(
            "",
            "not-an-email",
            "${"a".repeat(243)}@example.com"
        ).forEach { email ->
            mockMvc.perform(
                post("/account-recovery/password-reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$email"}""")
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
        }

        verifyNoInteractions(recoveryMailReadiness, accountRecoveryService)
    }

    @Test
    fun `유효한 confirm 요청은 password 변경을 위임하고 no-store 204를 반환한다`() {
        mockMvc.perform(confirmRequest("valid-token", "  new-password123  "))
            .andExpect(status().isNoContent)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))

        val requestCaptor = ArgumentCaptor.forClass(PasswordResetConfirmRequest::class.java)
        verify(accountRecoveryService).confirmPasswordReset(captureConfirmRequest(requestCaptor))
        assertEquals("valid-token", requestCaptor.value.token)
        assertEquals("  new-password123  ", requestCaptor.value.newPassword)
    }

    @Test
    fun `알 수 없거나 만료되거나 사용된 token은 같은 공개 오류를 반환한다`() {
        doThrow(InvalidPasswordResetTokenException())
            .`when`(accountRecoveryService)
            .confirmPasswordReset(anyConfirmRequest())

        mockMvc.perform(confirmRequest("valid-looking-token", "new-password123"))
            .andExpect(status().isBadRequest)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(jsonPath("$.code").value("INVALID_PASSWORD_RESET_TOKEN"))
            .andExpect(jsonPath("$.message").value("비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다."))
            .andExpect(jsonPath("$.errors").isEmpty)
    }

    @Test
    fun `confirm DTO는 token과 새 password 경계를 검증하고 service를 호출하지 않는다`() {
        listOf(
            Triple("", "new-password123", "token"),
            Triple("t".repeat(129), "new-password123", "token"),
            Triple("valid-token", "1234567", "newPassword"),
            Triple("valid-token", "p".repeat(65), "newPassword")
        ).forEach { (token, password, field) ->
            mockMvc.perform(confirmRequest(token, password))
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors.$field").exists())
        }

        verifyNoInteractions(accountRecoveryService)
    }

    private fun confirmRequest(token: String, newPassword: String) =
        post("/account-recovery/password-reset/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"token":"$token","newPassword":"$newPassword"}""")

    private fun anyConfirmRequest(): PasswordResetConfirmRequest {
        return any(PasswordResetConfirmRequest::class.java)
            ?: PasswordResetConfirmRequest("fallback-token", "fallback-password")
    }

    private fun captureConfirmRequest(
        captor: ArgumentCaptor<PasswordResetConfirmRequest>
    ): PasswordResetConfirmRequest {
        return captor.capture()
            ?: PasswordResetConfirmRequest("fallback-token", "fallback-password")
    }
}
