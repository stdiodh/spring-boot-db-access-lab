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

// WHY: 발급과 검증이 같은 key·algorithm·issuer·audience 계약을 사용해야 다른 출처의 token을 신뢰하지 않는다.
@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long,
    @Value("\${jwt.issuer}") private val issuer: String,
    @Value("\${jwt.audience}") private val audience: String,
    private val clock: Clock
) {
    // WHY: HS256은 최소 32바이트 key가 필요하므로 잘못된 설정을 첫 요청이 아니라 애플리케이션 시작 시 막는다.
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

    // WHY: 이번 시퀀스는 학습 단순화를 위해 email을 subject로 쓰며, 운영에서는 불변 userId가 더 안전하다.
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

    // WHY: filter가 validate와 subject 조회를 따로 호출하지 않도록 token을 한 번만 parsing한다.
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

// WHY: 로그인 이후 매 요청의 Bearer token을 검증해 stateless SecurityContext에 현재 사용자를 연결한다.
@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        // WHY: 앞선 인증 방식이 만든 Authentication이 있다면 JWT filter가 덮어쓰지 않는다.
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

        // WHY: 기존 context를 재사용하지 않고 빈 context를 만들어 인증 정보의 의도치 않은 공유를 막는다.
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authentication
        SecurityContextHolder.setContext(context)
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
