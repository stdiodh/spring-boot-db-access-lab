package com.andi.rest_crud.service

import com.andi.rest_crud.domain.AuthProvider
import com.andi.rest_crud.exception.InvalidCredentialsException
import com.andi.rest_crud.repository.UserRepository
import com.andi.rest_crud.security.JwtTokenProvider
import com.andi.rest_crud.support.TestFixtureFactory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.argThat
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.Optional

class AuthServiceTest {

    private val userRepository: UserRepository = mock(UserRepository::class.java)
    private val passwordEncoder = BCryptPasswordEncoder()
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
    fun `signUp은 LOCAL 사용자 정책으로 저장한다`() {
        val request = TestFixtureFactory.signUpRequest()
        `when`(userRepository.existsByEmail(request.email)).thenReturn(false)
        `when`(userRepository.save(any())).thenAnswer { invocation -> invocation.arguments[0] }

        authService.signUp(request)

        verify(userRepository).save(
            argThat { user ->
                user.email == request.email &&
                    user.authProvider == AuthProvider.LOCAL &&
                    user.providerId == null &&
                    passwordEncoder.matches(request.password, user.password)
            }
        )
    }

    @Test
    fun `login은 올바른 LOCAL 이메일과 비밀번호면 access token을 만든다`() {
        val request = TestFixtureFactory.loginRequest()
        val encodedPassword = passwordEncoder.encode(request.password)
            ?: error("PasswordEncoder returned null.")
        val user = TestFixtureFactory.user(
            email = request.email,
            password = encodedPassword,
            authProvider = AuthProvider.LOCAL
        )
        `when`(userRepository.findByEmail(request.email)).thenReturn(Optional.of(user))

        val result = authService.login(request)

        assertFalse(result.accessToken.isBlank())
        assertEquals(request.email, jwtTokenProvider.getEmail(result.accessToken))
    }

    @Test
    fun `login은 OAuth 사용자의 password 로그인을 허용하지 않는다`() {
        val request = TestFixtureFactory.loginRequest()
        val oauthUser = TestFixtureFactory.user(
            email = request.email,
            password = passwordEncoder.encode(request.password)
                ?: error("PasswordEncoder returned null."),
            authProvider = AuthProvider.GOOGLE,
            providerId = "google-user-id"
        )
        `when`(userRepository.findByEmail(request.email)).thenReturn(Optional.of(oauthUser))

        assertThrows(InvalidCredentialsException::class.java) {
            authService.login(request)
        }
    }
}
