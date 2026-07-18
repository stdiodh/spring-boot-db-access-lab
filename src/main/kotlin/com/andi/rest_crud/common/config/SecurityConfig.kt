package com.andi.rest_crud.common.config

import com.andi.rest_crud.auth.security.JwtAuthenticationFilter
import com.andi.rest_crud.common.error.ErrorResponse
import com.andi.rest_crud.oauth.security.CustomOAuthUserService
import com.andi.rest_crud.oauth.security.OAuthLoginFailureHandler
import com.andi.rest_crud.oauth.security.OAuthLoginSuccessHandler
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
// 이 handler는 Security가 차단한 403을 맡고, 게시글 ownership 403은 전역 예외 handler가 맡습니다.
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
class PasswordEncoderConfig {
    // 가입 encode와 login matches가 같은 BCrypt 정책을 공유하도록 하나의 Bean으로 제공합니다.
    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}

@Configuration
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val customAuthenticationEntryPoint: CustomAuthenticationEntryPoint,
    private val jsonAccessDeniedHandler: JsonAccessDeniedHandler,
    private val customOAuthUserService: CustomOAuthUserService,
    private val oauthLoginSuccessHandler: OAuthLoginSuccessHandler,
    private val oauthLoginFailureHandler: OAuthLoginFailureHandler
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        // OAuth state 확인에는 기본 저장소가 임시 session을 쓸 수 있지만, 인증 상태는 저장하지 않고 API는 Bearer JWT만 허용합니다.
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .exceptionHandling { exceptions ->
                exceptions
                    .authenticationEntryPoint(customAuthenticationEntryPoint)
                    .accessDeniedHandler(jsonAccessDeniedHandler)
            }
            .authorizeHttpRequests { auth ->
                // URL뿐 아니라 HTTP method까지 확인해 같은 /posts 경로의 조회와 변경 권한을 나눕니다.
                // /swagger는 UI로 redirect되므로 실제 화면 자산인 /swagger-ui/**도 함께 공개해야 합니다.
                auth
                    .requestMatchers(
                        "/",
                        "/swagger/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/auth-practice",
                        "/auth-practice/",
                        "/auth-practice/**",
                        "/auth/signup",
                        "/auth/login",
                        "/account-recovery/password-reset",
                        "/oauth2/**",
                        "/login/oauth2/**"
                    ).permitAll()
                    .requestMatchers(HttpMethod.GET, "/posts", "/posts/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/posts").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/posts/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/posts/**").authenticated()
                    .requestMatchers("/auth/me").authenticated()
                    .anyRequest().authenticated()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .userInfoEndpoint { userInfo -> userInfo.userService(customOAuthUserService) }
                    .successHandler(oauthLoginSuccessHandler)
                    .failureHandler(oauthLoginFailureHandler)
            }
            // 기본 password 로그인 방식은 끄고 수동 login과 OAuth 성공 모두 Bearer JWT를 발급합니다.
            .httpBasic { it.disable() }
            .formLogin { it.disable() }
            // Controller에 도달하기 전에 SecurityContext에 검증된 신원이 준비되도록 JWT 필터를 앞에 둡니다.
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }
}
