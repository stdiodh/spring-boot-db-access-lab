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
        // password의 앞뒤 공백도 사용자가 정한 자격 정보이므로 정규화하거나 trim하지 않습니다.
        val rawPassword = request.password

        // 흔한 중복은 비용이 큰 BCrypt보다 먼저 거르고, 동시 요청 경쟁은 아래 DB unique 제약으로 다시 막습니다.
        if (userRepository.existsByEmail(email)) {
            throw UserAlreadyExistsException()
        }

        // 비밀번호 원문을 DB에 남기지 않아야 저장소가 유출돼도 자격 정보가 그대로 노출되지 않습니다.
        val encodedPassword = requireNotNull(passwordEncoder.encode(rawPassword))

        // 사전 조회와 저장 사이에 다른 요청이 끼어도 DB 내부 오류 대신 같은 409 도메인 오류를 반환합니다.
        try {
            userRepository.saveAndFlush(
                User(
                    email = email,
                    password = encodedPassword
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
        // 가입 때와 같은 원문으로 비교해야 공백이 포함된 비밀번호도 정확히 인증할 수 있습니다.
        val rawPassword = request.password

        // 존재하지 않는 email도 비밀번호 불일치와 같은 예외로 처리해 계정 존재 여부를 노출하지 않습니다.
        val user = userRepository.findByEmail(email)
            .orElseThrow { InvalidCredentialsException() }

        // BCrypt는 같은 원문도 매번 다른 hash가 되므로 문자열 비교가 아니라 encoder 검증을 사용합니다.
        if (!passwordEncoder.matches(rawPassword, requireNotNull(user.password))) {
            throw InvalidCredentialsException()
        }

        // 자격 증명 확인이 끝난 뒤에만 subject가 담긴 Access Token과 만료 정보를 발급합니다.
        return TokenResponse(
            accessToken = jwtTokenProvider.createToken(requireNotNull(user.email)),
            expiresIn = jwtTokenProvider.expirationSeconds
        )
    }

    fun getCurrentUser(email: String): CurrentUserResponse {
        // 필터가 검증한 principal도 저장 규칙과 같은 방식으로 조회해 현재 신원을 확인합니다.
        val user = userRepository.findByEmail(normalizeEmail(email))
            .orElseThrow { InvalidCredentialsException() }

        return CurrentUserResponse(email = requireNotNull(user.email))
    }

    private fun normalizeEmail(email: String): String = email.lowercase(Locale.ROOT)

    private fun DataIntegrityViolationException.isUniqueConstraintViolation(): Boolean {
        return generateSequence(cause) { it.cause }
            .filterIsInstance<ConstraintViolationException>()
            .any { it.kind == ConstraintViolationException.ConstraintKind.UNIQUE }
    }
}
