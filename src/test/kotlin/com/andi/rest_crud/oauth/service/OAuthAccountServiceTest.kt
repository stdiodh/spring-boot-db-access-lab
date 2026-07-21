package com.andi.rest_crud.oauth.service

import com.andi.rest_crud.auth.security.JwtTokenProvider
import com.andi.rest_crud.oauth.exception.OAuthAccountCreationConflictException
import com.andi.rest_crud.oauth.exception.OAuthAccountLinkRequiredException
import com.andi.rest_crud.oauth.exception.OAuthProfileRejectedException
import com.andi.rest_crud.oauth.model.OAuthUserProfile
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import jakarta.persistence.Table
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.hibernate.exception.ConstraintViolationException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.crypto.password.PasswordEncoder
import java.sql.SQLException
import java.util.Optional

class OAuthAccountServiceTest {
    private val userRepository = mock(UserRepository::class.java)
    private val jwtTokenProvider = mock(JwtTokenProvider::class.java)
    private val passwordEncoder = mock(PasswordEncoder::class.java)
    private val service = OAuthAccountService(userRepository, jwtTokenProvider, passwordEncoder)

    @Test
    fun `신규 계정은 provider id email을 정규화해 flush 저장하고 JWT를 발급한다`() {
        `when`(userRepository.findByAuthProviderAndProviderId("GOOGLE", "provider-1"))
            .thenReturn(Optional.empty())
        `when`(userRepository.existsByEmail("student@example.com")).thenReturn(false)
        `when`(passwordEncoder.encode(anyString())).thenReturn("encoded-random-password")
        `when`(userRepository.saveAndFlush(any(User::class.java))).thenAnswer { it.getArgument<User>(0) }
        `when`(jwtTokenProvider.createToken("student@example.com")).thenReturn("issued-token")

        val result = service.handleOAuthLogin(
            OAuthUserProfile(" google ", " provider-1 ", " Student@Example.COM ", true)
        )

        val captor = ArgumentCaptor.forClass(User::class.java)
        verify(userRepository).saveAndFlush(captor.capture())
        assertEquals("GOOGLE", captor.value.authProvider)
        assertEquals("provider-1", captor.value.providerId)
        assertEquals("student@example.com", captor.value.email)
        assertEquals("encoded-random-password", captor.value.password)
        assertEquals("issued-token", result.accessToken)
        assertEquals("GOOGLE", result.provider)
        assertEquals(true, result.isNewUser)
    }

    @Test
    fun `검증되지 않았거나 DB 길이 계약을 넘는 프로필은 저장소 호출 전에 거부한다`() {
        val rejectedProfiles = listOf(
            OAuthUserProfile("google", "provider-1", "student@example.com", false),
            OAuthUserProfile("g".repeat(33), "provider-1", "student@example.com", true),
            OAuthUserProfile("google", "p".repeat(256), "student@example.com", true),
            OAuthUserProfile("google", "provider-1", "a".repeat(243) + "@example.com", true)
        )

        rejectedProfiles.forEach { profile ->
            assertThrows(OAuthProfileRejectedException::class.java) {
                service.handleOAuthLogin(profile)
            }
        }

        verifyNoInteractions(userRepository, passwordEncoder, jwtTokenProvider)
    }

    @Test
    fun `기존 LOCAL email은 자동 연결하지 않고 명시적 연결 상태를 반환한다`() {
        `when`(userRepository.findByAuthProviderAndProviderId("GOOGLE", "provider-1"))
            .thenReturn(Optional.empty())
        `when`(userRepository.existsByEmail("student@example.com")).thenReturn(true)

        assertThrows(OAuthAccountLinkRequiredException::class.java) {
            service.handleOAuthLogin(
                OAuthUserProfile("google", "provider-1", "student@example.com", true)
            )
        }

        verify(userRepository, never()).saveAndFlush(any(User::class.java))
        verifyNoInteractions(passwordEncoder, jwtTokenProvider)
    }

    @Test
    fun `기존 provider 계정은 외부 email 변경값으로 내부 email을 갱신하지 않는다`() {
        val existingUser = User(
            email = "original@example.com",
            password = "encoded-password",
            authProvider = "GOOGLE",
            providerId = "provider-1"
        )
        `when`(userRepository.findByAuthProviderAndProviderId("GOOGLE", "provider-1"))
            .thenReturn(Optional.of(existingUser))
        `when`(jwtTokenProvider.createToken("original@example.com")).thenReturn("issued-token")

        val result = service.handleOAuthLogin(
            OAuthUserProfile("google", "provider-1", "changed@example.com", true)
        )

        assertEquals("original@example.com", existingUser.email)
        assertEquals("original@example.com", result.email)
        assertEquals("issued-token", result.accessToken)
        assertEquals(false, result.isNewUser)
        verify(userRepository, never()).existsByEmail(anyString())
        verify(userRepository, never()).saveAndFlush(any(User::class.java))
        verifyNoInteractions(passwordEncoder)
    }

    @Test
    fun `동시 신규 가입 unique 충돌은 내부 제약을 숨긴 도메인 오류로 변환한다`() {
        `when`(userRepository.findByAuthProviderAndProviderId("GOOGLE", "provider-1"))
            .thenReturn(Optional.empty())
        `when`(userRepository.existsByEmail("student@example.com")).thenReturn(false)
        `when`(passwordEncoder.encode(anyString())).thenReturn("encoded-random-password")
        val uniqueViolation = ConstraintViolationException(
            "duplicate OAuth identity",
            SQLException("uk_users_auth_provider_provider_id 내부 정보", "23000", 1062),
            ConstraintViolationException.ConstraintKind.UNIQUE,
            "uk_users_auth_provider_provider_id"
        )
        `when`(userRepository.saveAndFlush(any(User::class.java))).thenThrow(
            DataIntegrityViolationException("uk_users_auth_provider_provider_id 내부 정보", uniqueViolation)
        )

        val exception = assertThrows(OAuthAccountCreationConflictException::class.java) {
            service.handleOAuthLogin(
                OAuthUserProfile("google", "provider-1", "student@example.com", true)
            )
        }

        assertEquals("OAuth 계정을 만들지 못했습니다. 다시 로그인해 주세요.", exception.message)
        assertFalse(exception.message.orEmpty().contains("uk_users"))
        verifyNoInteractions(jwtTokenProvider)
    }

    @Test
    fun `provider와 provider id 조합은 DB unique 제약을 가진다`() {
        val table = requireNotNull(User::class.java.getAnnotation(Table::class.java))
        val constraint = requireNotNull(
            table.uniqueConstraints.firstOrNull { it.name == "uk_users_auth_provider_provider_id" }
        )

        assertArrayEquals(arrayOf("auth_provider", "provider_id"), constraint.columnNames)
    }
}
