package com.andi.rest_crud.security

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.time.Clock
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long,
    @Value("\${jwt.issuer}") private val issuer: String,
    @Value("\${jwt.audience}") private val audience: String,
    private val clock: Clock
) {
    init {
        require(secret.toByteArray(StandardCharsets.UTF_8).size >= MIN_HS256_KEY_BYTES) {
            "jwt.secret은 HS256 서명을 위해 UTF-8 기준 32바이트 이상이어야 합니다."
        }
        require(expirationMs > 0) { "jwt.expiration-ms는 0보다 커야 합니다." }
        require(issuer.isNotBlank()) { "jwt.issuer는 비어 있을 수 없습니다." }
        require(audience.isNotBlank()) { "jwt.audience는 비어 있을 수 없습니다." }
    }

    private val signingKey: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray(StandardCharsets.UTF_8))
    private val jwtParser = Jwts.parser()
        .verifyWith(signingKey)
        .requireIssuer(issuer)
        .requireAudience(audience)
        .clock { Date.from(clock.instant()) }
        .build()

    val expirationSeconds: Long = expirationMs / 1000

    fun createToken(email: String): String {
        val issuedAt = clock.instant()

        return Jwts.builder()
            .issuer(issuer)
            .audience().add(audience).and()
            .subject(email)
            .issuedAt(Date.from(issuedAt))
            .expiration(Date.from(issuedAt.plusMillis(expirationMs)))
            .signWith(signingKey, Jwts.SIG.HS256)
            .compact()
    }

    fun getValidatedSubject(token: String): String? {
        return try {
            val parsedToken = jwtParser.parseSignedClaims(token)
            if (parsedToken.header.algorithm != Jwts.SIG.HS256.id) {
                return null
            }

            val claims = parsedToken.payload
            val subject = claims.subject

            subject?.takeIf {
                it.isNotBlank() && claims.issuedAt != null && claims.expiration != null
            }
        } catch (_: JwtException) {
            null
        } catch (_: IllegalArgumentException) {
            null
        }
    }

    private companion object {
        const val MIN_HS256_KEY_BYTES = 32
    }
}
