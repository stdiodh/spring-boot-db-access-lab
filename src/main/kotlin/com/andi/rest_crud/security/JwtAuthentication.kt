package com.andi.rest_crud.security

import io.jsonwebtoken.JwtException
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
        // 짧거나 불완전한 설정은 토큰 발급 뒤가 아니라 애플리케이션 시작 시점에 바로 드러내야 합니다.
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

        // email을 이번 학습 흐름의 사용자 연결 키인 subject로 넣고, 발급자·대상·시간까지 서명합니다.
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
        // 한 번만 파싱하고 JwtException/IllegalArgumentException만 인증 실패로 바꿔, 관련 없는 오류는 숨기지 않습니다.
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

@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        // 앞선 인증 수단이 만든 Authentication을 보존하고, 검증된 JWT subject가 있을 때만 새 인증을 만듭니다.
        if (SecurityContextHolder.getContext().authentication == null) {
            resolveToken(request)
                ?.let(jwtTokenProvider::getValidatedSubject)
                ?.let { email -> setAuthentication(request, email) }
        }

        filterChain.doFilter(request, response)
    }

    private fun setAuthentication(request: HttpServletRequest, email: String) {
        val authentication = UsernamePasswordAuthenticationToken(email, null, emptyList())
        authentication.details = WebAuthenticationDetailsSource().buildDetails(request)

        // 요청마다 빈 context를 사용해야 이전 요청의 인증 상태가 섞이지 않습니다.
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authentication
        SecurityContextHolder.setContext(context)
    }

    private fun resolveToken(request: HttpServletRequest): String? {
        val authorizationHeader = request.getHeader("Authorization") ?: return null

        // Bearer 형식이 아니거나 실제 토큰이 비어 있으면 인증 시도 자체를 건너뜁니다.
        if (!authorizationHeader.startsWith("Bearer ")) {
            return null
        }

        return authorizationHeader.removePrefix("Bearer ").trim()
            .takeIf { it.isNotBlank() }
    }
}
