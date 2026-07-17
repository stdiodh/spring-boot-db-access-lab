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
        authService.signUp(request)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<TokenResponse> {
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(authService.login(request))
    }

    @GetMapping("/me")
    fun me(authentication: Principal): CurrentUserResponse {
        return authService.getCurrentUser(authentication.name)
    }
}

// WHY: 학생이 실행 직후 주소를 외우지 않아도 루트와 짧은 경로에서 같은 인증 실습 화면으로 진입한다.
@Controller
class AuthPracticePageController {

    @GetMapping("/", "/auth-practice", "/auth-practice/")
    fun redirectToPracticePage(): String = "redirect:/auth-practice/index.html"
}
