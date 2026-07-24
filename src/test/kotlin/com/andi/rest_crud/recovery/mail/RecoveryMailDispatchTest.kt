package com.andi.rest_crud.recovery.mail

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.mail.MailSendException

class RecoveryMailDispatchTest {

    @Test
    fun `command 문자열 표현은 token과 recipient와 reset link를 노출하지 않는다`() {
        val command = mailCommand()

        val rendered = command.toString()

        assertFalse(rendered.contains(command.tokenId.toString()))
        assertFalse(rendered.contains(command.tokenHash))
        assertFalse(rendered.contains(command.recipientEmail))
        assertFalse(rendered.contains("sensitive-token"))
        assertTrue(rendered.contains("[REDACTED]"))
    }

    @Test
    fun `dispatcher는 request thread에서 command를 SMTP adapter에 동기로 전달한다`() {
        val sender = mock(RecoveryMailSender::class.java)
        val dispatcher = RecoveryMailDispatcher(sender)
        val command = mailCommand()

        dispatcher.dispatch(command)

        verify(sender).sendPasswordResetMail(command.recipientEmail, command.resetLink)
    }

    @Test
    fun `dispatcher는 SMTP delivery 예외를 삼키지 않고 호출자에게 전달한다`() {
        val sender = mock(RecoveryMailSender::class.java)
        val dispatcher = RecoveryMailDispatcher(sender)
        val command = mailCommand()
        val expected = RecoveryMailDeliveryException(MailSendException("smtp unavailable"))
        doThrow(expected)
            .`when`(sender)
            .sendPasswordResetMail(command.recipientEmail, command.resetLink)

        val actual = assertThrows(RecoveryMailDeliveryException::class.java) {
            dispatcher.dispatch(command)
        }

        assertSame(expected, actual)
    }

    private fun mailCommand() = PasswordResetMailCommand(
        tokenId = 17L,
        tokenHash = "a".repeat(64),
        recipientEmail = "student@example.com",
        resetLink = "https://frontend.example/reset#reset_token=sensitive-token"
    )
}
