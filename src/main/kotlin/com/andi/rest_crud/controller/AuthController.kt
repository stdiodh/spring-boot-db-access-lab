package com.andi.rest_crud.controller

import com.andi.rest_crud.dto.CurrentUserResponse
import com.andi.rest_crud.dto.LoginRequest
import com.andi.rest_crud.dto.TokenResponse
import com.andi.rest_crud.dto.UserSignUpRequest
import com.andi.rest_crud.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    // TODO 1. 회원가입 요청은 DTO로 받고 Service에 위임하세요.
    fun signUp(@Valid @RequestBody request: UserSignUpRequest) {
        authService.signUp(request)
    }

    @PostMapping("/login")
    // TODO 2. 로그인 성공 시 accessToken을 응답 DTO로 내려주세요.
    fun login(@Valid @RequestBody request: LoginRequest): TokenResponse {
        return authService.login(request)
    }

    @GetMapping("/me")
    // TODO 3. 인증 로직을 Controller에서 직접 풀지 말고 Principal.name을 Service로 넘기세요.
    fun me(authentication: Principal): CurrentUserResponse {
        return authService.getCurrentUser(authentication.name)
    }
}
