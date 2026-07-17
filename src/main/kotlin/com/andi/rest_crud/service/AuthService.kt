package com.andi.rest_crud.service

import com.andi.rest_crud.domain.AuthProvider
import com.andi.rest_crud.domain.User
import com.andi.rest_crud.dto.CurrentUserResponse
import com.andi.rest_crud.dto.LoginRequest
import com.andi.rest_crud.dto.TokenResponse
import com.andi.rest_crud.dto.UserSignUpRequest
import com.andi.rest_crud.exception.InvalidCredentialsException
import com.andi.rest_crud.exception.UserAlreadyExistsException
import com.andi.rest_crud.repository.UserRepository
import com.andi.rest_crud.security.JwtTokenProvider
import org.hibernate.exception.ConstraintViolationException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.Locale

@Service
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @Transactional
    fun signUp(request: UserSignUpRequest) {
        val email = normalizeEmail(request.email)
        val rawPassword = request.password

        if (userRepository.existsByEmail(email)) {
            throw UserAlreadyExistsException()
        }

        val encodedPassword = requireNotNull(passwordEncoder.encode(rawPassword))

        try {
            userRepository.saveAndFlush(
                User(
                    email = email,
                    password = encodedPassword,
                    authProvider = AuthProvider.LOCAL,
                    providerId = null
                )
            )
        } catch (exception: DataIntegrityViolationException) {
            if (exception.isUniqueConstraintViolation()) {
                throw UserAlreadyExistsException()
            }
            throw exception
        }
    }

    fun login(request: LoginRequest): TokenResponse {
        val email = normalizeEmail(request.email)
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
            accessToken = jwtTokenProvider.createToken(user.email),
            expiresIn = jwtTokenProvider.expirationSeconds
        )
    }

    fun getCurrentUser(email: String): CurrentUserResponse {
        val user = userRepository.findByEmail(normalizeEmail(email))
            .orElseThrow { InvalidCredentialsException() }

        return CurrentUserResponse(email = user.email)
    }

    private fun normalizeEmail(email: String): String = email.lowercase(Locale.ROOT)

    private fun DataIntegrityViolationException.isUniqueConstraintViolation(): Boolean {
        return generateSequence(cause) { it.cause }
            .filterIsInstance<ConstraintViolationException>()
            .any { it.kind == ConstraintViolationException.ConstraintKind.UNIQUE }
    }
}
