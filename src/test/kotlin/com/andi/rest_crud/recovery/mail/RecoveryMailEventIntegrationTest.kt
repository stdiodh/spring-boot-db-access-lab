package com.andi.rest_crud.recovery.mail

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.after
import org.mockito.Mockito.doAnswer
import org.mockito.Mockito.reset
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.ApplicationEventPublisher
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.transaction.support.TransactionTemplate
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

@SpringBootTest
class RecoveryMailEventIntegrationTest @Autowired constructor(
    private val eventPublisher: ApplicationEventPublisher,
    private val transactionTemplate: TransactionTemplate
) {

    @MockitoBean
    private lateinit var recoveryMailSender: RecoveryMailSender

    @BeforeEach
    fun resetSender() {
        reset(recoveryMailSender)
    }

    @Test
    fun `mail event는 transaction commit 전에는 발송하지 않고 commit 뒤 비동기로 발송한다`() {
        val event = PasswordResetMailRequestedEvent(
            "student@example.com",
            "https://frontend.example/reset#reset_token=token"
        )
        val dispatchThreadName = AtomicReference<String>()
        val completed = CountDownLatch(1)
        doAnswer {
            dispatchThreadName.set(Thread.currentThread().name)
            completed.countDown()
            null
        }.`when`(recoveryMailSender).sendPasswordResetMail(event.recipientEmail, event.resetLink)

        transactionTemplate.executeWithoutResult {
            eventPublisher.publishEvent(event)
            verifyNoInteractions(recoveryMailSender)
        }

        assertTrue(completed.await(2, TimeUnit.SECONDS))
        verify(recoveryMailSender)
            .sendPasswordResetMail(event.recipientEmail, event.resetLink)
        assertTrue(dispatchThreadName.get().startsWith("recovery-mail-"))
    }

    @Test
    fun `rollback된 transaction의 mail event는 발송하지 않는다`() {
        val event = PasswordResetMailRequestedEvent(
            "student@example.com",
            "https://frontend.example/reset#reset_token=token"
        )

        transactionTemplate.executeWithoutResult { status ->
            eventPublisher.publishEvent(event)
            status.setRollbackOnly()
        }

        verify(recoveryMailSender, after(300).never())
            .sendPasswordResetMail(event.recipientEmail, event.resetLink)
    }
}
