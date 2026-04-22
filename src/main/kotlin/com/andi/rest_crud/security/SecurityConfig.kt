package com.andi.rest_crud.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val customAuthenticationEntryPoint: CustomAuthenticationEntryPoint
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .headers { headers -> headers.frameOptions { it.disable() } }
            .exceptionHandling { it.authenticationEntryPoint(customAuthenticationEntryPoint) }
            .authorizeHttpRequests { auth ->
                auth
                    // TODO 1. 회원가입/로그인은 열어 두고, 보호할 API만 authenticated()로 바꾸세요.
                    .requestMatchers(
                        "/swagger/**",
                        "/v3/api-docs/**",
                        "/h2-console/**",
                        "/auth/signup",
                        "/auth/login"
                    ).permitAll()
                    .requestMatchers("/auth/me").permitAll()
                    .anyRequest().permitAll()
            }
            .httpBasic { it.disable() }
            .formLogin { it.disable() }
        // TODO 2. JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 연결하세요.

        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
