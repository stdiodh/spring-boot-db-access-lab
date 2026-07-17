package com.andi.rest_crud.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.nio.charset.StandardCharsets
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.Date

class JwtTokenProviderTest {
    @Test
    fun `정상 토큰에서 subject를 반환한다`() {
        val provider = provider()
        val token = provider.createToken("student@example.com")

        assertEquals("student@example.com", provider.getValidatedSubject(token))
    }

    @Test
    fun `발급 토큰은 issuedAt과 expiration을 포함한다`() {
        val provider = provider(expirationMs = EXPIRATION_MS)
        val token = provider.createToken("student@example.com")

        val claims = Jwts.parser()
            .verifyWith(Keys.hmacShaKeyFor(SECRET.toByteArray(StandardCharsets.UTF_8)))
            .clock { Date.from(NOW) }
            .build()
            .parseSignedClaims(token)
            .payload

        assertEquals(Date.from(NOW), claims.issuedAt)
        assertEquals(Date.from(NOW.plusMillis(EXPIRATION_MS)), claims.expiration)
    }

    @Test
    fun `signature가 변조된 토큰은 검증에 실패한다`() {
        val provider = provider()
        val token = provider.createToken("student@example.com")

        assertNull(provider.getValidatedSubject(tamperSignature(token)))
    }

    @Test
    fun `다른 key로 서명된 토큰은 검증에 실패한다`() {
        val issuer = provider(secret = OTHER_SECRET)
        val validator = provider(secret = SECRET)

        assertNull(validator.getValidatedSubject(issuer.createToken("student@example.com")))
    }

    @Test
    fun `만료된 토큰은 검증에 실패한다`() {
        val issuer = provider(expirationMs = 1_000)
        val validator = provider(clock = fixedClock(NOW.plusSeconds(2)), expirationMs = 1_000)

        assertNull(validator.getValidatedSubject(issuer.createToken("student@example.com")))
    }

    @Test
    fun `issuer가 다르면 검증에 실패한다`() {
        val issuer = provider(issuer = "auth-issuer")
        val validator = provider(issuer = "other-issuer")

        assertNull(validator.getValidatedSubject(issuer.createToken("student@example.com")))
    }

    @Test
    fun `audience가 다르면 검증에 실패한다`() {
        val issuer = provider(audience = "visual-lab-api")
        val validator = provider(audience = "other-api")

        assertNull(validator.getValidatedSubject(issuer.createToken("student@example.com")))
    }

    @Test
    fun `subject가 없는 토큰은 검증에 실패한다`() {
        val signingKey = Keys.hmacShaKeyFor(SECRET.toByteArray(StandardCharsets.UTF_8))
        val token = Jwts.builder()
            .issuer(ISSUER)
            .audience().add(AUDIENCE).and()
            .issuedAt(Date.from(NOW))
            .expiration(Date.from(NOW.plusMillis(EXPIRATION_MS)))
            .signWith(signingKey, Jwts.SIG.HS256)
            .compact()

        assertNull(provider().getValidatedSubject(token))
    }

    @Test
    fun `HS256이 아닌 알고리즘의 토큰은 거부한다`() {
        val strongSecret = "s".repeat(64)
        val signingKey = Keys.hmacShaKeyFor(strongSecret.toByteArray(StandardCharsets.UTF_8))
        val token = Jwts.builder()
            .issuer(ISSUER)
            .audience().add(AUDIENCE).and()
            .subject("student@example.com")
            .issuedAt(Date.from(NOW))
            .expiration(Date.from(NOW.plusMillis(EXPIRATION_MS)))
            .signWith(signingKey, Jwts.SIG.HS384)
            .compact()

        assertNull(provider(secret = strongSecret).getValidatedSubject(token))
    }

    @Test
    fun `HS256 최소 길이보다 짧은 secret은 생성 시 거부한다`() {
        val exception = assertThrows(IllegalArgumentException::class.java) {
            provider(secret = "too-short")
        }

        assertTrue(exception.message.orEmpty().contains("32바이트 이상"))
    }

    private fun provider(
        secret: String = SECRET,
        expirationMs: Long = EXPIRATION_MS,
        issuer: String = ISSUER,
        audience: String = AUDIENCE,
        clock: Clock = fixedClock(NOW)
    ): JwtTokenProvider {
        return JwtTokenProvider(secret, expirationMs, issuer, audience, clock)
    }

    private fun fixedClock(instant: Instant): Clock = Clock.fixed(instant, ZoneOffset.UTC)

    private fun tamperSignature(token: String): String {
        val signatureStart = token.lastIndexOf('.') + 1
        val original = token[signatureStart]
        val replacement = if (original == 'A') 'B' else 'A'
        return token.replaceRange(signatureStart, signatureStart + 1, replacement.toString())
    }

    private companion object {
        const val SECRET = "test-only-secret-key-for-hs256-000001"
        const val OTHER_SECRET = "test-only-secret-key-for-hs256-000002"
        const val ISSUER = "spring-boot-db-access-lab"
        const val AUDIENCE = "spring-boot-db-access-lab-api"
        const val EXPIRATION_MS = 3_600_000L
        val NOW: Instant = Instant.parse("2026-01-15T12:00:00Z")
    }
}
