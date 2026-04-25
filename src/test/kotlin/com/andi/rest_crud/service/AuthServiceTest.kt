package com.andi.rest_crud.service

import com.andi.rest_crud.repository.UserRepository
import com.andi.rest_crud.security.JwtTokenProvider
import com.andi.rest_crud.security.PasswordConfig
import com.andi.rest_crud.support.TestFixtureFactory
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock

class AuthServiceTest {

    private val userRepository: UserRepository = mock(UserRepository::class.java)
    private val passwordEncoder = PasswordConfig().passwordEncoder()
    private val jwtTokenProvider = JwtTokenProvider(
        secret = "change-this-secret-for-sequence-04-change-this-secret",
        expirationMs = 3600000L
    )
    private val authService = AuthService(
        userRepository = userRepository,
        passwordEncoder = passwordEncoder,
        jwtTokenProvider = jwtTokenProvider
    )

    @Test
    @Disabled("TODO를 채운 뒤 제거하고 다시 실행하세요.")
    fun `login은 올바른 이메일과 비밀번호면 access token을 만든다`() {
        // TODO 1. given: loginRequest()로 로그인 요청을 준비하세요.
        val request = TestFixtureFactory.loginRequest()

        // TODO 2. given: passwordEncoder.encode(...)로 저장된 사용자 비밀번호를 준비하세요.
        // TODO 3. given: user fixture를 만들고 userRepository.findByEmail(...) mock을 설정하세요.

        // TODO 4. when: authService.login(request)를 호출하세요.
        authService.login(request)

        // TODO 5. then: accessToken이 비어 있지 않은지, 토큰 안 email이 기대값과 같은지 검증하세요.
    }

    @Test
    @Disabled("TODO를 채운 뒤 제거하고 다시 실행하세요.")
    fun `login은 비밀번호가 다르면 실패 예외를 확인한다`() {
        // TODO 1. given: 저장된 사용자와 잘못된 비밀번호 요청을 각각 준비하세요.
        // TODO 2. given: userRepository.findByEmail(...) mock을 설정하세요.
        // TODO 3. when + then: authService.login(...) 호출 시 예외가 발생하는지 확인하세요.
    }
}
