/*
 * 실습 순서 06 — 회원가입·로그인 서비스
 * 선행 단계: Step01 요청 계약, Step02 DB 제약, Step04 예외, Step05 JwtTokenProvider를 사용합니다.
 * 이 단계의 판단: email 정규화·BCrypt·unique 경쟁 처리는 가입에, 자격 증명 확인·token 발급은 로그인에 둡니다.
 * 다음 연결: 발급된 token은 Step05 Filter를 지나 Step07의 보호 API에서 현재 사용자 신원이 됩니다.
 */
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
// 조회가 기본이므로 readOnly로 두고, 계정을 저장하는 signUp만 쓰기 transaction으로 덮어씁니다.
@Transactional(readOnly = true)
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @Transactional
    fun signUp(request: UserSignUpRequest) {
        // 실습 빈칸 대응: 가입 규칙과 사용자 저장 책임을 이 Service 경계에서 완성합니다.
        val email = normalizeEmail(request.email)
        // password의 앞뒤 공백도 사용자가 정한 자격 정보이므로 정규화하거나 trim하지 않습니다.
        val rawPassword = request.password

        // 설명 포인트: 빠른 사전 확인과 DB unique 제약은 서로 다른 중복 발생 시점을 맡습니다.
        // 확인 질문: 사전 조회만으로 동시에 들어온 같은 email 가입을 모두 막을 수 있을까요?
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
        // 실습 빈칸 대응: 자격 증명을 확인한 뒤에만 Access Token 응답을 만듭니다.
        val email = normalizeEmail(request.email)
        // 가입 때와 같은 원문으로 비교해야 공백이 포함된 비밀번호도 정확히 인증할 수 있습니다.
        val rawPassword = request.password

        // 설명 포인트: 없는 email과 틀린 password는 같은 실패로 보여 계정 존재 여부를 숨깁니다.
        val user = userRepository.findByEmail(email)
            .orElseThrow { InvalidCredentialsException() }

        // 확인 질문: BCrypt 결과를 문자열 동등 비교하면 왜 정상 password도 실패할까요?
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
        // 실습 빈칸 대응: 검증된 principal을 현재 사용자 응답으로 연결합니다.
        // 설명 포인트: 유효한 토큰의 subject도 현재 DB 계정 상태를 대신하지는 않습니다.
        // 확인 질문: 토큰의 email을 그대로 반환하지 않고 사용자를 다시 조회하는 이유는 무엇일까요?
        val user = userRepository.findByEmail(normalizeEmail(email))
            .orElseThrow { InvalidCredentialsException() }

        return CurrentUserResponse(email = requireNotNull(user.email))
    }

    // Locale.ROOT를 사용해야 서버 언어 설정과 무관하게 같은 email 정규화 결과를 얻습니다.
    private fun normalizeEmail(email: String): String = email.lowercase(Locale.ROOT)

    private fun DataIntegrityViolationException.isUniqueConstraintViolation(): Boolean {
        return generateSequence(cause) { it.cause }
            .filterIsInstance<ConstraintViolationException>()
            .any { it.kind == ConstraintViolationException.ConstraintKind.UNIQUE }
    }
}
