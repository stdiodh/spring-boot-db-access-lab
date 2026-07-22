package com.andi.rest_crud.auth.service

import com.andi.rest_crud.auth.dto.UserSignUpRequest
import com.andi.rest_crud.auth.exception.InvalidCredentialsException
import com.andi.rest_crud.auth.exception.UserAlreadyExistsException
import com.andi.rest_crud.auth.security.JwtTokenProvider
import com.andi.rest_crud.support.TestFixtureFactory
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.`when`
import org.mockito.Mockito.inOrder
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.hibernate.exception.ConstraintViolationException
import org.springframework.dao.DataIntegrityViolationException
import java.sql.SQLException
import java.util.Optional

class AuthServiceTest {
    private val userRepository = mock(UserRepository::class.java)
    private val passwordEncoder = mock(org.springframework.security.crypto.password.PasswordEncoder::class.java)
    private val jwtTokenProvider = mock(JwtTokenProvider::class.java)
    private val authService = AuthService(userRepository, passwordEncoder, jwtTokenProvider)

    @Test
    fun `중복 이메일은 BCrypt encode 전에 확인한다`() {
        `when`(userRepository.existsByEmail("student@example.com")).thenReturn(true)

        assertThrows(UserAlreadyExistsException::class.java) {
            authService.signUp(UserSignUpRequest("Student@Example.com", "password123"))
        }

        verifyNoInteractions(passwordEncoder)
    }

    @Test
    fun `회원가입은 이메일만 Locale ROOT 규칙으로 정규화하고 password는 그대로 encode한다`() {
        val rawPassword = "  password123  "
        `when`(userRepository.existsByEmail("student@example.com")).thenReturn(false)
        `when`(passwordEncoder.encode(rawPassword)).thenReturn("encoded-password")
        `when`(userRepository.saveAndFlush(any(User::class.java))).thenAnswer { it.getArgument<User>(0) }

        authService.signUp(UserSignUpRequest("STUDENT@EXAMPLE.COM", rawPassword))

        val order = inOrder(userRepository, passwordEncoder)
        order.verify(userRepository).existsByEmail("student@example.com")
        order.verify(passwordEncoder).encode(rawPassword)

        val userCaptor = ArgumentCaptor.forClass(User::class.java)
        order.verify(userRepository).saveAndFlush(userCaptor.capture())
        assertEquals("student@example.com", userCaptor.value.email)
        assertEquals("encoded-password", userCaptor.value.password)
    }

    @Test
    fun `저장 시 unique 위반은 DB 내용을 숨긴 중복 사용자 오류로 변환한다`() {
        `when`(userRepository.existsByEmail("student@example.com")).thenReturn(false)
        `when`(passwordEncoder.encode("password123")).thenReturn("encoded-password")
        val uniqueViolation = ConstraintViolationException(
            "duplicate email",
            SQLException("users_email_unique 내부 제약 정보", "23000", 1062),
            ConstraintViolationException.ConstraintKind.UNIQUE,
            "users_email_unique"
        )
        `when`(userRepository.saveAndFlush(any(User::class.java)))
            .thenThrow(DataIntegrityViolationException("users_email_unique 내부 제약 정보", uniqueViolation))

        val exception = assertThrows(UserAlreadyExistsException::class.java) {
            authService.signUp(UserSignUpRequest("student@example.com", "password123"))
        }

        assertEquals("이미 가입된 이메일입니다.", exception.message)
        assertFalse(exception.message.orEmpty().contains("users_email_unique"))
    }

    @Test
    fun `unique가 아닌 무결성 오류는 중복 사용자 오류로 바꾸지 않는다`() {
        `when`(userRepository.existsByEmail("student@example.com")).thenReturn(false)
        `when`(passwordEncoder.encode("password123")).thenReturn("encoded-password")
        val notNullViolation = ConstraintViolationException(
            "not null violation",
            SQLException("password_not_null", "23000"),
            ConstraintViolationException.ConstraintKind.NOT_NULL,
            "password_not_null"
        )
        val dataIntegrityViolation = DataIntegrityViolationException("not null violation", notNullViolation)
        `when`(userRepository.saveAndFlush(any(User::class.java))).thenThrow(dataIntegrityViolation)

        val exception = assertThrows(DataIntegrityViolationException::class.java) {
            authService.signUp(UserSignUpRequest("student@example.com", "password123"))
        }

        assertEquals(dataIntegrityViolation, exception)
    }

    @Test
    fun `로그인은 이메일을 정규화하고 access token과 만료 정보를 반환한다`() {
        TODO("AuthService.login 성공 테스트를 완성하세요.")
    }

    @Test
    fun `비밀번호가 다르면 token을 만들지 않고 인증 실패를 반환한다`() {
        TODO("AuthService.login 비밀번호 불일치 테스트를 완성하세요.")
    }
}
