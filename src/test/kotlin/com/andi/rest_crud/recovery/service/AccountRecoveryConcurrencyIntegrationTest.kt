package com.andi.rest_crud.recovery.service

import com.andi.rest_crud.recovery.dto.PasswordResetConfirmRequest
import com.andi.rest_crud.recovery.exception.InvalidPasswordResetTokenException
import com.andi.rest_crud.recovery.exception.RecoveryMailCooldownException
import com.andi.rest_crud.recovery.repository.PasswordResetTokenRepository
import com.andi.rest_crud.recovery.security.PasswordResetTokenCodec
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
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

    @BeforeEach
    fun setUp() {
        clearDatabase()
    }

    @AfterEach
    fun tearDown() {
        clearDatabase()
    }

    @Test
    fun `동시 재설정 요청은 한 command만 만들고 다른 요청은 cooldown으로 끝난다`() {
        userRepository.saveAndFlush(localUser())

        val results = runConcurrently(
            { accountRecoveryService.requestPasswordReset("student@example.com") },
            { accountRecoveryService.requestPasswordReset("STUDENT@EXAMPLE.COM") }
        )

        assertEquals(1, results.count { it.isSuccess })
        assertTrue(results.single { it.isFailure }.exceptionOrNull() is RecoveryMailCooldownException)
        assertEquals(1, tokenRepository.count())
    }

    @Test
    fun `같은 token의 동시 confirm은 한 password 변경만 성공하고 replay는 공개 오류로 끝난다`() {
        val user = userRepository.saveAndFlush(localUser())
        val command = accountRecoveryService.requestPasswordReset(user.email)
        val rawToken = command.resetLink.substringAfter("#reset_token=")
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

    private fun <T> runConcurrently(
        first: () -> T,
        second: () -> T
    ): List<Result<T>> {
        val executor = Executors.newFixedThreadPool(2)
        val ready = CountDownLatch(2)
        val start = CountDownLatch(1)
        return try {
            val futures = listOf(first, second).map { action ->
                executor.submit<Result<T>> {
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

    private fun clearDatabase() {
        tokenRepository.deleteAllInBatch()
        userRepository.deleteAllInBatch()
    }

}
