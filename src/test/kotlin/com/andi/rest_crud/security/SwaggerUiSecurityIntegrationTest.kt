package com.andi.rest_crud.security

import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest(
    properties = [
        "springdoc.api-docs.enabled=true",
        "springdoc.swagger-ui.enabled=true",
        "springdoc.swagger-ui.path=/swagger"
    ]
)
@AutoConfigureMockMvc
class SwaggerUiSecurityIntegrationTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    @Test
    fun `인증 없이 Swagger 진입 경로와 UI 자산에 접근할 수 있다`() {
        mockMvc.perform(get("/swagger"))
            .andExpect(status().is3xxRedirection)
            .andExpect(header().string("Location", containsString("/swagger-ui/index.html")))

        mockMvc.perform(get("/swagger-ui/index.html"))
            .andExpect(status().isOk)

        mockMvc.perform(get("/swagger-ui/swagger-initializer.js"))
            .andExpect(status().isOk)
    }

    @Test
    fun `인증 없이 OpenAPI 문서에 접근할 수 있다`() {
        mockMvc.perform(get("/v3/api-docs/swagger-config"))
            .andExpect(status().isOk)
    }
}
