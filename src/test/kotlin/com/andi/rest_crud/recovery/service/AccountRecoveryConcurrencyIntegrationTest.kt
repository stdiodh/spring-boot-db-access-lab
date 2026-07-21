package com.andi.rest_crud.recovery.service

import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.exception.InvalidPasswordResetTokenException
import com.andi.rest_crud.recovery.mail.RecoveryMailSender
import com.andi.rest_crud.recovery.repository.PasswordResetTokenRepository
import com.andi.rest_crud.recovery.security.PasswordResetTokenCodec
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers
import org.mockito.Mockito.after
import org.mockito.Mockito.reset
import org.mockito.Mockito.timeout
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.bean.override.mockito.MockitoBean
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@SpringBootTest
class AccountRecoveryConcurrencyIntegrationTest @Autowired constructor(
    private val accountRecoveryService: AccountRecoveryService,
    private val userRepository: UserRepository,
    private val tokenRepository: PasswordResetTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenCodec: PasswordResetTokenCodec
) {

    @MockitoBean
    private lateinit var recoveryMailSender: RecoveryMailSender

    @BeforeEach
    fun setUp() {
        tokenRepository.deleteAll()
        userRepository.deleteAll()
        reset(recoveryMailSender)
    }

    @Test
    fun `동시 재설정 요청은 한 token row와 한 mail event만 만든다`() {
        userRepository.saveAndFlush(localUser())

        val results = runConcurrently(
            { accountRecoveryService.requestPasswordReset("student@example.com") },
            { accountRecoveryService.requestPasswordReset("STUDENT@EXAMPLE.COM") }
        )

        assertTrue(results.all { it.isSuccess })
        assertEquals(1, tokenRepository.count())
        verify(recoveryMailSender, timeout(2_000).times(1))
            .sendPasswordResetMail(eqString("student@example.com"), anyString())
        verify(recoveryMailSender, after(300).times(1))
            .sendPasswordResetMail(eqString("student@example.com"), anyString())
    }

    @Test
    fun `같은 token의 동시 confirm은 한 password 변경만 성공하고 replay는 공개 오류로 끝난다`() {
        val user = userRepository.saveAndFlush(localUser())
        accountRecoveryService.requestPasswordReset(user.email)
        val linkCaptor = ArgumentCaptor.forClass(String::class.java)
        verify(recoveryMailSender, timeout(2_000))
            .sendPasswordResetMail(eqString(user.email), captureString(linkCaptor))
        val rawToken = linkCaptor.value.substringAfter("#reset_token=")
        val firstPassword = "first-password123"
        val secondPassword = "second-password123"

        val results = runConcurrently(
            {
                accountRecoveryService.confirmPasswordReset(
                    PasswordResetConfirmRequest(rawToken, firstPassword)
                )
            },
            {
                accountRecoveryService.confirmPasswordReset(
                    PasswordResetConfirmRequest(rawToken, secondPassword)
                )
            }
        )

        assertEquals(1, results.count { it.isSuccess })
        val failure = results.single { it.isFailure }.exceptionOrNull()
        assertTrue(failure is InvalidPasswordResetTokenException)
        val savedUser = userRepository.findById(user.id).orElseThrow()
        assertTrue(
            passwordEncoder.matches(firstPassword, savedUser.password) xor
                passwordEncoder.matches(secondPassword, savedUser.password)
        )
        val token = tokenRepository.findByTokenHash(tokenCodec.hash(rawToken)).orElseThrow()
        assertNotNull(token.usedAt)
    }

    private fun runConcurrently(
        first: () -> Unit,
        second: () -> Unit
    ): List<Result<Unit>> {
        val executor = Executors.newFixedThreadPool(2)
        val ready = CountDownLatch(2)
        val start = CountDownLatch(1)
        return try {
            val futures = listOf(first, second).map { action ->
                executor.submit<Result<Unit>> {
                    ready.countDown()
                    start.await(2, TimeUnit.SECONDS)
                    runCatching(action)
                }
            }
            assertTrue(ready.await(2, TimeUnit.SECONDS))
            start.countDown()
            futures.map { it.get(5, TimeUnit.SECONDS) }
        } finally {
            executor.shutdownNow()
        }
    }

    private fun localUser(): User {
        return User(
            email = "student@example.com",
            password = requireNotNull(passwordEncoder.encode("old-password123"))
        )
    }

    private fun anyString(): String = ArgumentMatchers.anyString() ?: ""

    private fun eqString(value: String): String = ArgumentMatchers.eq(value) ?: value

    private fun captureString(captor: ArgumentCaptor<String>): String = captor.capture() ?: ""
}
