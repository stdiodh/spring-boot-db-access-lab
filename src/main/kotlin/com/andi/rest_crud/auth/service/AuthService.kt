package com.andi.rest_crud.auth.service

import com.andi.rest_crud.auth.dto.CurrentUserResponse
import com.andi.rest_crud.auth.dto.LoginRequest
import com.andi.rest_crud.auth.dto.TokenResponse
import com.andi.rest_crud.auth.dto.UserSignUpRequest
import com.andi.rest_crud.auth.exception.InvalidCredentialsException
import com.andi.rest_crud.auth.exception.UserAlreadyExistsException
import com.andi.rest_crud.auth.security.JwtTokenProvider
import com.andi.rest_crud.user.domain.User
import com.andi.rest_crud.user.repository.UserRepository
import org.hibernate.exception.ConstraintViolationException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.Locale

@Service
// 조회가 기본이므로 readOnly로 두고, 계정을 저장하는 signUp만 쓰기 transaction으로 덮어씁니다.
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

        // 빠른 사전 확인과 DB unique 제약은 서로 다른 중복 발생 시점을 맡습니다.
        if (userRepository.existsByEmail(email)) {
            throw UserAlreadyExistsException()
        }

        // 비밀번호 원문을 DB에 남기지 않아야 저장소가 유출돼도 자격 정보가 그대로 노출되지 않습니다.
        val encodedPassword = requireNotNull(passwordEncoder.encode(rawPassword))

        // 사전 조회와 저장 사이에 다른 요청이 끼어도 DB 내부 오류 대신 같은 409 도메인 오류를 반환합니다.
        try {
            // flush를 여기서 강제해야 unique 위반이 transaction 종료 뒤가 아니라 try/catch 안에서 발생합니다.
            userRepository.saveAndFlush(
                User(
                    email = email,
                    password = encodedPassword,
                    localPasswordEnabled = true
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

        // 없는 email과 틀린 password는 같은 실패로 보여 계정 존재 여부를 숨깁니다.
        val user = userRepository.findByEmail(email)
            .orElseThrow { InvalidCredentialsException() }

        // BCrypt 결과는 매번 달라질 수 있으므로 문자열 동등 비교 대신 encoder를 사용합니다.
        if (!user.localPasswordEnabled || !passwordEncoder.matches(rawPassword, requireNotNull(user.password))) {
            throw InvalidCredentialsException()
        }

        // 자격 증명 확인이 끝난 뒤에만 subject가 담긴 Access Token과 만료 정보를 발급합니다.
        return TokenResponse(
            accessToken = jwtTokenProvider.createToken(requireNotNull(user.email)),
            expiresIn = jwtTokenProvider.expirationSeconds
        )
    }

    fun getCurrentUser(email: String): CurrentUserResponse {
        // 유효한 토큰의 subject도 현재 DB 계정 상태를 대신하지 않으므로 사용자를 다시 조회합니다.
        val user = userRepository.findByEmail(normalizeEmail(email))
            .orElseThrow { InvalidCredentialsException() }

        val loginMethods = linkedSetOf<String>()
        if (user.authProvider.isNotBlank()) {
            loginMethods += user.authProvider
        }
        if (user.localPasswordEnabled) {
            loginMethods += LOCAL_LOGIN_METHOD
        }

        return CurrentUserResponse(
            email = requireNotNull(user.email),
            loginMethods = loginMethods.toList()
        )
    }

    // Locale.ROOT를 사용해야 서버 언어 설정과 무관하게 같은 email 정규화 결과를 얻습니다.
    private fun normalizeEmail(email: String): String = email.lowercase(Locale.ROOT)

    private fun DataIntegrityViolationException.isUniqueConstraintViolation(): Boolean {
        return generateSequence(cause) { it.cause }
            .filterIsInstance<ConstraintViolationException>()
            .any { it.kind == ConstraintViolationException.ConstraintKind.UNIQUE }
    }

    private companion object {
        const val LOCAL_LOGIN_METHOD = "LOCAL"
    }
}
