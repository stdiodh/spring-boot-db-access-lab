package com.andi.rest_crud.auth.service

import com.andi.rest_crud.auth.dto.LocalPasswordEnrollmentRequest
import com.andi.rest_crud.auth.exception.InvalidCredentialsException
import com.andi.rest_crud.auth.exception.LocalPasswordEnrollmentConflictException
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.Optional

class LocalPasswordEnrollmentServiceTest {
    private val userRepository = mock(UserRepository::class.java)
    private val passwordEncoder = mock(PasswordEncoder::class.java)
    private val service = LocalPasswordEnrollmentService(userRepository, passwordEncoder)

    @Test
    fun `GOOGLE 계정은 principal로 잠근 뒤 LOCAL 비밀번호를 한 번 등록한다`() {
        val user = googleUser()
        `when`(userRepository.findByEmailForUpdate("student@example.com")).thenReturn(Optional.of(user))
        `when`(passwordEncoder.encode("  local-password123  ")).thenReturn("encoded-local-password")
        `when`(userRepository.saveAndFlush(user)).thenReturn(user)

        service.enroll(
            "STUDENT@EXAMPLE.COM",
            LocalPasswordEnrollmentRequest("  local-password123  ")
        )

        verify(userRepository).findByEmailForUpdate("student@example.com")
        verify(passwordEncoder).encode("  local-password123  ")
        verify(userRepository).saveAndFlush(user)
        assertEquals("encoded-local-password", user.password)
        assertTrue(user.localPasswordEnabled)
        assertEquals("GOOGLE", user.authProvider)
        assertEquals("google-subject", user.providerId)
    }

    @Test
    fun `이미 등록한 GOOGLE 계정은 409 대상이고 기존 hash를 덮어쓰지 않는다`() {
        val user = googleUser(localPasswordEnabled = true)
        `when`(userRepository.findByEmailForUpdate(user.email)).thenReturn(Optional.of(user))

        assertThrows(LocalPasswordEnrollmentConflictException::class.java) {
            service.enroll(user.email, LocalPasswordEnrollmentRequest("new-password123"))
        }

        assertEquals("encoded-random-password", user.password)
        verifyNoInteractions(passwordEncoder)
        verify(userRepository, never()).saveAndFlush(user)
    }

    @Test
    fun `LOCAL 계정은 별도 최초 등록 API를 사용할 수 없다`() {
        val user = User(
            id = 2L,
            email = "local@example.com",
            password = "encoded-password",
            authProvider = "LOCAL",
            localPasswordEnabled = true
        )
        `when`(userRepository.findByEmailForUpdate(user.email)).thenReturn(Optional.of(user))

        assertThrows(LocalPasswordEnrollmentConflictException::class.java) {
            service.enroll(user.email, LocalPasswordEnrollmentRequest("new-password123"))
        }

        verifyNoInteractions(passwordEncoder)
        assertTrue(user.localPasswordEnabled)
    }

    @Test
    fun `JWT subject에 해당하는 계정이 없으면 인증 실패로 끝난다`() {
        `when`(userRepository.findByEmailForUpdate("missing@example.com")).thenReturn(Optional.empty())

        assertThrows(InvalidCredentialsException::class.java) {
            service.enroll("missing@example.com", LocalPasswordEnrollmentRequest("new-password123"))
        }

        verifyNoInteractions(passwordEncoder)
    }

    private fun googleUser(localPasswordEnabled: Boolean = false): User {
        return User(
            id = 1L,
            email = "student@example.com",
            password = "encoded-random-password",
            authProvider = "GOOGLE",
            providerId = "google-subject",
            localPasswordEnabled = localPasswordEnabled
        )
    }
}
