package com.andi.rest_crud.auth.controller

import com.andi.rest_crud.auth.security.JwtTokenProvider
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest @Autowired constructor(
    private val mockMvc: MockMvc,
    private val objectMapper: ObjectMapper,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @BeforeEach
    fun setUp() {
        userRepository.deleteAll()
    }

    @Test
    fun `회원가입에 성공하면 201을 반환한다`() {
        mockMvc.perform(signUpRequest("student@example.com", "password123"))
            .andExpect(status().isCreated)
    }

    @Test
    fun `대소문자만 다른 중복 이메일은 409를 반환한다`() {
        mockMvc.perform(signUpRequest("Student@Example.com", "password123"))
            .andExpect(status().isCreated)

        mockMvc.perform(signUpRequest("student@example.com", "password456"))
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.code").value("USER_ALREADY_EXISTS"))
            .andExpect(jsonPath("$.message").value("이미 가입된 이메일입니다."))
    }

    @Test
    fun `올바르지 않은 이메일은 400을 반환한다`() {
        mockMvc.perform(signUpRequest("not-an-email", "password123"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors.email").value("email 형식이 올바르지 않습니다."))
    }

    @Test
    fun `빈 이메일은 NotBlank 오류를 결정적으로 반환한다`() {
        mockMvc.perform(signUpRequest("", "password123"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.email").value("email은 비어 있을 수 없습니다."))
    }

    @Test
    fun `8자 미만 회원가입 비밀번호는 400을 반환한다`() {
        mockMvc.perform(signUpRequest("student@example.com", "1234567"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.password").value("password는 8자 이상 64자 이하여야 합니다."))
    }

    @Test
    fun `빈 password의 복수 오류에서는 NotBlank를 먼저 반환한다`() {
        mockMvc.perform(signUpRequest("student@example.com", ""))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.password").value("password는 비어 있을 수 없습니다."))
    }

    @Test
    fun `254자를 초과한 이메일은 400을 반환한다`() {
        val tooLongEmail =
            "${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(62)}"
        assertEquals(255, tooLongEmail.length)

        mockMvc.perform(signUpRequest(tooLongEmail, "password123"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.email").value("email은 254자 이하여야 합니다."))
    }

    @Test
    fun `64자를 초과한 비밀번호는 400을 반환한다`() {
        mockMvc.perform(signUpRequest("student@example.com", "p".repeat(65)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.password").value("password는 8자 이상 64자 이하여야 합니다."))
    }

    @Test
    fun `로그인 DTO도 email 형식과 password 최대 길이를 검증한다`() {
        mockMvc.perform(loginRequest("not-an-email", "p".repeat(65)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.email").value("email 형식이 올바르지 않습니다."))
            .andExpect(jsonPath("$.errors.password").value("password는 64자 이하여야 합니다."))
    }

    @Test
    fun `로그인 성공 응답은 토큰 정보와 no-store를 포함한다`() {
        signUp("student@example.com", "password123")

        mockMvc.perform(loginRequest("student@example.com", "password123"))
            .andExpect(status().isOk)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.expiresIn").value(3600))
    }

    @Test
    fun `OpenAPI 문서에 TokenResponse의 호환 필드가 표시된다`() {
        mockMvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.components.schemas.TokenResponse.properties.accessToken").exists())
            .andExpect(jsonPath("$.components.schemas.TokenResponse.properties.tokenType").exists())
            .andExpect(jsonPath("$.components.schemas.TokenResponse.properties.expiresIn").exists())
    }

    @Test
    fun `없는 이메일과 잘못된 비밀번호 로그인은 같은 오류를 반환한다`() {
        signUp("student@example.com", "password123")

        val unknownUserError = loginFailure("unknown@example.com", "password123")
        val wrongPasswordError = loginFailure("student@example.com", "wrong-password")

        assertEquals(unknownUserError["code"].asString(), wrongPasswordError["code"].asString())
        assertEquals(unknownUserError["message"].asString(), wrongPasswordError["message"].asString())
        assertEquals("INVALID_CREDENTIALS", unknownUserError["code"].asString())
    }

    @Test
    fun `password 앞뒤 공백은 제거하지 않는다`() {
        signUp("student@example.com", "  password123  ")

        mockMvc.perform(loginRequest("student@example.com", "  password123  "))
            .andExpect(status().isOk)
        mockMvc.perform(loginRequest("student@example.com", "password123"))
            .andExpect(status().isUnauthorized)
            .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
            .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
    }

    @Test
    fun `토큰이 없으면 auth me는 Bearer challenge와 401을 반환한다`() {
        mockMvc.perform(get("/auth/me"))
            .andExpect(status().isUnauthorized)
            .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
            .andExpect(jsonPath("$.message").value("인증이 필요합니다."))
    }

    @Test
    fun `실제 회원가입과 로그인에서 받은 토큰으로 auth me에 접근한다`() {
        signUp("Student@Example.com", "password123")
        val accessToken = login("STUDENT@EXAMPLE.COM", "password123")

        mockMvc.perform(
            get("/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $accessToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value("student@example.com"))
            .andExpect(jsonPath("$.loginMethods[0]").value("LOCAL"))
    }

    @Test
    fun `OAuth 계정은 JWT로 LOCAL 비밀번호를 한 번 등록하고 두 로그인 수단을 사용한다`() {
        val oauthUser = saveOAuthUser("oauth@example.com")
        val oauthToken = jwtTokenProvider.createToken(oauthUser.email)

        mockMvc.perform(
            post("/auth/local-password")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $oauthToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(localPasswordJson("local-password123"))
        )
            .andExpect(status().isNoContent)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))

        val enrolledUser = userRepository.findByEmail(oauthUser.email).orElseThrow()
        assertTrue(enrolledUser.localPasswordEnabled)
        assertTrue(passwordEncoder.matches("local-password123", enrolledUser.password))
        assertEquals("GOOGLE", enrolledUser.authProvider)
        assertEquals("google-subject", enrolledUser.providerId)

        val localToken = login(oauthUser.email, "local-password123")
        mockMvc.perform(
            get("/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $localToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.loginMethods[0]").value("GOOGLE"))
            .andExpect(jsonPath("$.loginMethods[1]").value("LOCAL"))

        mockMvc.perform(
            post("/auth/local-password")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $oauthToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(localPasswordJson("other-password123"))
        )
            .andExpect(status().isConflict)
            .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
            .andExpect(jsonPath("$.code").value("LOCAL_PASSWORD_ENROLLMENT_CONFLICT"))

        val unchangedUser = userRepository.findByEmail(oauthUser.email).orElseThrow()
        assertTrue(passwordEncoder.matches("local-password123", unchangedUser.password))
        assertFalse(passwordEncoder.matches("other-password123", unchangedUser.password))
    }

    @Test
    fun `LOCAL 비밀번호 등록은 인증과 신규 비밀번호 검증을 요구한다`() {
        mockMvc.perform(
            post("/auth/local-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(localPasswordJson("local-password123"))
        )
            .andExpect(status().isUnauthorized)
            .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))

        val oauthUser = saveOAuthUser("oauth@example.com")
        val oauthToken = jwtTokenProvider.createToken(oauthUser.email)

        mockMvc.perform(
            post("/auth/local-password")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $oauthToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(localPasswordJson("1234567"))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errors.newPassword")
                .value("newPassword는 8자 이상 64자 이하여야 합니다."))
    }

    @Test
    fun `기존 LOCAL 계정은 OAuth 전용 최초 비밀번호 등록 API를 사용할 수 없다`() {
        signUp("local@example.com", "password123")
        val localToken = login("local@example.com", "password123")

        mockMvc.perform(
            post("/auth/local-password")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $localToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(localPasswordJson("other-password123"))
        )
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.code").value("LOCAL_PASSWORD_ENROLLMENT_CONFLICT"))
    }

    @Test
    fun `변조된 토큰은 401을 반환한다`() {
        signUp("student@example.com", "password123")
        val tamperedToken = tamperSignature(login("student@example.com", "password123"))

        expectUnauthorized(tamperedToken)
    }

    @Test
    fun `만료된 토큰은 401을 반환한다`() {
        val issuedInPast = Clock.fixed(Instant.now().minusSeconds(120), ZoneOffset.UTC)
        val expiredToken = JwtTokenProvider(
            secret = TEST_SECRET,
            expirationMs = 1_000,
            issuer = TEST_ISSUER,
            audience = TEST_AUDIENCE,
            clock = issuedInPast
        ).createToken("student@example.com")

        expectUnauthorized(expiredToken)
    }

    @Test
    fun `빈 Bearer 토큰은 401을 반환한다`() {
        mockMvc.perform(
            get("/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer ")
        )
            .andExpect(status().isUnauthorized)
            .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
            .andExpect(jsonPath("$.message").value("인증이 필요합니다."))
    }

    @Test
    fun `잘못된 JSON은 400을 반환한다`() {
        mockMvc.perform(
            post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.code").value("MALFORMED_JSON"))
    }

    private fun signUp(email: String, password: String) {
        mockMvc.perform(signUpRequest(email, password))
            .andExpect(status().isCreated)
    }

    private fun login(email: String, password: String): String {
        val response = mockMvc.perform(loginRequest(email, password))
            .andExpect(status().isOk)
            .andReturn()
            .response

        return objectMapper.readTree(response.contentAsString)["accessToken"].asString()
    }

    private fun loginFailure(email: String, password: String): JsonNode {
        val response = mockMvc.perform(loginRequest(email, password))
            .andExpect(status().isUnauthorized)
            .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
            .andReturn()
            .response

        return objectMapper.readTree(response.contentAsString)
    }

    private fun signUpRequest(email: String, password: String) =
        post("/auth/signup")
            .contentType(MediaType.APPLICATION_JSON)
            .content(authJson(email, password))

    private fun loginRequest(email: String, password: String) =
        post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(authJson(email, password))

    private fun authJson(email: String, password: String): String {
        return objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
    }

    private fun localPasswordJson(newPassword: String): String {
        return objectMapper.writeValueAsString(mapOf("newPassword" to newPassword))
    }

    private fun saveOAuthUser(email: String): User {
        return userRepository.saveAndFlush(
            User(
                email = email,
                password = requireNotNull(passwordEncoder.encode("server-generated-placeholder")),
                authProvider = "GOOGLE",
                providerId = "google-subject",
                localPasswordEnabled = false
            )
        )
    }

    private fun expectUnauthorized(token: String) {
        mockMvc.perform(
            get("/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $token")
        )
            .andExpect(status().isUnauthorized)
            .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
            .andExpect(jsonPath("$.message").value("인증이 필요합니다."))
    }

    private fun tamperSignature(token: String): String {
        val parts = token.split('.')
        val signature = parts[2]
        val replacement = if (signature.first() == 'a') 'b' else 'a'
        return "${parts[0]}.${parts[1]}.$replacement${signature.drop(1)}"
    }

    private companion object {
        const val TEST_SECRET = "test-only-secret-key-for-hs256-at-least-32-bytes"
        const val TEST_ISSUER = "spring-boot-db-access-lab-test"
        const val TEST_AUDIENCE = "spring-boot-db-access-lab-test-api"
    }
}
