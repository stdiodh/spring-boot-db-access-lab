package com.andi.rest_crud.recovery.mail

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.read.ListAppender
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.slf4j.LoggerFactory
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor

class RecoveryMailDispatchTest {

    @Test
    fun `event 문자열 표현은 recipient와 reset link를 노출하지 않는다`() {
        val event = PasswordResetMailRequestedEvent(
            "student@example.com",
            "https://frontend.example/reset#reset_token=sensitive-token"
        )

        val rendered = event.toString()

        assertFalse(rendered.contains("student@example.com"))
        assertFalse(rendered.contains("sensitive-token"))
        assertTrue(rendered.contains("[REDACTED]"))
    }

    @Test
    fun `dispatcher는 event를 SMTP adapter에 전달한다`() {
        val sender = mock(RecoveryMailSender::class.java)
        val dispatcher = RecoveryMailEventDispatcher(sender)
        val event = PasswordResetMailRequestedEvent(
            "student@example.com",
            "https://frontend.example/reset#reset_token=token"
        )

        dispatcher.dispatch(event)

        verify(sender).sendPasswordResetMail(event.recipientEmail, event.resetLink)
    }

    @Test
    fun `dispatcher는 모든 RuntimeException을 삼키고 민감 정보 없는 고정 경고만 기록한다`() {
        val sender = mock(RecoveryMailSender::class.java)
        val dispatcher = RecoveryMailEventDispatcher(sender)
        val event = PasswordResetMailRequestedEvent(
            "student@example.com",
            "https://frontend.example/reset#reset_token=sensitive-token"
        )
        doThrow(IllegalStateException("student@example.com sensitive-token smtp.internal"))
            .`when`(sender)
            .sendPasswordResetMail(event.recipientEmail, event.resetLink)
        val logger = LoggerFactory.getLogger(RecoveryMailEventDispatcher::class.java) as Logger
        val appender = ListAppender<ILoggingEvent>().apply { start() }
        logger.addAppender(appender)

        try {
            dispatcher.dispatch(event)
        } finally {
            logger.detachAppender(appender)
            appender.stop()
        }

        val warning = appender.list.single()
        assertEquals(Level.WARN, warning.level)
        assertEquals("Password reset mail delivery failed.", warning.formattedMessage)
        assertFalse(warning.formattedMessage.contains("student@example.com"))
        assertFalse(warning.formattedMessage.contains("sensitive-token"))
        assertFalse(warning.formattedMessage.contains("smtp.internal"))
        assertTrue(warning.throwableProxy == null)
    }

    @Test
    fun `mail executor는 고정된 thread와 bounded queue를 사용한다`() {
        val executor: ThreadPoolTaskExecutor = RecoveryMailAsyncConfig().recoveryMailExecutor()
        executor.initialize()
        try {
            assertEquals(1, executor.corePoolSize)
            assertEquals(2, executor.maxPoolSize)
            assertEquals(100, executor.threadPoolExecutor.queue.remainingCapacity())
            assertEquals("recovery-mail-", executor.threadNamePrefix)
        } finally {
            executor.shutdown()
        }
    }
}
