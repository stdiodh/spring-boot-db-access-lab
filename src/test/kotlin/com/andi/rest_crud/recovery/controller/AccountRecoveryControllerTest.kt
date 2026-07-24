package com.andi.rest_crud.recovery.controller

import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.exception.InvalidPasswordResetTokenException
import com.andi.rest_crud.recovery.exception.RecoveryMailAuthenticationException
import com.andi.rest_crud.recovery.exception.RecoveryMailCooldownException
import com.andi.rest_crud.recovery.exception.RecoveryMailNotSentException
import com.andi.rest_crud.recovery.mail.PasswordResetMailCommand
import com.andi.rest_crud.recovery.mail.RecoveryMailDeliveryException
import com.andi.rest_crud.recovery.mail.RecoveryMailDispatcher
import com.andi.rest_crud.recovery.service.AccountRecoveryService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.any
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.inOrder
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.mail.MailAuthenticationException
import org.springframework.mail.MailSendException
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
    private lateinit var recoveryMailDispatcher: RecoveryMailDispatcher

    @Test
    fun `SMTP 발송이 정상 반환되면 no-store 200과 성공 코드를 반환한다`() {
        val command = mailCommand()
        `when`(accountRecoveryService.requestPasswordReset("student@example.com")).thenReturn(command)

        mockMvc.perform(passwordResetRequest("student@example.com"))
            .andExpect(status().isOk)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_SENT"))
            .andExpect(
                jsonPath("$.message")
                    .value("SMTP 서버가 비밀번호 재설정 메일 요청을 수락했습니다.")
            )

        val order = inOrder(accountRecoveryService, recoveryMailDispatcher)
        order.verify(accountRecoveryService).requestPasswordReset("student@example.com")
        order.verify(recoveryMailDispatcher).dispatch(command)
    }

    @Test
    fun `복구할 수 없는 계정은 no-store 422와 공통 미발송 코드를 반환한다`() {
        doThrow(RecoveryMailNotSentException())
            .`when`(accountRecoveryService)
            .requestPasswordReset("student@example.com")

        mockMvc.perform(passwordResetRequest("student@example.com"))
            .andExpect(status().`is`(422))
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_NOT_SENT"))
            .andExpect(jsonPath("$.message").value("비밀번호 재설정 메일을 보낼 수 없는 계정입니다."))
            .andExpect(jsonPath("$.errors").isEmpty)

        verifyNoInteractions(recoveryMailDispatcher)
    }

    @Test
    fun `cooldown은 no-store 429와 Retry-After를 반환한다`() {
        doThrow(RecoveryMailCooldownException(37))
            .`when`(accountRecoveryService)
            .requestPasswordReset("student@example.com")

        mockMvc.perform(passwordResetRequest("student@example.com"))
            .andExpect(status().isTooManyRequests)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(header().string(HttpHeaders.RETRY_AFTER, "37"))
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_COOLDOWN"))
            .andExpect(jsonPath("$.errors").isEmpty)

        verifyNoInteractions(recoveryMailDispatcher)
    }

    @Test
    fun `SMTP 인증 실패는 token을 정리하고 no-store 424를 반환한다`() {
        val command = mailCommand()
        `when`(accountRecoveryService.requestPasswordReset("student@example.com")).thenReturn(command)
        doThrow(
            RecoveryMailAuthenticationException(
                MailAuthenticationException(
                    "535 student@example.com ${command.tokenHash} ${command.resetLink}"
                )
            )
        )
            .`when`(recoveryMailDispatcher)
            .dispatch(command)

        val responseBody = mockMvc.perform(passwordResetRequest("student@example.com"))
            .andExpect(status().`is`(424))
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_AUTHENTICATION_FAILED"))
            .andExpect(jsonPath("$.message").value("Gmail 앱 비밀번호가 올바르지 않거나 사용할 수 없습니다."))
            .andExpect(jsonPath("$.errors").isEmpty)
            .andReturn()
            .response
            .contentAsString

        listOf("535", "student@example.com", command.tokenHash, command.resetLink).forEach { sensitiveValue ->
            assertFalse(responseBody.contains(sensitiveValue))
        }

        verify(accountRecoveryService).discardUndeliveredToken(command.tokenId, command.tokenHash)
    }

    @Test
    fun `SMTP 전송 실패는 token을 정리하고 no-store 424를 반환한다`() {
        val command = mailCommand()
        val deliveryException = RecoveryMailDeliveryException(MailSendException("sensitive smtp cause"))
        `when`(accountRecoveryService.requestPasswordReset("student@example.com")).thenReturn(command)
        doThrow(deliveryException).`when`(recoveryMailDispatcher).dispatch(command)

        mockMvc.perform(passwordResetRequest("student@example.com"))
            .andExpect(status().`is`(424))
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_DELIVERY_FAILED"))
            .andExpect(jsonPath("$.message").value("비밀번호 재설정 메일을 전송하지 못했습니다."))
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("sensitive"))))
            .andExpect(jsonPath("$.errors").isEmpty)

        verify(accountRecoveryService).discardUndeliveredToken(command.tokenId, command.tokenHash)
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

        verifyNoInteractions(accountRecoveryService, recoveryMailDispatcher)
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

    private fun passwordResetRequest(email: String) =
        post("/account-recovery/password-reset")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"email":"$email"}""")

    private fun mailCommand() = PasswordResetMailCommand(
        tokenId = 7L,
        tokenHash = "a".repeat(64),
        recipientEmail = "student@example.com",
        resetLink = "https://frontend.example/reset#reset_token=opaque-token"
    )

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
