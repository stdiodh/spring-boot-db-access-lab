package com.andi.rest_crud.recovery.security

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class PasswordResetTokenCodecTest {
    private val codec = PasswordResetTokenCodec()

    @Test
    fun `raw token은 32 byte Base64URL이고 매번 새로 생성된다`() {
        val first = codec.generateRawToken()
        val second = codec.generateRawToken()

        assertEquals(43, first.length)
        assertTrue(first.matches(Regex("[A-Za-z0-9_-]{43}")))
        assertNotEquals(first, second)
    }

    @Test
    fun `hash는 결정적인 SHA-256 lowercase hex이고 raw token을 포함하지 않는다`() {
        val rawToken = "fixed-password-reset-token"
        val expected = "f484ec4f644a14557c06bf7f1d4c2773b989e2b6c76ba472de65576fbfcc776a"

        val hash = codec.hash(rawToken)

        assertEquals(expected, hash)
        assertEquals(64, hash.length)
        assertTrue(hash.matches(Regex("[0-9a-f]{64}")))
        assertFalse(hash.contains(rawToken))
        assertEquals(hash, codec.hash(rawToken))
    }
}
