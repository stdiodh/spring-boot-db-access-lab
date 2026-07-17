// Step 05: JWT 발급·검증과 요청 인증 필터를 연결합니다.
package com.andi.rest_crud.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
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
        TODO("JWT 발급 메서드를 완성하세요.")
    }

    // TODO 3. 토큰에서 사용자 email을 읽는 메서드를 연결하세요.
    fun getEmail(token: String): String {
        TODO("JWT에서 사용자 email을 읽는 흐름을 완성하세요.")
    }

    // TODO 4. 형식이 잘못된 토큰이나 만료된 토큰을 구분할 준비를 하세요.
    fun validateToken(token: String): Boolean {
        TODO("JWT 검증 흐름을 완성하세요.")
    }
}

@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = resolveToken(request)

        if (token != null && jwtTokenProvider.validateToken(token)) {
            val email = jwtTokenProvider.getEmail(token)
            val authentication = UsernamePasswordAuthenticationToken(email, null, emptyList())
            authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
            SecurityContextHolder.getContext().authentication = authentication
        }

        filterChain.doFilter(request, response)
    }

    private fun resolveToken(request: HttpServletRequest): String? {
        val authorizationHeader = request.getHeader("Authorization") ?: return null

        if (!authorizationHeader.startsWith("Bearer ")) {
            return null
        }

        return authorizationHeader.removePrefix("Bearer ").trim()
            .takeIf { it.isNotBlank() }
    }
}
