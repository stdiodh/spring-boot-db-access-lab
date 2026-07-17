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

// WHY: 조회를 기본으로 두고 실제 저장이 필요한 회원가입에만 쓰기 transaction을 연다.
@Service
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    // WHY: 중복 조회를 비싼 BCrypt보다 먼저 실행하되, exists와 INSERT 사이의 race는 DB unique 제약으로 다시 막는다.
    @Transactional
    fun signUp(request: UserSignUpRequest) {
        val email = normalizeEmail(request.email)
        // WHY: password의 앞뒤 공백도 사용자가 입력한 자격 정보이므로 임의로 trim하지 않는다.
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

    // WHY: 존재하지 않는 LOCAL 계정, OAuth 계정, 틀린 password는 같은 예외로 처리해 계정 존재 여부를 노출하지 않는다.
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

    // WHY: unique 위반만 중복 가입으로 바꾸고 다른 DB 무결성 오류는 중복으로 오분류하지 않는다.
    private fun DataIntegrityViolationException.isUniqueConstraintViolation(): Boolean {
        return generateSequence(cause) { it.cause }
            .filterIsInstance<ConstraintViolationException>()
            .any { it.kind == ConstraintViolationException.ConstraintKind.UNIQUE }
    }
}
