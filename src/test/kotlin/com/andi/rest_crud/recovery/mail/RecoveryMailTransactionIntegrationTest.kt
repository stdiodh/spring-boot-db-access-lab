package com.andi.rest_crud.recovery.mail

import com.andi.rest_crud.recovery.exception.RecoveryMailAuthenticationException
import com.andi.rest_crud.recovery.repository.PasswordResetTokenRepository
import com.andi.rest_crud.recovery.security.PasswordResetTokenCodec
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.doAnswer
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.reset
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.mail.MailAuthenticationException
import org.springframework.mail.MailSendException
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.support.TransactionSynchronizationManager

@SpringBootTest
@AutoConfigureMockMvc
class RecoveryMailTransactionIntegrationTest @Autowired constructor(
    private val mockMvc: MockMvc,
    private val userRepository: UserRepository,
    private val tokenRepository: PasswordResetTokenRepository,
    private val tokenCodec: PasswordResetTokenCodec
) {

    @MockitoBean
    private lateinit var recoveryMailSender: RecoveryMailSender

    @BeforeEach
    fun setUp() {
        clearDatabase()
        reset(recoveryMailSender)
    }

    @AfterEach
    fun tearDown() {
        clearDatabase()
    }

    @Test
    fun `SMTP 호출 시점에는 reset token이 이미 commit되어 있다`() {
        userRepository.saveAndFlush(localUser())
        doAnswer { invocation ->
            assertFalse(TransactionSynchronizationManager.isActualTransactionActive())
            val resetLink = invocation.getArgument<String>(1)
            val rawToken = resetLink.substringAfter("#reset_token=")
            assertTrue(tokenRepository.findByTokenHash(tokenCodec.hash(rawToken)).isPresent)
            null
        }.`when`(recoveryMailSender).sendPasswordResetMail(anyString(), anyString())

        mockMvc.perform(passwordResetRequest())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_SENT"))

        assertEquals(1, tokenRepository.count())
    }

    @Test
    fun `SMTP 전송 실패는 424를 반환하고 이번 요청의 미사용 token을 정리한다`() {
        userRepository.saveAndFlush(localUser())
        doThrow(RecoveryMailDeliveryException(MailSendException("smtp unavailable")))
            .`when`(recoveryMailSender)
            .sendPasswordResetMail(anyString(), anyString())

        mockMvc.perform(passwordResetRequest())
            .andExpect(status().`is`(424))
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_DELIVERY_FAILED"))

        assertEquals(0, tokenRepository.count())
    }

    @Test
    fun `SMTP 인증 실패도 424를 반환하고 이번 요청의 미사용 token을 정리한다`() {
        userRepository.saveAndFlush(localUser())
        doThrow(
            RecoveryMailAuthenticationException(
                MailAuthenticationException("535 sensitive smtp detail")
            )
        ).`when`(recoveryMailSender).sendPasswordResetMail(anyString(), anyString())

        mockMvc.perform(passwordResetRequest())
            .andExpect(status().`is`(424))
            .andExpect(jsonPath("$.code").value("RECOVERY_MAIL_AUTHENTICATION_FAILED"))

        assertEquals(0, tokenRepository.count())
    }

    private fun passwordResetRequest() =
        post("/account-recovery/password-reset")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"email":"student@example.com"}""")

    private fun localUser() = User(
        email = "student@example.com",
        password = "encoded-password",
        authProvider = "LOCAL"
    )

    private fun clearDatabase() {
        tokenRepository.deleteAllInBatch()
        userRepository.deleteAllInBatch()
    }
}
