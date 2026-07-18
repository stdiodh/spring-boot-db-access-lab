package com.andi.rest_crud.recovery.controller

import com.andi.rest_crud.recovery.service.AccountRecoveryService
import org.junit.jupiter.api.Test
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class AccountRecoveryControllerTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    @MockitoBean
    private lateinit var accountRecoveryService: AccountRecoveryService

    @Test
    fun `존재 여부와 무관하게 유효한 요청은 같은 202를 반환한다`() {
        listOf("known@example.com", "missing@example.com").forEach { email ->
            mockMvc.perform(
                post("/account-recovery/password-reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$email"}""")
            )
                .andExpect(status().isAccepted)

            verify(accountRecoveryService).requestPasswordReset(email)
        }
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

        verifyNoInteractions(accountRecoveryService)
    }
}
