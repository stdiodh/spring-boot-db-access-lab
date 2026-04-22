package com.andi.rest_crud.service

import com.andi.rest_crud.domain.User
import com.andi.rest_crud.dto.CurrentUserResponse
import com.andi.rest_crud.dto.LoginRequest
import com.andi.rest_crud.dto.TokenResponse
import com.andi.rest_crud.dto.UserSignUpRequest
import com.andi.rest_crud.exception.InvalidCredentialsException
import com.andi.rest_crud.exception.UserAlreadyExistsException
import com.andi.rest_crud.repository.UserRepository
import com.andi.rest_crud.security.JwtTokenProvider
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    // TODO 1. 회원가입 전에 같은 email이 이미 있는지 확인하세요.
    // TODO 2. 비밀번호는 원문 그대로 저장하지 말고 encode(...)를 거치세요.
    // TODO 3. 저장은 Service에서 끝내고 Controller에는 인증 로직을 두지 마세요.
    fun signUp(request: UserSignUpRequest) {
        TODO("회원가입 저장 흐름을 완성하세요.")
    }

    // TODO 4. email로 사용자를 찾으세요.
    // TODO 5. passwordEncoder.matches(...)로 비밀번호를 확인하세요.
    // TODO 6. 검증이 끝나면 JWT를 발급해 TokenResponse로 반환하세요.
    fun login(request: LoginRequest): TokenResponse {
        TODO("로그인 흐름을 완성하세요.")
    }

    // TODO 7. 토큰에서 읽은 email로 현재 사용자를 조회하세요.
    fun getCurrentUser(email: String): CurrentUserResponse {
        TODO("현재 사용자 조회 흐름을 완성하세요.")
    }
}
