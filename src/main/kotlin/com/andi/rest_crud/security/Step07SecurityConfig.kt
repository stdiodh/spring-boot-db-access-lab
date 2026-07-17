/*
 * 실습 순서 07 — Spring Security 요청 경계
 * 선행 단계: Step04 ErrorResponse와 Step05 JwtAuthenticationFilter가 준비되어 있어야 합니다.
 * 이 단계의 판단: 공개/보호 API, stateless session, Filter 위치, Security 401/403 응답을 한 경계에서 연결합니다.
 * 다음 연결: 인증을 통과한 principal은 Controller를 거쳐 Step08의 게시글 ownership 판단에 사용됩니다.
 */
package com.andi.rest_crud.security

import com.andi.rest_crud.exception.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.AuthenticationException
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.security.web.SecurityFilterChain
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper
import java.time.Clock

@Configuration
class ClockConfig {
    // 실제 실행은 UTC Clock, 단위 테스트는 고정 Clock을 주입해 같은 만료 시점을 재현합니다.
    @Bean
    fun jwtClock(): Clock = Clock.systemUTC()
}

@Component
// AuthenticationEntryPoint는 신원이 없거나 token이 유효하지 않은 보호 요청의 401을 담당합니다.
class CustomAuthenticationEntryPoint(
    private val objectMapper: ObjectMapper
) : AuthenticationEntryPoint {

    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException
    ) {
        response.status = HttpServletResponse.SC_UNAUTHORIZED
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = Charsets.UTF_8.name()
        response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer")
        // 문자열 JSON을 직접 이어 붙이지 않아 escaping과 공용 ErrorResponse 형식이 깨지지 않습니다.
        objectMapper.writeValue(
            response.writer,
            ErrorResponse(
                code = "UNAUTHORIZED",
                message = "인증이 필요합니다."
            )
        )
    }
}

@Component
// 이 handler는 Security가 차단한 403을 맡고, 게시글 ownership 403은 Step04 전역 handler가 맡습니다.
class JsonAccessDeniedHandler(
    private val objectMapper: ObjectMapper
) : AccessDeniedHandler {

    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        accessDeniedException: AccessDeniedException
    ) {
        response.status = HttpServletResponse.SC_FORBIDDEN
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = Charsets.UTF_8.name()
        objectMapper.writeValue(
            response.writer,
            ErrorResponse(
                code = "ACCESS_DENIED",
                message = "접근 권한이 없습니다."
            )
        )
    }
}

@Configuration
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val customAuthenticationEntryPoint: CustomAuthenticationEntryPoint,
    private val jsonAccessDeniedHandler: JsonAccessDeniedHandler
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        // Bearer header 기반 Access Token only이므로 session을 만들지 않습니다. Cookie 인증이면 CSRF를 재검토합니다.
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .exceptionHandling { exceptions ->
                exceptions
                    .authenticationEntryPoint(customAuthenticationEntryPoint)
                    .accessDeniedHandler(jsonAccessDeniedHandler)
            }
            .authorizeHttpRequests { auth ->
                // 계정 생성과 로그인·학습 화면·조회만 공개하고, 신원이나 데이터를 바꾸는 요청은 인증 뒤에 둡니다.
                auth
                    .requestMatchers(
                        "/",
                        "/swagger/**",
                        "/v3/api-docs/**",
                        "/auth-practice",
                        "/auth-practice/",
                        "/auth-practice/**",
                        "/auth/signup",
                        "/auth/login"
                    ).permitAll()
                    .requestMatchers(HttpMethod.GET, "/posts", "/posts/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/posts").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/posts/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/posts/**").authenticated()
                    .requestMatchers("/auth/me").authenticated()
                    .anyRequest().authenticated()
            }
            // 기본 로그인 방식은 끄고 signup → 수동 login → Bearer JWT 흐름만 남깁니다.
            .httpBasic { it.disable() }
            .formLogin { it.disable() }
            // Controller보다 먼저 JWT를 읽어야 보호 API가 Principal을 신뢰할 수 있습니다.
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    // 가입 encode와 login matches가 같은 BCrypt 정책을 공유하도록 하나의 Bean으로 제공합니다.
    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
