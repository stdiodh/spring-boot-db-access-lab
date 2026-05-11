package com.andi.rest_crud.service

import com.andi.rest_crud.domain.User
import com.andi.rest_crud.domain.AuthProvider
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
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @Transactional
    fun signUp(request: UserSignUpRequest) {
        val email = request.email
        val rawPassword = request.password
        val encodedPassword = passwordEncoder.encode(rawPassword)
            ?: error("PasswordEncoder returned null.")

        if (userRepository.existsByEmail(email)) {
            throw UserAlreadyExistsException(email)
        }

        userRepository.save(
            User(
                email = email,
                password = encodedPassword,
                authProvider = AuthProvider.LOCAL,
                providerId = null
            )
        )
    }

    fun login(request: LoginRequest): TokenResponse {
        val email = request.email
        val rawPassword = request.password
        val user = userRepository.findByEmail(email)
            .orElseThrow { InvalidCredentialsException() }

        if (user.authProvider != AuthProvider.LOCAL) {
            throw InvalidCredentialsException()
        }

        if (!passwordEncoder.matches(rawPassword, user.password)) {
            throw InvalidCredentialsException()
        }

        return TokenResponse(
            accessToken = jwtTokenProvider.createToken(user.email)
        )
    }

    fun getCurrentUser(email: String): CurrentUserResponse {
        val user = userRepository.findByEmail(email)
            .orElseThrow { InvalidCredentialsException() }

        return CurrentUserResponse(email = user.email)
    }
}
