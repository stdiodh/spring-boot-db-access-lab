package com.andi.rest_crud.recovery.mail

import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.mail.MailSendException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender

class SmtpRecoveryMailSenderTest {
    private val javaMailSender = mock(JavaMailSender::class.java)
    private val sender = SmtpRecoveryMailSender(javaMailSender, "no-reply@test.local")

    @Test
    fun `SMTP message는 설정된 발신자와 복구 안내를 담는다`() {
        val resetLink = "https://frontend.example/reset#reset_token=opaque-token"

        sender.sendPasswordResetMail("student@example.com", resetLink)

        val messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage::class.java)
        verify(javaMailSender).send(messageCaptor.capture())
        val message = messageCaptor.value
        assertEquals("no-reply@test.local", message.from)
        assertArrayEquals(arrayOf("student@example.com"), message.to)
        assertEquals("[A&I] 비밀번호 재설정 안내", message.subject)
        assertTrue(message.text.orEmpty().contains(resetLink))
        assertTrue(
            message.text.orEmpty().contains(
                "이 링크는 제한된 시간 동안 한 번만 사용할 수 있습니다."
            )
        )
        assertTrue(message.text.orEmpty().contains("요청하지 않았다면 이 메일을 무시하세요."))
    }

    @Test
    fun `Spring MailException은 공용 delivery 예외로 변환한다`() {
        val cause = MailSendException("smtp unavailable")
        doThrow(cause).`when`(javaMailSender).send(anySimpleMailMessage())

        val exception = assertThrows(RecoveryMailDeliveryException::class.java) {
            sender.sendPasswordResetMail(
                "student@example.com",
                "https://frontend.example/reset#reset_token=opaque-token"
            )
        }

        assertEquals("비밀번호 재설정 메일을 전송하지 못했습니다.", exception.message)
        assertSame(cause, exception.cause)
    }

    private fun anySimpleMailMessage(): SimpleMailMessage {
        return any(SimpleMailMessage::class.java) ?: SimpleMailMessage()
    }
}
