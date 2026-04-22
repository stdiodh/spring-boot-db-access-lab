package com.andi.rest_crud.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long
) {
    private val signingKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(secret.toByteArray(StandardCharsets.UTF_8))
    }

    // TODO 1. 로그인 성공 후 사용할 JWT 발급 메서드를 완성하세요.
    // TODO 2. subject에는 사용자를 구분할 값(email)을 넣으세요.
    fun createToken(email: String): String {
        return Jwts.builder()
            .subject(email)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + expirationMs))
            .signWith(signingKey)
            .compact()
    }

    // TODO 3. 토큰에서 사용자 email을 읽는 메서드를 연결하세요.
    fun getEmail(token: String): String {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload
            .subject
            ?: throw IllegalArgumentException("토큰에 사용자 정보가 없습니다.")
    }

    // TODO 4. 형식이 잘못된 토큰이나 만료된 토큰을 구분할 준비를 하세요.
    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
            true
        } catch (_: Exception) {
            false
        }
    }
}
