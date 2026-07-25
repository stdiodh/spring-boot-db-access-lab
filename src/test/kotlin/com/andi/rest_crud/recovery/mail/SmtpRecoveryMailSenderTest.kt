package com.andi.rest_crud.recovery.mail

import com.andi.rest_crud.recovery.exception.RecoveryMailAuthenticationException
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.mail.MailAuthenticationException
import org.springframework.mail.MailSendException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender

class SmtpRecoveryMailSenderTest {
    private val javaMailSender = mock(JavaMailSender::class.java)
    private val sender = SmtpRecoveryMailSender(
        javaMailSender,
        "no-reply@test.local",
        "localhost",
        ""
    )

    @Test
    fun `Gmail SMTP는 인증 계정을 발신자로 사용한다`() {
        val smtpUsername = "authenticated-sender@gmail.com"
        val gmailSender = SmtpRecoveryMailSender(
            javaMailSender,
            "ignored-sender@example.com",
            "smtp.gmail.com",
            smtpUsername
        )

        gmailSender.sendPasswordResetMail(
            "student@example.com",
            "https://frontend.example/reset#reset_token=opaque-token"
        )

        val messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage::class.java)
        verify(javaMailSender).send(messageCaptor.capture())
        assertEquals(smtpUsername, messageCaptor.value.from)
    }

    @Test
    fun `Gmail SMTP 인증 계정이 비어 있으면 설정 값을 숨기고 시작을 거부한다`() {
        val recoveryMailFrom = "visible-sender@gmail.com"

        val exception = assertThrows(IllegalStateException::class.java) {
            SmtpRecoveryMailSender(
                javaMailSender,
                recoveryMailFrom,
                "smtp.gmail.com",
                ""
            )
        }

        assertEquals(
            "Gmail SMTP 설정 오류: SPRING_MAIL_USERNAME이 필요합니다.",
            exception.message
        )
        assertFalse(exception.message.orEmpty().contains(recoveryMailFrom))
    }

    @Test
    fun `로컬 Mailpit은 인증 계정이 없어도 시작할 수 있다`() {
        SmtpRecoveryMailSender(
            javaMailSender,
            "no-reply@aandi.test",
            "localhost",
            ""
        )
    }

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

    @Test
    fun `SMTP 인증 실패는 앱 비밀번호 안내용 오류로 구분한다`() {
        val cause = MailAuthenticationException("535 sensitive provider response")
        doThrow(cause).`when`(javaMailSender).send(anySimpleMailMessage())

        val exception = assertThrows(RecoveryMailAuthenticationException::class.java) {
            sender.sendPasswordResetMail(
                "student@example.com",
                "https://frontend.example/reset#reset_token=opaque-token"
            )
        }

        assertEquals("Gmail 앱 비밀번호가 올바르지 않거나 사용할 수 없습니다.", exception.message)
        assertFalse(exception.message.orEmpty().contains("535"))
        assertSame(cause, exception.cause)
    }

    private fun anySimpleMailMessage(): SimpleMailMessage {
        return any(SimpleMailMessage::class.java) ?: SimpleMailMessage()
    }
}
