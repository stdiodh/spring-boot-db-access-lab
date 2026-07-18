package com.andi.rest_crud.controller

import com.andi.rest_crud.dto.CurrentUserResponse
import com.andi.rest_crud.dto.LoginRequest
import com.andi.rest_crud.dto.TokenResponse
import com.andi.rest_crud.dto.UserSignUpRequest
import com.andi.rest_crud.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.CacheControl
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
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
    fun signUp(@Valid @RequestBody request: UserSignUpRequest) {
        // Controller는 HTTP 입력 경계만 맡고 계정 생성 규칙과 transaction은 Service에 모읍니다.
        authService.signUp(request)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<TokenResponse> {
        // TokenResponse로 Access Token 계약을 고정하고, 민감한 발급 결과는 no-store로 캐시에 남기지 않습니다.
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(authService.login(request))
    }

    @GetMapping("/me")
    fun me(authentication: Principal): CurrentUserResponse {
        // 필터가 검증해 둔 Principal만 넘기면 Controller가 JWT를 다시 해석하지 않아도 됩니다.
        return authService.getCurrentUser(authentication.name)
    }
}

@Controller
class AuthPracticeEntryController {

    @GetMapping("/", "/auth-practice", "/auth-practice/")
    fun redirectToAuthPractice(): String = "redirect:/auth-practice/index.html"
}
