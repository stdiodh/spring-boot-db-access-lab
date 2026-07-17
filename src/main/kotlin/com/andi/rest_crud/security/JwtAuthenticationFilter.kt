package com.andi.rest_crud.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
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
