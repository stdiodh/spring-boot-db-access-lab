package com.andi.rest_crud.recovery.mail

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Test
import org.springframework.mail.MailSendException

class RecoveryMailContractTest {

    @Test
    fun `delivery 예외는 원인을 보존하되 민감 정보를 message에 담지 않는다`() {
        val cause = MailSendException("student@example.com sensitive-reset-token")
        val exception = RecoveryMailDeliveryException(cause)

        assertEquals("비밀번호 재설정 메일을 전송하지 못했습니다.", exception.message)
        assertFalse(exception.message.orEmpty().contains("student@example.com"))
        assertFalse(exception.message.orEmpty().contains("sensitive-reset-token"))
        assertSame(cause, exception.cause)
    }
}
